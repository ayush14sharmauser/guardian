import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Severity = "critical" | "high" | "medium" | "low";

type PullRequest = {
  title: string;
  summary: string;
  changes: string[];
  commitMessage: string;
};

type Finding = {
  type: string;
  severity: Severity;
  file: string;
  line: number;
  message: string;

  investigation?: {
    reason: string;
    recommendation: string;
    confidence: "high" | "medium" | "low";
    context: string;

    patch?: {
      title: string;
      before: string;
      after: string;
      explanation: string;
    };
  };

  verification?: {
    status: "Fixed" | "Not Fixed";
    reason: string;
    recommendation: string;
  };

  pullRequest?: PullRequest;
};

type AnalysisResult = {
  summary: Record<Severity, number>;
  findings: Finding[];
  risk: {
    score: number;
    level: "Critical" | "High" | "Medium" | "Low";
    explanation: string[];
  };
  meta: {
    filesScanned: number;
    filesSkipped: number;
    filesFailed: number;
    truncated: boolean;
    // Presentational metadata for the dashboard — populated from data the
    // scan already fetches (repository details), no extra API calls added.
    owner: string;
    repository: string;
    branch: string;
  };
  warnings: string[];
};

type GitHubRepository = {
  default_branch: string;
};

type GitHubRef = {
  object: {
    sha: string;
  };
};

type GitHubCommit = {
  tree: {
    sha: string;
  };
};

type GitHubTree = {
  tree: Array<{
    path: string;
    type: "blob" | "tree" | "commit";
    sha: string;
    size?: number;
  }>;
  truncated: boolean;
};

type GitHubBlob = {
  encoding: "base64";
  content: string;
};

type SecretPattern = {
  type: string;
  severity: Severity;
  expression: RegExp;
  message: string;
};

const secretPatterns: SecretPattern[] = [
  {
    type: "Private Key",
    severity: "critical",
    expression: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/g,
    message: "Private key block detected.",
  },
  {
    type: "AWS Access Key",
    severity: "critical",
    expression: /\b(?:AKIA|ASIA|A3T[A-Z0-9]|AGPA|AIDA|AROA)[A-Z0-9]{16}\b/g,
    message: "Possible AWS access key detected.",
  },
  {
    type: "AWS Secret Key",
    severity: "critical",
    expression: /(?:aws_)?secret(?:_access)?_key\s*[=:]\s*["']?[A-Za-z0-9/+]{40}["']?/gi,
    message: "Possible AWS secret access key detected.",
  },
  {
    type: "GitHub Token",
    severity: "high",
    expression: /\b(?:gh[pousr]_[A-Za-z0-9_]{36,255}|github_pat_[A-Za-z0-9_]{22,255})\b/g,
    message: "Possible GitHub token detected.",
  },
  {
    type: "OpenAI Key",
    severity: "high",
    expression: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
    message: "Possible OpenAI API key detected.",
  },
  {
    type: "Firebase Key",
    severity: "high",
    expression: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    message: "Possible Firebase API key detected.",
  },
  {
    type: "Stripe Key",
    severity: "high",
    expression: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    message: "Possible Stripe key detected.",
  },
  {
    type: "Hardcoded API Key",
    severity: "high",
    expression: /["']?(?:api[_-]?key|apikey|api[_-]?secret|client[_-]?secret)["']?\s*[=:]\s*["']?(?!process\.env\b|import\.meta\.env\b)[A-Za-z0-9._~+/=-]{8,}["']?/gi,
    message: "Possible API key detected.",
  },
  {
    type: "Password Assignment",
    severity: "high",
    expression: /["']?(?:password|passwd|pwd)["']?\s*[=:]\s*["']?(?!process\.env\b|import\.meta\.env\b)[^\s"'\r\n]{4,}["']?/gi,
    message: "Possible hardcoded password detected.",
  },
  {
    type: "Secret Assignment",
    severity: "high",
    expression: /["']?(?:secret|client_secret)["']?\s*[=:]\s*["']?(?!process\.env\b|import\.meta\.env\b)[^\s"'\r\n]{8,}["']?/gi,
    message: "Possible hardcoded secret detected.",
  },
  {
    type: "Token Assignment",
    severity: "high",
    expression: /["']?(?:token|access_token|auth_token)["']?\s*[=:]\s*["']?(?!process\.env\b|import\.meta\.env\b)[^\s"'\r\n]{8,}["']?/gi,
    message: "Possible hardcoded token detected.",
  },
];

// ---- Filtering so we never fetch blobs that can't matter ----

const SKIPPED_DIR_SEGMENTS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
  "coverage",
  "vendor",
  "__pycache__",
  ".venv",
  "venv",
  "target",
  ".turbo",
  ".cache",
]);

const SKIPPED_EXTENSIONS = new Set([
  // images
  "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "bmp", "avif",
  // fonts
  "woff", "woff2", "ttf", "eot", "otf",
  // media
  "mp4", "mp3", "mov", "avi", "webm", "wav", "ogg",
  // archives / binaries
  "zip", "tar", "gz", "7z", "rar", "exe", "dll", "so", "bin", "wasm",
  "pdf", "class", "jar", "pyc",
  // lockfiles / generated (rarely contain secrets, huge, slow to scan)
  "lock",
]);

const SKIPPED_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
]);

// Anything bigger than this is almost certainly a bundle/asset, not source.
const MAX_FILE_SIZE_BYTES = 400_000; // 400 KB

function shouldSkipPath(path: string, size: number | undefined): boolean {
  const segments = path.split("/");

  if (segments.some((segment) => SKIPPED_DIR_SEGMENTS.has(segment))) {
    return true;
  }

  const filename = segments[segments.length - 1];

  if (SKIPPED_FILENAMES.has(filename)) {
    return true;
  }

  const extMatch = filename.match(/\.([A-Za-z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";

  if (ext && SKIPPED_EXTENSIONS.has(ext)) {
    return true;
  }

  if (typeof size === "number" && size > MAX_FILE_SIZE_BYTES) {
    return true;
  }

  return false;
}

// ---- Bounded concurrency map so we don't fire unlimited requests ----

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run(),
  );

  await Promise.all(workers);
  return results;
}

const BLOB_FETCH_CONCURRENCY = 5;
const MAX_FILES_TO_SCAN = 1000;
const MAX_FAILED_BLOBS = 50;

function parseRepositoryUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    const parts = url.pathname.split("/").filter(Boolean);

    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "github.com" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      parts.length !== 2
    ) {
      return null;
    }

    const [owner, repositoryWithExtension] = parts;
    const repository = repositoryWithExtension.replace(/\.git$/i, "");

    if (
      !/^[A-Za-z0-9_.-]+$/.test(owner) ||
      !/^[A-Za-z0-9_.-]+$/.test(repository)
    ) {
      return null;
    }

    return { owner, repository };
  } catch {
    return null;
  }
}

async function githubRequest<T>(path: string, retries = 3): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Guardian-AI-Repository-Analyzer",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const isRateLimited =
      response.status === 429 ||
      (response.status === 403 &&
        response.headers.get("x-ratelimit-remaining") === "0") ||
      (response.status === 403 && response.headers.has("retry-after"));

    if (isRateLimited && retries > 0) {
      const retryAfterHeader = response.headers.get("retry-after");
      const resetHeader = response.headers.get("x-ratelimit-reset");

      let delayMs: number;
      if (retryAfterHeader) {
        delayMs = Number(retryAfterHeader) * 1000;
      } else if (resetHeader) {
        delayMs = Math.max(0, Number(resetHeader) * 1000 - Date.now());
      } else {
        delayMs = 2000 * (4 - retries); // simple backoff: 2s, 4s, 6s
      }

      // Cap the wait so one rate-limited request can't stall the whole scan for minutes
      delayMs = Math.min(delayMs, 15_000);

      console.warn(
        `[rate-limit] ${path} — status ${response.status}, waiting ${delayMs}ms, ${retries} retr${retries === 1 ? "y" : "ies"} left`,
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return githubRequest<T>(path, retries - 1);
    }

    const message = await response.text();

    console.error("========== GitHub API Error ==========");
    console.error("Status:", response.status);
    console.error("Path:", path);
    console.error("Response:", message);
    console.error("=====================================");

    throw new Error(`GitHub API error (${response.status}): ${message}`);
  }

  return response.json() as Promise<T>;
}

function getLineNumber(content: string, index: number) {
  return content.slice(0, index).split("\n").length;
}

function addFinding(
  result: AnalysisResult,
  finding: Finding,
  seen: Set<string>,
) {
  const key = `${finding.file}:${finding.line}:${finding.type}`;

  if (seen.has(key)) {
    return;
  }

  seen.add(key);

  result.findings.push(finding);
  result.summary[finding.severity] += 1;
}

function generatePatch(type: string, matchedSecret: string) {
  switch (type) {
    case "OpenAI Key":
      return {
        title: "Move API key to environment variable",
        before: matchedSecret,
        after: "process.env.OPENAI_API_KEY",
        explanation:
          "Store the API key in an environment variable instead of committing it to source control.",
      };

    case "GitHub Token":
      return {
        title: "Move GitHub token to environment variable",
        before: matchedSecret,
        after: "process.env.GITHUB_TOKEN",
        explanation:
          "Use an environment variable and rotate the exposed token.",
      };

    case "AWS Access Key":
      return {
        title: "Replace AWS key",
        before: matchedSecret,
        after: "process.env.AWS_ACCESS_KEY_ID",
        explanation:
          "Never commit AWS credentials. Rotate the exposed key and load it from the environment.",
      };

    default:
      return {
        title: "Move secret to environment variable",
        before: matchedSecret,
        after: "process.env.SECRET",
        explanation:
          "Secrets should never be stored in source code.",
      };
  }
}

// ---- AI Pull Request Generator ----
// Generates a *proposed* pull request description for a finding. This never
// talks to GitHub and never opens a real PR — it only produces text that the
// user can review and act on manually.

function generatePullRequest(type: string): PullRequest {
  switch (type) {
    case "OpenAI Key":
      return {
        title: "Remove hardcoded OpenAI API key",
        summary:
          "A hardcoded OpenAI API key was detected in the repository. The key should be removed immediately and replaced with an environment variable.",
        changes: [
          "Remove the exposed key",
          "Replace it with process.env.OPENAI_API_KEY",
          "Rotate the compromised credential",
          "Update deployment secrets",
        ],
        commitMessage: "fix(security): remove hardcoded OpenAI API key",
      };

    case "GitHub Token":
      return {
        title: "Remove exposed GitHub token",
        summary:
          "A GitHub token was found hardcoded in the repository. It should be deleted from source and replaced with an environment variable.",
        changes: [
          "Delete hardcoded token",
          "Replace with process.env.GITHUB_TOKEN",
          "Rotate the exposed token",
        ],
        commitMessage: "fix(security): remove exposed github token",
      };

    case "AWS Access Key":
    case "AWS Secret Key":
      return {
        title: "Remove exposed AWS credentials",
        summary:
          "AWS credentials were found hardcoded in the repository. They should be removed and replaced with environment-based configuration.",
        changes: [
          "Remove AWS credentials",
          "Replace with environment variables",
          "Rotate credentials",
        ],
        commitMessage: "fix(security): remove exposed aws credentials",
      };

    case "Private Key":
      return {
        title: "Remove hardcoded private key",
        summary:
          "A private key was found committed to the repository. It should be removed from source control and rotated immediately, since it may already be compromised.",
        changes: [
          "Remove the private key file or block from the codebase",
          "Purge the key from repository history",
          "Rotate the compromised key pair",
          "Store the new key in a secure secret manager",
        ],
        commitMessage: "fix(security): remove hardcoded private key",
      };

    case "Firebase Key":
      return {
        title: "Remove hardcoded Firebase API key",
        summary:
          "A Firebase API key was found hardcoded in the repository. It should be moved to an environment variable and its restrictions reviewed.",
        changes: [
          "Remove the hardcoded Firebase key",
          "Replace it with process.env.FIREBASE_API_KEY",
          "Review Firebase key restrictions in the console",
          "Update deployment secrets",
        ],
        commitMessage: "fix(security): remove hardcoded firebase api key",
      };

    case "Stripe Key":
      return {
        title: "Remove hardcoded Stripe key",
        summary:
          "A Stripe API key was found hardcoded in the repository. It should be removed immediately and rotated, as it may grant access to payment data.",
        changes: [
          "Remove the exposed Stripe key",
          "Replace it with process.env.STRIPE_SECRET_KEY",
          "Rotate the compromised key from the Stripe dashboard",
          "Update deployment secrets",
        ],
        commitMessage: "fix(security): remove hardcoded stripe key",
      };

    case "Exposed .env":
      return {
        title: "Remove exposed environment file",
        summary:
          "An environment file (.env) was found committed to the repository. It likely contains secrets and should be removed from source control.",
        changes: [
          "Remove the .env file from the repository",
          "Add .env to .gitignore",
          "Purge the file from repository history",
          "Rotate any credentials it contained",
        ],
        commitMessage: "fix(security): remove exposed .env file",
      };

    default: {
      // Generic security pull request for any other finding type
      // (Hardcoded API Key, Password Assignment, Secret Assignment,
      // Token Assignment, or anything else not explicitly handled above).
      const lowerType = type.toLowerCase();

      return {
        title: `Remove hardcoded ${lowerType}`,
        summary: `A ${lowerType} was detected in the repository. It should be removed from source code and replaced with a secure environment variable.`,
        changes: [
          "Remove the hardcoded secret",
          "Replace it with an environment variable",
          "Rotate the credential if it may have been exposed",
          "Update deployment secrets",
        ],
        commitMessage: `fix(security): remove exposed ${lowerType}`,
      };
    }
  }
}

function investigateFinding(
  type: string,
  content: string,
  matchIndex: number,
  matchedSecret: string,
) {
  const lines = content.split("\n");
  const lineNumber = getLineNumber(content, matchIndex);

  const start = Math.max(0, lineNumber - 3);
  const end = Math.min(lines.length, lineNumber + 2);

  const context = lines
    .slice(start, end)
    .map((line) =>
      line
        // Redact private key content
        .replace(
          /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----.*$/gi,
          "[REDACTED PRIVATE KEY]",
        )

        // Redact known GitHub/OpenAI/AWS-style tokens
        .replace(
          /\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|sk-(?:proj-)?[A-Za-z0-9_-]+|AKIA[A-Z0-9]{16})\b/g,
          "[REDACTED]",
        )

        // Redact values assigned to sensitive variables
        .replace(
          /((?:[A-Za-z0-9_]*(?:TOKEN|KEY|SECRET|PASSWORD|PASSWD|PWD)[A-Za-z0-9_]*)\s*[=:]\s*["'`]?)[^"'`,;\s}]+/gi,
          "$1[REDACTED]",
        )

        // Redact JSON/object values such as token: "secret123"
        .replace(
          /((?:token|access_token|auth_token|api_key|secret|password)\s*:\s*["'`])([^"'`]+)(["'`])/gi,
          "$1[REDACTED]$3",
        ),
    )
    .join("\n");

  const safeContext = context.replaceAll(matchedSecret, "[REDACTED]");

  const recommendations: Record<string, string> = {
    "Private Key":
      "Remove the private key from the repository, revoke or rotate it, and store the replacement in a secure secret manager.",
    "AWS Access Key":
      "Revoke the exposed AWS credentials immediately and use IAM roles or environment variables.",
    "AWS Secret Key":
      "Rotate the AWS secret key immediately and remove it from the repository history.",
    "GitHub Token":
      "Revoke the exposed GitHub token and create a new token with minimum required permissions.",
    "OpenAI Key":
      "Revoke the exposed API key and store the replacement in an environment variable or secret manager.",
    "Firebase Key":
      "Review the Firebase key restrictions and move sensitive credentials out of source code.",
    "Stripe Key":
      "Revoke and rotate the Stripe key immediately and store the replacement securely.",
  };

  return {
    context: safeContext,
    reason: `${type} appears to be hardcoded in the repository and may expose sensitive credentials.`,
    recommendation:
      recommendations[type] ??
      "Remove the hardcoded credential, rotate it if necessary, and store secrets using environment variables or a secret manager.",
    confidence: "high" as const,
    patch: generatePatch(type, matchedSecret),
  };
}

// ---- Verification: re-checks a finding against the already-downloaded
// content from this same scan. No new GitHub requests are made. ----

function verifyFinding(content: string, matchedSecret: string) {
  const stillPresent = content.includes(matchedSecret);

  if (stillPresent) {
    return {
      status: "Not Fixed" as const,
      reason: "The detected secret still exists in the repository.",
      recommendation:
        "Remove the secret, rotate the credential, and scan again.",
    };
  }

  return {
    status: "Fixed" as const,
    reason: "The secret is no longer present.",
    recommendation: "No further action required.",
  };
}

function scanFile(
  content: string,
  file: string,
  result: AnalysisResult,
  seen: Set<string>,
) {
  for (const pattern of secretPatterns) {
    pattern.expression.lastIndex = 0;

    for (const match of content.matchAll(pattern.expression)) {
      const matchedSecret = match[0];

      addFinding(
        result,
        {
          type: pattern.type,
          severity: pattern.severity,
          file,
          line: getLineNumber(content, match.index ?? 0),
          message: pattern.message,
          investigation: investigateFinding(
            pattern.type,
            content,
            match.index ?? 0,
            matchedSecret,
          ),
          verification: verifyFinding(content, matchedSecret),
          pullRequest: generatePullRequest(pattern.type),
        },
        seen,
      );
    }
  }
}

function calculateRisk(result: AnalysisResult) {
  let score = 100;

  score -= result.summary.critical * 35;
  score -= result.summary.high * 15;
  score -= result.summary.medium * 8;
  score -= result.summary.low * 3;

  score = Math.max(score, 0);

  let level: "Critical" | "High" | "Medium" | "Low";

  if (score < 25) level = "Critical";
  else if (score < 50) level = "High";
  else if (score < 75) level = "Medium";
  else level = "Low";

  const explanation: string[] = [];

  if (result.summary.critical)
    explanation.push(
      `${result.summary.critical} critical secret(s) detected.`,
    );

  if (result.summary.high)
    explanation.push(
      `${result.summary.high} high-risk credential(s) detected.`,
    );

  if (!explanation.length)
    explanation.push("No sensitive credentials were detected.");

  return {
    score,
    level,
    explanation,
  };
}

export async function POST(request: Request) {
  let body: { repositoryUrl?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must contain valid JSON." },
      { status: 400 },
    );
  }

  const repositoryDetails = parseRepositoryUrl(body?.repositoryUrl);

  if (!repositoryDetails) {
    return NextResponse.json(
      { error: "repositoryUrl must be a valid public GitHub repository URL." },
      { status: 400 },
    );
  }

  const { owner, repository } = repositoryDetails;
  const repositoryPath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;

  const result: AnalysisResult = {
    summary: { critical: 0, high: 0, medium: 0, low: 0 },
    findings: [],

    risk: {
      score: 100,
      level: "Low",
      explanation: [],
    },

    meta: {
      filesScanned: 0,
      filesSkipped: 0,
      filesFailed: 0,
      truncated: false,
      // Populated below once we know the default branch. Owner/repository
      // are already known from the validated request URL.
      owner,
      repository,
      branch: "",
    },

    warnings: [],
  };

  const scanStartedAt = Date.now();

  try {
    const repositoryData = await githubRequest<GitHubRepository>(repositoryPath);
    const branch = encodeURIComponent(repositoryData.default_branch);
    result.meta.branch = repositoryData.default_branch;

    const ref = await githubRequest<GitHubRef>(
      `${repositoryPath}/git/ref/heads/${branch}`,
    );
    const commit = await githubRequest<GitHubCommit>(
      `${repositoryPath}/git/commits/${ref.object.sha}`,
    );
    const tree = await githubRequest<GitHubTree>(
      `${repositoryPath}/git/trees/${commit.tree.sha}?recursive=1`,
    );

    const seen = new Set<string>();

    if (tree.truncated) {
      result.warnings.push(
        "GitHub truncated the file tree for this repository (it's very large or very deep). Some files may not have been scanned.",
      );
      result.meta.truncated = true;
    }

    // Flag exposed .env files up front (cheap, no fetch needed for the flag itself)
    for (const item of tree.tree) {
      if (item.type !== "blob") continue;
      if (item.path === ".env" || item.path.startsWith(".env.")) {
        addFinding(
          result,
          {
            type: "Exposed .env",
            severity: "high",
            file: item.path,
            line: 1,
            message: "Environment file found in the repository.",
            verification: {
              status: "Not Fixed",
              reason:
                "The .env file is still present in the repository's file tree.",
              recommendation:
                "Remove the file from the repository, rotate any credentials it contained, and scan again.",
            },
            pullRequest: generatePullRequest("Exposed .env"),
          },
          seen,
        );
      }
    }

    // ---- Priority scoring for candidate selection ----
    // Files most likely to contain secrets are scanned first.

    

    const PRIORITY_SECRET_EXTENSIONS = new Set([
      "pem", "key", "p12", "pfx",
    ]);

    const SOURCE_EXTENSIONS = new Set([
      "ts", "tsx", "js", "jsx", "mjs", "cjs",
      "py", "java", "go", "rb", "php", "cs", "cpp", "c", "h", "rs",
    ]);

    const CONFIG_EXTENSIONS = new Set([
      "json", "yaml", "yml", "toml", "ini", "properties",
    ]);

    function getFilePriority(path: string): number {
      const filename = path.split("/").pop() ?? "";
      const extMatch = filename.match(/\.([A-Za-z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : "";

      // Highest priority: .env files and secret key files
      if (filename === ".env" || filename.startsWith(".env.")) return 3;
      if (PRIORITY_SECRET_EXTENSIONS.has(ext)) return 3;

      // Medium priority: source code files
      if (SOURCE_EXTENSIONS.has(ext)) return 2;

      // Lower priority: configuration files
      if (CONFIG_EXTENSIONS.has(ext)) return 1;

      // Lowest priority: everything else
      return 0;
    }

    // Only fetch blobs worth scanning
    const allBlobs = tree.tree.filter((item) => item.type === "blob");
    let candidates = allBlobs
      .filter((item) => !shouldSkipPath(item.path, item.size))
      .sort((a, b) => getFilePriority(b.path) - getFilePriority(a.path));

    const totalCandidates = candidates.length;
    candidates = candidates.slice(0, MAX_FILES_TO_SCAN);

    if (totalCandidates > MAX_FILES_TO_SCAN) {
      result.warnings.push(
        "Repository scan was limited to the first 1000 files to improve performance.",
      );
    }

    result.meta.filesSkipped = allBlobs.length - candidates.length;

    let stoppedEarly = false;

    await mapWithConcurrency(candidates, BLOB_FETCH_CONCURRENCY, async (item) => {
      if (stoppedEarly) return;

      try {
        const blob = await githubRequest<GitHubBlob>(
          `${repositoryPath}/git/blobs/${item.sha}`,
          0,
        );

        if (!blob.content || blob.encoding !== "base64") {
          return;
        }

        const content = Buffer.from(
          blob.content.replace(/\n/g, ""),
          "base64",
        ).toString("utf8");

        if (!content.includes("\0")) {
          scanFile(content, item.path, result, seen);
        }

        result.meta.filesScanned += 1;
      } catch (error) {
        result.meta.filesFailed += 1;
        console.error(`Skipping ${item.path}:`, error);

        if (result.meta.filesFailed > MAX_FAILED_BLOBS) {
          stoppedEarly = true;
          result.warnings.push(
            "Scan stopped early because GitHub rate limits were reached. Partial results are shown.",
          );
        }
      }
    });

    if (result.meta.filesFailed > 0) {
      result.warnings.push(
        `${result.meta.filesFailed} file(s) could not be fetched (likely rate limiting) and were skipped.`,
      );
    }

    console.log(
      `[scan complete] ${owner}/${repository} — ${Date.now() - scanStartedAt}ms — scanned: ${result.meta.filesScanned}, skipped: ${result.meta.filesSkipped}, failed: ${result.meta.filesFailed}, candidates: ${candidates.length}`,
    );

    result.risk = calculateRisk(result);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to analyze this GitHub repository.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}