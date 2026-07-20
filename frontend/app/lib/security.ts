// Pure data + logic layer for the security dashboard.
// Nothing here touches the DOM or React — safe to unit test, safe to reuse
// between the analyzer dashboard and the printable report.

// ---------------------------------------------------------------------------
// Shared literals — single source of truth for repeated string values
// ---------------------------------------------------------------------------

export type Severity = "critical" | "high" | "medium" | "low";

export const RISK_LEVELS = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
} as const;
export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];

export const VERIFICATION_STATUS = {
  FIXED: "Fixed",
  NOT_FIXED: "Not Fixed",
} as const;
export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// ---------------------------------------------------------------------------
// Analysis result types
// ---------------------------------------------------------------------------

export type AnalysisResult = {
  summary: Record<Severity, number>;
  findings: Array<{
    type: string;
    severity: Severity;
    file: string;
    line: number;
    message: string;
    investigation?: {
      patch?: {
        title: string;
        before: string;
        after: string;
        explanation: string;
      };
      reason: string;
      recommendation: string;
      confidence: "high" | "medium" | "low";
      context: string;
    };
    verification?: {
      status: VerificationStatus;          // was "Fixed" | "Not Fixed"
      reason: string;
      recommendation: string;
    };
    pullRequest?: {
      title: string;
      summary: string;
      changes: string[];
      commitMessage: string;
    };
  }>;
  risk: {
    score: number;
    level: RiskLevel;                      // was "Critical" | "High" | "Medium" | "Low"
    explanation: string[];
  };
  meta: {
    filesScanned: number;
    filesSkipped: number;
    filesFailed: number;
    truncated: boolean;
    owner: string;
    repository: string;
    branch: string;
  };
  warnings: string[];
};

export type FindingItem = AnalysisResult["findings"][number];

// ---------------------------------------------------------------------------
// Severity configuration
// ---------------------------------------------------------------------------

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

export const summaryItems: Array<{ label: string; severity: Severity }> = [
  { label: RISK_LEVELS.CRITICAL, severity: "critical" },
  { label: RISK_LEVELS.HIGH, severity: "high" },
  { label: RISK_LEVELS.MEDIUM, severity: "medium" },
  { label: RISK_LEVELS.LOW, severity: "low" },
];

// Tailwind class fragments per severity, shared by badges, dots and cards.
export const severityStyles: Record<Severity, string> = {
  critical: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  high: "border-orange-300/25 bg-orange-300/10 text-orange-200",
  medium: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  low: "border-sky-300/25 bg-sky-300/10 text-sky-200",
};

export const severityDotStyles: Record<Severity, string> = {
  critical: "bg-rose-400",
  high: "bg-orange-300",
  medium: "bg-amber-300",
  low: "bg-sky-300",
};

export function severityRank(severity: Severity): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[severity];
}

export const loadingSteps = [
  "Fetching repository",
  "Downloading repository tree",
  "Detecting secrets",
  "AI investigation",
  "Calculating risk",
  "Generating patches",
  "Preparing AI pull requests",
];

// ---------------------------------------------------------------------------
// Security grade — derived entirely from risk.score. Pure mapping, no I/O.
// ---------------------------------------------------------------------------

export type GradeInfo = {
  grade: string;
  description: string;
  textClass: string;
  ringClass: string;
  badgeClass: string;
  hex: string;
};

export function getSecurityGrade(score: number): GradeInfo {
  if (score >= 95) {
    return {
      grade: "A+",
      description: "Excellent",
      textClass: "text-emerald-300",
      ringClass: "border-emerald-300/25 bg-emerald-400/[0.06]",
      badgeClass: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
      hex: "#4ADE80",
    };
  }
  if (score >= 90) {
    return {
      grade: "A",
      description: "Excellent",
      textClass: "text-emerald-300",
      ringClass: "border-emerald-300/25 bg-emerald-400/[0.06]",
      badgeClass: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
      hex: "#4ADE80",
    };
  }
  if (score >= 80) {
    return {
      grade: "B",
      description: "Good",
      textClass: "text-cyan-300",
      ringClass: "border-cyan-300/25 bg-cyan-400/[0.06]",
      badgeClass: "border-cyan-300/25 bg-cyan-400/10 text-cyan-200",
      hex: "#22D3EE",
    };
  }
  if (score >= 70) {
    return {
      grade: "C",
      description: "Needs Improvement",
      textClass: "text-amber-300",
      ringClass: "border-amber-300/25 bg-amber-400/[0.06]",
      badgeClass: "border-amber-300/25 bg-amber-400/10 text-amber-200",
      hex: "#FBBF24",
    };
  }
  if (score >= 50) {
    return {
      grade: "D",
      description: "High Risk",
      textClass: "text-orange-300",
      ringClass: "border-orange-300/25 bg-orange-400/[0.06]",
      badgeClass: "border-orange-300/25 bg-orange-400/10 text-orange-200",
      hex: "#FB923C",
    };
  }
  return {
    grade: "F",
    description: "Critical",
    textClass: "text-rose-300",
    ringClass: "border-rose-300/25 bg-rose-400/[0.06]",
    badgeClass: "border-rose-300/25 bg-rose-400/10 text-rose-200",
    hex: "#FB7185",
  };
}

// ---------------------------------------------------------------------------
// Finding categorization — groups the scanner's `type` strings for display.
// ---------------------------------------------------------------------------

export type CategoryDef = {
  key: string;
  label: string;
  icon: "cloud" | "key" | "lock" | "shield" | "file" | "token" | "dots";
  types: string[];
};

export const categoryDefs: CategoryDef[] = [
  {
    key: "cloud",
    label: "Cloud Credentials",
    icon: "cloud",
    types: ["AWS Access Key", "AWS Secret Key", "Firebase Key"],
  },
  {
    key: "api",
    label: "API Keys",
    icon: "key",
    types: ["OpenAI Key", "Stripe Key", "Hardcoded API Key"],
  },
  {
    key: "auth",
    label: "Authentication",
    icon: "lock",
    types: ["Password Assignment"],
  },
  {
    key: "private",
    label: "Private Keys",
    icon: "shield",
    types: ["Private Key"],
  },
  {
    key: "env",
    label: "Environment Files",
    icon: "file",
    types: ["Exposed .env"],
  },
  {
    key: "tokens",
    label: "Tokens",
    icon: "token",
    types: ["GitHub Token", "Secret Assignment", "Token Assignment"],
  },
];

// Precomputed type→category lookup for O(1) per finding. Keeping this local
// avoids a top‑level Map while still being easy to read.
function buildTypeToCategoryMap(): Map<string, CategoryDef> {
  const m = new Map<string, CategoryDef>();
  for (const def of categoryDefs) {
    for (const t of def.types) {
      m.set(t, def);
    }
  }
  return m;
}

const TYPE_TO_CATEGORY = buildTypeToCategoryMap();

export function categorizeFindings(
  findings: FindingItem[],
): Array<{ def: CategoryDef; findings: FindingItem[] }> {
  const buckets = new Map<string, FindingItem[]>();
  for (const def of categoryDefs) buckets.set(def.key, []);
  buckets.set("other", []);

  for (const finding of findings) {
    const def = TYPE_TO_CATEGORY.get(finding.type);
    buckets.get(def ? def.key : "other")?.push(finding);
  }

  const other: CategoryDef = { key: "other", label: "Other", icon: "dots", types: [] };

  return [...categoryDefs, other]
    .map((def) => ({ def, findings: buckets.get(def.key) ?? [] }))
    .filter((group) => group.findings.length > 0);
}

// ---------------------------------------------------------------------------
// MITRE ATT&CK / OWASP Top 10 mappings — static lookups keyed by finding type.
// ---------------------------------------------------------------------------

export type FrameworkRef = { id: string; name: string };

const MITRE_MAP: Record<string, FrameworkRef[]> = {
  "Private Key": [
    { id: "T1552.004", name: "Private Keys" },
    { id: "T1078", name: "Valid Accounts" },
  ],
  "AWS Access Key": [
    { id: "T1552.001", name: "Credentials In Files" },
    { id: "T1078.004", name: "Cloud Accounts" },
  ],
  "AWS Secret Key": [
    { id: "T1552.001", name: "Credentials In Files" },
    { id: "T1078.004", name: "Cloud Accounts" },
  ],
  "GitHub Token": [
    { id: "T1528", name: "Steal Application Access Token" },
    { id: "T1552.001", name: "Credentials In Files" },
  ],
  "OpenAI Key": [
    { id: "T1528", name: "Steal Application Access Token" },
    { id: "T1552.001", name: "Credentials In Files" },
  ],
  "Firebase Key": [
    { id: "T1552.001", name: "Credentials In Files" },
    { id: "T1078.004", name: "Cloud Accounts" },
  ],
  "Stripe Key": [
    { id: "T1528", name: "Steal Application Access Token" },
    { id: "T1552.001", name: "Credentials In Files" },
  ],
  "Hardcoded API Key": [
    { id: "T1552.001", name: "Credentials In Files" },
  ],
  "Password Assignment": [
    { id: "T1552.001", name: "Credentials In Files" },
    { id: "T1078", name: "Valid Accounts" },
  ],
  "Secret Assignment": [
    { id: "T1552.001", name: "Credentials In Files" },
  ],
  "Token Assignment": [
    { id: "T1528", name: "Steal Application Access Token" },
    { id: "T1552.001", name: "Credentials In Files" },
  ],
  "Exposed .env": [
    { id: "T1552.001", name: "Credentials In Files" },
    { id: "T1552", name: "Unsecured Credentials" },
  ],
};
const DEFAULT_MITRE: FrameworkRef[] = [
  { id: "T1552", name: "Unsecured Credentials" },
];

const OWASP_MAP: Record<string, FrameworkRef[]> = {
  "Private Key": [{ id: "A02", name: "Cryptographic Failures" }],
  "AWS Access Key": [
    { id: "A02", name: "Cryptographic Failures" },
    { id: "A05", name: "Security Misconfiguration" },
  ],
  "AWS Secret Key": [
    { id: "A02", name: "Cryptographic Failures" },
    { id: "A05", name: "Security Misconfiguration" },
  ],
  "GitHub Token": [{ id: "A02", name: "Cryptographic Failures" }],
  "OpenAI Key": [{ id: "A02", name: "Cryptographic Failures" }],
  "Firebase Key": [
    { id: "A02", name: "Cryptographic Failures" },
    { id: "A05", name: "Security Misconfiguration" },
  ],
  "Stripe Key": [{ id: "A02", name: "Cryptographic Failures" }],
  "Hardcoded API Key": [{ id: "A02", name: "Cryptographic Failures" }],
  "Password Assignment": [
    { id: "A02", name: "Cryptographic Failures" },
    { id: "A07", name: "Identification and Authentication Failures" },
  ],
  "Secret Assignment": [{ id: "A02", name: "Cryptographic Failures" }],
  "Token Assignment": [{ id: "A02", name: "Cryptographic Failures" }],
  "Exposed .env": [
    { id: "A05", name: "Security Misconfiguration" },
    { id: "A02", name: "Cryptographic Failures" },
  ],
};
const DEFAULT_OWASP: FrameworkRef[] = [
  { id: "A02", name: "Cryptographic Failures" },
];

export function getMitreRefs(type: string): FrameworkRef[] {
  return MITRE_MAP[type] ?? DEFAULT_MITRE;
}
export function getOwaspRefs(type: string): FrameworkRef[] {
  return OWASP_MAP[type] ?? DEFAULT_OWASP;
}

// ---------------------------------------------------------------------------
// Plain-language impact narratives shown in the "AI Security Assessment" box.
// ---------------------------------------------------------------------------

const IMPACT_NARRATIVES: Record<string, string> = {
  "Hardcoded API Key":
    "Anyone with access to this repository may be able to authenticate against the associated service if this credential is still active. Rotate the key, remove it from version control, and use environment variables or a secrets manager instead.",
  "AWS Access Key":
    "This credential can grant direct access to AWS resources such as storage, compute, or billing. If it's still active, anyone with repository access could use it to reach or modify cloud infrastructure. Revoke it in the AWS IAM console, issue a replacement, and keep it out of source control.",
  "AWS Secret Key":
    "Paired with an access key, this secret can authenticate directly against AWS APIs. Treat it as compromised: rotate it immediately in IAM and remove it from the repository's history, not just the latest commit.",
  "GitHub Token":
    "Depending on its scopes, this token may grant access to private repositories, CI/CD pipelines, or organization resources. Anyone with repository access could use it to impersonate the token owner. Revoke it from GitHub settings and reissue one with the minimum scopes needed.",
  "OpenAI Key":
    "This key can be used to make billed API calls on the account's behalf. If still active, it could lead to unauthorized usage charges or exposure of prompts and completions. Revoke it from the OpenAI dashboard and store the replacement as an environment variable.",
  "Firebase Key":
    "Depending on the project's Firebase security rules, this key may allow read or write access to application data. Review the security rules and rotate or restrict the key if it grants broader access than intended.",
  "Stripe Key":
    "This key can access payment data or initiate transactions on the connected Stripe account, posing a direct financial risk if still active. Rotate it immediately from the Stripe dashboard and store the replacement securely.",
  "Private Key":
    "A private key found in source control should be treated as compromised. It may allow an attacker to decrypt sensitive traffic, impersonate a service, or establish trusted connections such as SSH or TLS. Revoke or reissue the corresponding key pair immediately.",
  "Password Assignment":
    "A hardcoded password can allow direct authentication to the associated system if discovered. Remove it from source, rotate the credential, and load it from a secrets manager or environment variable at runtime.",
  "Secret Assignment":
    "This value may be used to sign tokens, encrypt data, or authenticate requests. If exposed, it could let an attacker forge trusted requests or decrypt sensitive data. Rotate it and load it from a secure secret store.",
  "Token Assignment":
    "This token may grant access to an authenticated session or API on the service's behalf. If still valid, it could be used to impersonate a legitimate user or service. Revoke and reissue it, and avoid storing tokens directly in code.",
  "Exposed .env":
    "Environment files often bundle multiple secrets — API keys, database credentials, tokens — in one place. If this file was pushed to a public repository, every credential inside it should be treated as compromised and rotated.",
};
const DEFAULT_IMPACT_NARRATIVE =
  "This finding may expose sensitive credentials to anyone with access to the repository. Remove it from source control, rotate the underlying credential, and store secrets using environment variables or a secrets manager.";

export function getImpactNarrative(type: string): string {
  return IMPACT_NARRATIVES[type] ?? DEFAULT_IMPACT_NARRATIVE;
}

// ---------------------------------------------------------------------------
// URL parsing
// ---------------------------------------------------------------------------

// Best-effort owner/repo parse — mirrors the shape the backend validates.
export function parseOwnerRepo(
  url: string,
): { owner: string; repo: string } | null {
  const match = url
    .trim()
    .match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// ---------------------------------------------------------------------------
// Error message mapping
// ---------------------------------------------------------------------------

// Maps raw backend / network error messages to friendly, user-facing copy.
export function getFriendlyErrorMessage(rawMessage: string): string {
  const message = (rawMessage || "").trim();
  const lower = message.toLowerCase();

  if (!message) return "Unable to analyze this repository.";
  if (
    lower.includes("must be a valid public github repository url") ||
    lower.includes("valid github repository url")
  ) {
    return "Enter a valid GitHub repository URL.";
  }
  if (lower.includes("(404)") || lower.includes("not found")) {
    return "Repository not found. Check the GitHub URL.";
  }
  if (lower.includes("rate limit") || lower.includes("(429)")) {
    return "GitHub rate limit reached. Try again in a few minutes.";
  }
  if (lower.includes("(403)") || lower.includes("private")) {
    return "This repository is private. Guardian can only scan public repositories.";
  }
  return message;
}