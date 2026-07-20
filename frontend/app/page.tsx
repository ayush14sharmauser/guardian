"use client";

// Guardian AI landing page: hero, security dashboard, and repository analyzer.

import { X, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import ScrollReveal from "./components/ScrollReveal";
import Hero from "./components/Hero";
import HowItWorksTimeline, { type TimelineStep } from "./components/HowItWorksTimeline";
import { useToast, ToastContainer } from "./components/Toast";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Repository Analyzer", href: "#repository-analyzer" },
  { label: "GitHub", href: "https://github.com" },
];

type Severity = "critical" | "high" | "medium" | "low";

type AnalysisResult = {
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
      status: "Fixed" | "Not Fixed";
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
    level: "Critical" | "High" | "Medium" | "Low";
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
const summaryItems: Array<{ label: string; severity: Severity }> = [
  { label: "Critical", severity: "critical" },
  { label: "High", severity: "high" },
  { label: "Medium", severity: "medium" },
  { label: "Low", severity: "low" },
];

const severityStyles: Record<Severity, string> = {
  critical: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  high: "border-orange-200/20 bg-orange-300/10 text-orange-100",
  medium: "border-amber-200/20 bg-amber-300/10 text-amber-100",
  low: "border-sky-200/20 bg-sky-300/10 text-sky-100",
};

// Dot color used inside compact severity badges (Risk Breakdown, category headers).
const severityDotStyles: Record<Severity, string> = {
  critical: "bg-rose-300",
  high: "bg-orange-300",
  medium: "bg-amber-300",
  low: "bg-sky-300",
};

const loadingSteps = [
  "Fetching repository",
  "Downloading repository tree",
  "Detecting secrets",
  "AI investigation",
  "Calculating risk",
  "Generating patches",
  "Preparing AI Pull Requests",
];

const featureCards = [
  {
    title: "Secret Detection",
    description:
      "Detect AWS keys, GitHub tokens, OpenAI keys, Stripe keys, Firebase keys and private keys.",
  },
  {
    title: "AI Investigation",
    description:
      "Explain why each finding is dangerous and provide security recommendations.",
  },
  {
    title: "Patch Recommendations",
    description:
      "Generate secure code replacements using environment variables.",
  },
  {
    title: "Verification & PR Generation",
    description:
      "Verify fixes and generate AI-assisted pull request descriptions.",
  },
];

// Expanded to mirror the actual analysis pipeline (previously a generic
// 4-step summary). Presentational copy only — no change to what the
// scanner does or the order it does it in.
const howItWorksSteps: TimelineStep[] = [
  { title: "Repository URL", description: "Paste any public GitHub repository link to get started." },
  { title: "Repository Tree", description: "Guardian fetches and walks the full file tree." },
  { title: "Secret Detection", description: "Every file is scanned for exposed credentials and keys." },
  { title: "AI Investigation", description: "Each finding is investigated for real-world impact and context." },
  { title: "Risk Analysis", description: "Findings are weighted by severity into an overall risk score." },
  { title: "Patch Recommendation", description: "Guardian proposes a secure, drop-in code replacement." },
  { title: "Security Report", description: "Export a complete report as Markdown, JSON, or PDF." },
];

const techStack = ["Next.js", "TypeScript", "GitHub API", "OpenAI", "Tailwind CSS"];

// ---------------------------------------------------------------------------
// Security Grade — derived entirely from the existing risk.score returned by
// the scanner. No backend changes; this is a pure presentational mapping.
// ---------------------------------------------------------------------------

type GradeInfo = {
  grade: string;
  description: string;
  textClass: string;
  ringClass: string;
  badgeClass: string;
  hex: string;
};

function getSecurityGrade(score: number): GradeInfo {
  if (score >= 95) {
    return {
      grade: "A+",
      description: "Excellent",
      textClass: "text-emerald-200",
      ringClass: "border-emerald-200/25 bg-emerald-300/10",
      badgeClass: "border-emerald-200/25 bg-emerald-300/10 text-emerald-100",
      hex: "#6EE7B7",
    };
  }
  if (score >= 90) {
    return {
      grade: "A",
      description: "Excellent",
      textClass: "text-emerald-200",
      ringClass: "border-emerald-200/25 bg-emerald-300/10",
      badgeClass: "border-emerald-200/25 bg-emerald-300/10 text-emerald-100",
      hex: "#6EE7B7",
    };
  }
  if (score >= 80) {
    return {
      grade: "B",
      description: "Good",
      textClass: "text-sky-200",
      ringClass: "border-sky-200/25 bg-sky-300/10",
      badgeClass: "border-sky-200/25 bg-sky-300/10 text-sky-100",
      hex: "#7DD3FC",
    };
  }
  if (score >= 70) {
    return {
      grade: "C",
      description: "Needs Improvement",
      textClass: "text-amber-200",
      ringClass: "border-amber-200/25 bg-amber-300/10",
      badgeClass: "border-amber-200/25 bg-amber-300/10 text-amber-100",
      hex: "#FCD34D",
    };
  }
  if (score >= 50) {
    return {
      grade: "D",
      description: "High Risk",
      textClass: "text-orange-200",
      ringClass: "border-orange-200/25 bg-orange-300/10",
      badgeClass: "border-orange-200/25 bg-orange-300/10 text-orange-100",
      hex: "#FDBA74",
    };
  }
  return {
    grade: "F",
    description: "Critical",
    textClass: "text-rose-200",
    ringClass: "border-rose-200/25 bg-rose-300/10",
    badgeClass: "border-rose-200/25 bg-rose-300/10 text-rose-100",
    hex: "#FDA4AF",
  };
}

// ---------------------------------------------------------------------------
// Finding categorization — purely a presentational grouping of the finding
// `type` strings the scanner already returns. No scanning logic involved.
// ---------------------------------------------------------------------------

type FindingItem = AnalysisResult["findings"][number];

type CategoryDef = {
  key: string;
  label: string;
  icon: React.ReactNode;
  types: string[];
};

function useCategoryDefs(): CategoryDef[] {
  return [
    {
      key: "cloud",
      label: "Cloud Credentials",
      icon: <CloudIcon className="h-4 w-4" />,
      types: ["AWS Access Key", "AWS Secret Key", "Firebase Key"],
    },
    {
      key: "api",
      label: "API Keys",
      icon: <KeyIcon className="h-4 w-4" />,
      types: ["OpenAI Key", "Stripe Key", "Hardcoded API Key"],
    },
    {
      key: "auth",
      label: "Authentication",
      icon: <LockIcon className="h-4 w-4" />,
      types: ["Password Assignment"],
    },
    {
      key: "private",
      label: "Private Keys",
      icon: <ShieldIcon className="h-4 w-4" />,
      types: ["Private Key"],
    },
    {
      key: "env",
      label: "Environment Files",
      icon: <FileIcon className="h-4 w-4" />,
      types: ["Exposed .env"],
    },
    {
      key: "tokens",
      label: "Tokens",
      icon: <TokenIcon className="h-4 w-4" />,
      types: ["GitHub Token", "Secret Assignment", "Token Assignment"],
    },
  ];
}

function categorizeFindings(
  findings: FindingItem[],
  categoryDefs: CategoryDef[],
): Array<{ def: CategoryDef; findings: FindingItem[] }> {
  const buckets = new Map<string, FindingItem[]>();
  categoryDefs.forEach((def) => buckets.set(def.key, []));
  buckets.set("other", []);

  for (const finding of findings) {
    const match = categoryDefs.find((def) => def.types.includes(finding.type));
    buckets.get(match ? match.key : "other")?.push(finding);
  }

  const other: CategoryDef = {
    key: "other",
    label: "Other",
    icon: <DotsIcon className="h-4 w-4" />,
    types: [],
  };

  return [...categoryDefs, other]
    .map((def) => ({ def, findings: buckets.get(def.key) ?? [] }))
    .filter((group) => group.findings.length > 0);
}

function severityRank(severity: Severity): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[severity];
}

// ---------------------------------------------------------------------------
// MITRE ATT&CK mapping — a static, presentational lookup keyed by the finding
// `type` string the scanner already returns. No scanner or backend changes.
// ---------------------------------------------------------------------------

type FrameworkRef = { id: string; name: string };

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
  "Hardcoded API Key": [{ id: "T1552.001", name: "Credentials In Files" }],
  "Password Assignment": [
    { id: "T1552.001", name: "Credentials In Files" },
    { id: "T1078", name: "Valid Accounts" },
  ],
  "Secret Assignment": [{ id: "T1552.001", name: "Credentials In Files" }],
  "Token Assignment": [
    { id: "T1528", name: "Steal Application Access Token" },
    { id: "T1552.001", name: "Credentials In Files" },
  ],
  "Exposed .env": [
    { id: "T1552.001", name: "Credentials In Files" },
    { id: "T1552", name: "Unsecured Credentials" },
  ],
};

const DEFAULT_MITRE: FrameworkRef[] = [{ id: "T1552", name: "Unsecured Credentials" }];

// ---------------------------------------------------------------------------
// OWASP Top 10 (2021) mapping — same idea, static and presentational.
// ---------------------------------------------------------------------------

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

const DEFAULT_OWASP: FrameworkRef[] = [{ id: "A02", name: "Cryptographic Failures" }];

// ---------------------------------------------------------------------------
// Richer, plain-language impact narratives — read like a security engineer's
// assessment rather than a bare finding type label. Purely presentational;
// the underlying `investigation.reason` / `recommendation` from the scanner
// are still shown alongside this.
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

function getImpactNarrative(type: string): string {
  return IMPACT_NARRATIVES[type] ?? DEFAULT_IMPACT_NARRATIVE;
}

function getMitreRefs(type: string): FrameworkRef[] {
  return MITRE_MAP[type] ?? DEFAULT_MITRE;
}

function getOwaspRefs(type: string): FrameworkRef[] {
  return OWASP_MAP[type] ?? DEFAULT_OWASP;
}

// ---------------------------------------------------------------------------
// Security Report generation — Markdown and JSON are built and downloaded
// entirely client-side from the same `result` already rendered on screen.
// "PDF" opens a print-formatted view via the browser's native print dialog
// (Save as PDF) rather than pulling in a PDF-generation dependency.
// ---------------------------------------------------------------------------

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildMarkdownReport(
  result: AnalysisResult,
  repoLabel: string,
  scanDuration: string | null,
  completedAt: string | null,
): string {
  const grade = getSecurityGrade(result.risk.score);
  const totalFindings =
    result.summary.critical + result.summary.high + result.summary.medium + result.summary.low;

  const lines: string[] = [];

  lines.push(`# Guardian AI Security Report`);
  lines.push("");
  lines.push(`**Repository:** ${repoLabel || "—"}`);
  lines.push(`**Scan completed:** ${completedAt ?? "—"}`);
  lines.push(`**Scan duration:** ${scanDuration ? `${scanDuration}s` : "—"}`);
  lines.push(`**Files scanned:** ${result.meta.filesScanned}`);
  lines.push("");
  lines.push(`## Security Grade: ${grade.grade} (${grade.description})`);
  lines.push("");
  lines.push(`Risk Score: **${result.risk.score}/100**`);
  lines.push("");
  lines.push(`## Executive Summary`);
  lines.push("");
  lines.push(
    `Guardian analyzed ${result.meta.filesScanned} file${result.meta.filesScanned === 1 ? "" : "s"} and detected ${totalFindings} security finding${totalFindings === 1 ? "" : "s"} (${result.summary.critical} critical, ${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low).`,
  );
  lines.push("");
  lines.push(`## Risk Breakdown`);
  lines.push("");
  lines.push(`| Severity | Count |`);
  lines.push(`|---|---|`);
  lines.push(`| Critical | ${result.summary.critical} |`);
  lines.push(`| High | ${result.summary.high} |`);
  lines.push(`| Medium | ${result.summary.medium} |`);
  lines.push(`| Low | ${result.summary.low} |`);
  lines.push("");

  if (result.warnings.length > 0) {
    lines.push(`## Scan Warnings`);
    lines.push("");
    result.warnings.forEach((warning) => lines.push(`- ${warning}`));
    lines.push("");
  }

  lines.push(`## Findings`);
  lines.push("");

  if (result.findings.length === 0) {
    lines.push("No exposed credentials, private keys, API keys, or environment files were detected.");
  } else {
    result.findings.forEach((finding, index) => {
      const mitre = getMitreRefs(finding.type);
      const owasp = getOwaspRefs(finding.type);

      lines.push(`### ${index + 1}. ${finding.type} (${finding.severity.toUpperCase()})`);
      lines.push("");
      lines.push(`**File:** \`${finding.file}:${finding.line}\``);
      lines.push("");
      lines.push(getImpactNarrative(finding.type));
      lines.push("");
      lines.push(`**MITRE ATT&CK:** ${mitre.map((ref) => `${ref.id} (${ref.name})`).join(", ")}`);
      lines.push("");
      lines.push(`**OWASP Top 10:** ${owasp.map((ref) => `${ref.id} (${ref.name})`).join(", ")}`);
      lines.push("");

      if (finding.investigation?.recommendation) {
        lines.push(`**Recommendation:** ${finding.investigation.recommendation}`);
        lines.push("");
      }

      if (finding.verification) {
        lines.push(`**Verification:** ${finding.verification.status} — ${finding.verification.reason}`);
        lines.push("");
      }
    });
  }

  return lines.join("\n");
}

function buildPrintableReportHtml(
  result: AnalysisResult,
  repoLabel: string,
  scanDuration: string | null,
  completedAt: string | null,
): string {
  const grade = getSecurityGrade(result.risk.score);
  const totalFindings =
    result.summary.critical + result.summary.high + result.summary.medium + result.summary.low;

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const findingsHtml =
    result.findings.length === 0
      ? "<p>No exposed credentials, private keys, API keys, or environment files were detected.</p>"
      : result.findings
          .map((finding, index) => {
            const mitre = getMitreRefs(finding.type);
            const owasp = getOwaspRefs(finding.type);

            return `
              <div class="finding">
                <h3>${index + 1}. ${escapeHtml(finding.type)} — ${finding.severity.toUpperCase()}</h3>
                <p class="mono">${escapeHtml(finding.file)}:${finding.line}</p>
                <p>${escapeHtml(getImpactNarrative(finding.type))}</p>
                <p><strong>MITRE ATT&amp;CK:</strong> ${mitre.map((ref) => `${ref.id} (${escapeHtml(ref.name)})`).join(", ")}</p>
                <p><strong>OWASP Top 10:</strong> ${owasp.map((ref) => `${ref.id} (${escapeHtml(ref.name)})`).join(", ")}</p>
                ${finding.investigation?.recommendation ? `<p><strong>Recommendation:</strong> ${escapeHtml(finding.investigation.recommendation)}</p>` : ""}
              </div>
            `;
          })
          .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Guardian Security Report</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #0c1511; margin: 40px; }
  h1 { margin-bottom: 4px; }
  .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
  .grade { font-size: 40px; font-weight: 700; }
  table { border-collapse: collapse; margin: 16px 0; }
  td, th { border: 1px solid #ccc; padding: 6px 12px; text-align: left; font-size: 13px; }
  .finding { border-top: 1px solid #ddd; padding: 16px 0; }
  .mono { font-family: monospace; font-size: 12px; color: #555; }
  h2 { margin-top: 32px; }
  @media print {
    .finding { break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>Guardian AI Security Report</h1>
  <p class="meta">
    Repository: ${escapeHtml(repoLabel || "—")}<br/>
    Scan completed: ${escapeHtml(completedAt ?? "—")} &nbsp;·&nbsp; Duration: ${scanDuration ? `${scanDuration}s` : "—"} &nbsp;·&nbsp; Files scanned: ${result.meta.filesScanned}
  </p>

  <div class="grade">${grade.grade} <span style="font-size:16px;font-weight:500;">(${grade.description})</span></div>
  <p>Risk Score: ${result.risk.score}/100</p>

  <h2>Executive Summary</h2>
  <p>Guardian analyzed ${result.meta.filesScanned} file(s) and detected ${totalFindings} security finding(s) (${result.summary.critical} critical, ${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low).</p>

  <h2>Risk Breakdown</h2>
  <table>
    <tr><th>Severity</th><th>Count</th></tr>
    <tr><td>Critical</td><td>${result.summary.critical}</td></tr>
    <tr><td>High</td><td>${result.summary.high}</td></tr>
    <tr><td>Medium</td><td>${result.summary.medium}</td></tr>
    <tr><td>Low</td><td>${result.summary.low}</td></tr>
  </table>

  <h2>Findings</h2>
  ${findingsHtml}
</body>
</html>`;
}

// Best-effort owner/repo parse — presentational only, mirrors the same shape
// the backend already validates server-side.
function parseOwnerRepo(url: string): { owner: string; repo: string } | null {
  const match = url
    .trim()
    .match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);

  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// Maps raw backend / network error messages to friendly, user-facing copy.
// Falls back to the original message if nothing matches, so no information
// is ever hidden from the user.
function getFriendlyErrorMessage(rawMessage: string): string {
  const message = (rawMessage || "").trim();
  const lower = message.toLowerCase();

  if (!message) {
    return "Unable to analyze this repository.";
  }

  if (
    lower.includes("must be a valid public github repository url") ||
    lower.includes("valid github repository url")
  ) {
    return "Please enter a valid GitHub repository URL.";
  }

  if (lower.includes("(404)") || lower.includes("not found")) {
    return "❌ Repository not found.\nPlease check the GitHub URL.";
  }

  if (lower.includes("rate limit") || lower.includes("(429)")) {
    return "⚠ GitHub rate limit reached.\nPlease try again in a few minutes.";
  }

  if (lower.includes("(403)") || lower.includes("private")) {
    return "🔒 This repository is private.\nGuardian can only scan public repositories.";
  }

  return message;
}

// Spawns a short-lived ripple element positioned at the click point. The
// target must have `relative overflow-hidden` in its className.
function spawnRipple(event: React.MouseEvent<HTMLElement>) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple-el";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  target.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 2.5 20 5.8v5.78c0 4.74-3.2 9.1-8 10.02-4.8-.92-8-5.28-8-10.02V5.8l8-3.3Z" fill="currentColor" />
      <path d="m8.7 12.1 2.12 2.12 4.53-4.64" stroke="#07130d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

function CopyIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="13" rx="2" stroke="currentColor" strokeWidth="1.8" width="13" x="9" y="9" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function WarningIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 3 22 20H2L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12 9v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="17" fill="currentColor" r="0.9" />
    </svg>
  );
}

function ScanIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M7 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SkipIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M6 4v16l9-8Z" fill="currentColor" />
      <path d="M17 4v16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function FailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function TruncateIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h10M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CloudIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M7 18h11a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 8.14 8.03 4.5 4.5 0 0 0 7 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function KeyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="m11 12 8-8M16 4l3 3M13 9l2.5 2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="10" rx="2" stroke="currentColor" strokeWidth="1.7" width="14" x="5" y="11" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function FileIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M7 3h7l4 4v14H7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M14 3v4h4" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function TokenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 12h6M12 9v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function DotsIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function GuardianLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-100/35 bg-gradient-to-br from-emerald-100 to-emerald-400 text-[#052513] shadow-[0_0_28px_rgba(100,255,175,0.28)]">
        <ShieldIcon className="h-[21px] w-[21px]" />
      </span>
      <span className="text-[1.12rem] font-semibold tracking-[-0.055em] text-white">Guardian</span>
    </span>
  );
}

// Small reusable copy-to-clipboard button used by Patch Recommendation
// (copies the "after" code) and AI Pull Request (copies the commit message).
function CopyButton({
  text,
  copied,
  onCopy,
  label = "Copy",
}: {
  text: string;
  copied: boolean;
  onCopy: (text: string) => void;
  label?: string;
}) {
  return (
    <button
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/55 transition hover:-translate-y-0.5 hover:border-emerald-200/30 hover:bg-emerald-300/[0.08] hover:text-emerald-100"
      onClick={() => onCopy(text)}
      type="button"
    >
      {copied ? (
        <>
          <CheckIcon className="h-3 w-3 text-emerald-300" />
          Copied!
        </>
      ) : (
        <>
          <CopyIcon className="h-3 w-3" />
          {label}
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Security Grade card — the headline number derived from risk.score.
// ---------------------------------------------------------------------------

function SecurityGradeCard({ score }: { score: number }) {
  const grade = getSecurityGrade(score);

  return (
    <div className={`flex flex-col justify-between rounded-2xl border p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] ${grade.ringClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Security Grade
        </p>
        <ShieldIcon className={`h-4 w-4 ${grade.textClass}`} />
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className={`text-6xl font-semibold leading-none tracking-[-0.04em] ${grade.textClass}`}>
          {grade.grade}
        </span>
        <span className={`mb-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${grade.badgeClass}`}>
          {grade.description}
        </span>
      </div>

      <p className="mt-4 text-xs leading-5 text-white/45">
        Based on a risk score of {score}/100, weighted by finding severity.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Circular risk gauge — same underlying risk.score, just visualized as an
// SVG ring instead of plain text.
// ---------------------------------------------------------------------------

function RiskGauge({ score }: { score: number }) {
  const grade = getSecurityGrade(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" fill="none" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            fill="none"
            r={radius}
            stroke={grade.hex}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="10"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-[-0.04em] text-white">{score}</span>
          <span className="text-[10px] text-white/40">/ 100</span>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Risk Score</p>
        <p className={`mt-1 text-lg font-semibold ${grade.textClass}`}>{grade.description}</p>
        <p className="mt-2 text-xs leading-5 text-white/45">
          Lower scores indicate more severe or numerous findings in the repository.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [scanDuration, setScanDuration] = useState<string | null>(null);
  const [scanMeta, setScanMeta] = useState<{
    owner: string | null;
    repo: string | null;
    completedAt: string | null;
  } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // --- UI-only additions below (scan button morph, scroll-spy nav, dashboard
  // entrance stagger, hero pointer glow). None of this touches scan/API logic.
  const [completionPulse, setCompletionPulse] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { toasts, showToast } = useToast();

  const categoryDefs = useCategoryDefs();

  const toggleCategory = (key: string) => {
    setCollapsedCategories((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(key);
      setTimeout(() => {
        setCopiedField((current) => (current === key ? null : current));
      }, 1600);
    } catch {
      // Clipboard API unavailable or permission denied — fail silently,
      // the button simply won't show the "Copied!" confirmation.
    }
  };

  const analyzeRepository = async () => {
    const trimmedUrl = repositoryUrl.trim();

    // Validate before ever touching the network — cheap, immediate feedback
    // for empty or obviously malformed input.
    if (!trimmedUrl) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+/.test(trimmedUrl)) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setLoadingStepIndex(0);
    setScanDuration(null);
    setScanMeta(null);

    const scanStartedAt = performance.now();
    const ownerRepo = parseOwnerRepo(trimmedUrl);

    // Simulated progress checklist — purely presentational, no backend calls.
    const stepInterval = setInterval(() => {
      setLoadingStepIndex((current) =>
        current < loadingSteps.length - 1 ? current + 1 : current,
      );
    }, 850);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl: trimmedUrl }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze this repository.");
      }

      setLoadingStepIndex(loadingSteps.length - 1);
      setResult(data as AnalysisResult);
      setScanDuration(((performance.now() - scanStartedAt) / 1000).toFixed(2));
      setScanMeta({
        owner: ownerRepo?.owner ?? null,
        repo: ownerRepo?.repo ?? null,
        completedAt: new Date().toLocaleString(),
      });
      setCompletionPulse(true);
      setTimeout(() => setCompletionPulse(false), 900);
    } catch (requestError) {
      const rawMessage =
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze this repository.";

      setError(getFriendlyErrorMessage(rawMessage));
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleUrlKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !loading) {
      event.preventDefault();
      analyzeRepository();
    }
  };

  // Reveal the dashboard a frame after `result` lands so the CSS transition
  // (opacity/translate) actually has a starting state to animate from.
  useEffect(() => {
    if (!result) {
      setShowDashboard(false);
      return;
    }
    setShowDashboard(false);
    const frame = requestAnimationFrame(() => setShowDashboard(true));
    return () => cancelAnimationFrame(frame);
  }, [result]);

  // Scroll-spy for nav active states.
  useEffect(() => {
    const sectionIds = ["home", "features", "how-it-works", "repository-analyzer"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const totalFindings = result
    ? result.summary.critical + result.summary.high + result.summary.medium + result.summary.low
    : 0;

  const executiveSummaryText = result
    ? (() => {
        const grade = getSecurityGrade(result.risk.score);
        const parts: string[] = [];

        parts.push(
          `Guardian analyzed ${result.meta.filesScanned} file${result.meta.filesScanned === 1 ? "" : "s"} and detected ${totalFindings} security finding${totalFindings === 1 ? "" : "s"}.`,
        );

        if (totalFindings === 0) {
          parts.push("No exposed credentials or secrets were identified.");
        } else if (result.summary.critical > 0) {
          parts.push(
            "Most issues involve exposed credentials, private keys, or API keys. Immediate remediation is recommended.",
          );
        } else if (result.summary.high > 0) {
          parts.push(
            "Several high-severity credentials were found and should be rotated and remediated promptly.",
          );
        } else {
          parts.push("Findings are lower severity, but should still be reviewed and remediated.");
        }

        parts.push(`Overall repository health is rated ${grade.grade} (${grade.description}).`);

        return parts.join(" ");
      })()
    : "";

  const categorizedGroups = result ? categorizeFindings(result.findings, categoryDefs) : [];

  const repoLabel =
    result && (result.meta.owner || scanMeta?.owner) && (result.meta.repository || scanMeta?.repo)
      ? `${result.meta.owner || scanMeta?.owner}/${result.meta.repository || scanMeta?.repo}`
      : "";

  const handleDownloadMarkdown = () => {
    if (!result) return;
    const markdown = buildMarkdownReport(result, repoLabel, scanDuration, scanMeta?.completedAt ?? null);
    downloadTextFile(`guardian-report-${Date.now()}.md`, markdown, "text/markdown");
    showToast("Security Report Downloaded (Markdown)");
  };

  const handleDownloadJson = () => {
    if (!result) return;
    downloadTextFile(`guardian-report-${Date.now()}.json`, JSON.stringify(result, null, 2), "application/json");
    showToast("Security Report Downloaded (JSON)");
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const html = buildPrintableReportHtml(result, repoLabel, scanDuration, scanMeta?.completedAt ?? null);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Give the new document a moment to render before invoking print, so
    // the user's browser "Save as PDF" dialog captures the full report.
    setTimeout(() => printWindow.print(), 300);
    showToast("Security Report Ready (PDF)");
  };

  const progressPercent = loading
    ? Math.round(((loadingStepIndex + 1) / loadingSteps.length) * 100)
    : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060a08] text-white" id="home">
      <div aria-hidden="true" className="hero-orb hero-orb-one pointer-events-none absolute" />
      <div aria-hidden="true" className="hero-orb hero-orb-two pointer-events-none absolute" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,11,8,0.15)_0%,#060a08_83%)]" />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex h-[68px] max-w-[1440px] items-center justify-between rounded-2xl border border-white/[0.12] bg-[#0b110e]/70 px-4 shadow-[0_14px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-5">
          <a aria-label="Guardian home" href="#home"><GuardianLogo /></a>

          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {navLinks.map((item) => {
              const isActive = item.href === `#${activeSection}`;
              return (
                <a
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${isActive ? "text-white" : "text-white/55 hover:bg-white/[0.05] hover:text-white"}`}
                  href={item.href}
                  key={item.label}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              className="group flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-[#062613] shadow-[0_0_28px_rgba(52,216,166,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
              href="#repository-analyzer"
            >
              Analyze Repository <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/90 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>

          <div
            className={`absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0c130f]/95 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-200 lg:hidden ${
              menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
            }`}
            id="mobile-menu"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col">
              {navLinks.map((item) => (
                <a
                  className="rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                  href={item.href}
                  key={item.label}
                  onClick={() => setMenuOpen(false)}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              ))}
              <div className="mx-3 my-2 h-px bg-white/[0.08]" />
              <a className="m-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-[#062613]" href="#repository-analyzer" onClick={() => setMenuOpen(false)}>
                Analyze Repository <ArrowRight className="h-4 w-4" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      <Hero />


      

      <ScrollReveal>
        <section id="features" className="relative z-10 mx-auto max-w-[1440px] px-6 pb-32 pt-32 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">Capabilities</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Everything you need to secure your code</h2>
            <p className="mt-4 text-base leading-7 text-white/50">Guardian combines secret detection, AI-powered investigation, and automated remediation into a single, seamless workflow.</p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <div key={card.title} className="scan-sweep group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/20 hover:bg-white/[0.05]">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                  <ShieldIcon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/30">
            <span>Built with:</span>
            {techStack.map((tech) => (
              <span key={tech} className="rounded-full border border-white/[0.08] px-3 py-1">{tech}</span>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="how-it-works" className="relative z-10 mx-auto max-w-[1440px] px-6 pb-24 pt-20 sm:px-10 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">Workflow</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">How Guardian works</h2>
            <p className="mt-4 text-base leading-7 text-white/50">From repository URL to actionable security report in seconds.</p>
          </div>

          <div className="mt-14">
            <HowItWorksTimeline steps={howItWorksSteps} />
          </div>
        </section>
      </ScrollReveal>

      <section id="repository-analyzer" className="relative z-10 mx-auto max-w-[1440px] px-6 pb-24 pt-20 sm:px-10 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">Try It Now</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Analyze a Repository</h2>
          <p className="mt-4 text-base leading-7 text-white/50">Paste a public GitHub repository URL below to scan for exposed secrets, private keys, and credentials.</p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                className="h-12 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 pr-12 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-300/40 focus:bg-white/[0.06]"
                disabled={loading}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                onKeyDown={handleUrlKeyDown}
                placeholder="https://github.com/owner/repository"
                type="url"
                value={repositoryUrl}
              />
              {repositoryUrl && !loading && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60"
                  onClick={() => setRepositoryUrl("")}
                  type="button"
                  aria-label="Clear URL"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              className={`relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl px-6 text-sm font-semibold transition ${
                loading
                  ? "cursor-not-allowed bg-emerald-300/60 text-[#062613]"
                  : "bg-emerald-300 text-[#062613] shadow-[0_0_28px_rgba(52,216,166,0.22)] hover:-translate-y-0.5 hover:bg-emerald-200 hover:shadow-[0_0_44px_rgba(52,216,166,0.32)]"
              }`}
              disabled={loading}
              onClick={analyzeRepository}
              type="button"
              onMouseDown={spawnRipple}
            >
              {loading ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanIcon className="h-4 w-4" />
                  Analyze
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100 whitespace-pre-line">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-8 space-y-3">
              <div className="mb-2 flex items-center justify-between text-xs text-white/50">
                <span>Scanning progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <ul className="mt-4 space-y-2">
                {loadingSteps.map((step, index) => {
                  const isCompleted = index <= loadingStepIndex;
                  const isCurrent = index === loadingStepIndex;
                  return (
                    <li key={step} className="flex items-center gap-3 text-sm">
                      {isCompleted ? (
                        <CheckIcon className="h-4 w-4 shrink-0 text-emerald-300" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
                      )}
                      <span className={isCurrent ? "text-white" : isCompleted ? "text-white/50" : "text-white/30"}>
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      {result && (
        <section
          id="dashboard"
          className={`relative z-10 mx-auto max-w-[1440px] px-6 pb-24 pt-10 transition-all duration-500 sm:px-10 lg:px-8 ${
            showDashboard ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                Security Dashboard
              </h2>
              {repoLabel && (
                <p className="mt-1 text-sm text-white/50">
                  Results for <span className="font-mono text-emerald-300/80">{repoLabel}</span>
                  {scanMeta?.completedAt && <span className="ml-2 text-white/30">• {scanMeta.completedAt}</span>}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/70 transition hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-emerald-300/[0.08] hover:text-emerald-100"
                onClick={handleDownloadMarkdown}
                type="button"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                Markdown
              </button>
              <button
                className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/70 transition hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-emerald-300/[0.08] hover:text-emerald-100"
                onClick={handleDownloadJson}
                type="button"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                JSON
              </button>
              <button
                className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/70 transition hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-emerald-300/[0.08] hover:text-emerald-100"
                onClick={handleDownloadPdf}
                type="button"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <div className="space-y-5">
              <SecurityGradeCard score={result.risk.score} />
              <RiskGauge score={result.risk.score} />

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Risk Breakdown</h3>
                <div className="space-y-2.5">
                  {summaryItems.map((item) => (
                    <div key={item.severity} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${severityDotStyles[item.severity]}`} />
                        <span className="text-sm text-white/80">{item.label}</span>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${severityStyles[item.severity]}`}>
                        {result.summary[item.severity]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {result.warnings.length > 0 && (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <WarningIcon className="h-4 w-4 text-amber-300" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">Scan Warnings</h3>
                  </div>
                  <ul className="space-y-1.5 text-sm text-amber-100/70">
                    {result.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Scan Metadata</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/40">Files Scanned</dt>
                    <dd className="text-white/80">{result.meta.filesScanned}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Files Skipped</dt>
                    <dd className="text-white/80">{result.meta.filesSkipped}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Files Failed</dt>
                    <dd className="text-white/80">{result.meta.filesFailed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Scan Duration</dt>
                    <dd className="text-white/80">{scanDuration ? `${scanDuration}s` : "—"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">AI Security Assessment</h3>
                <p className="text-sm leading-7 text-white/60">{executiveSummaryText}</p>
              </div>

              {categorizedGroups.length > 0 && (
                <div className="space-y-3">
                  {categorizedGroups.map(({ def, findings }) => {
                    const isCollapsed = collapsedCategories.has(def.key);
                    const sortedFindings = [...findings].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

                    return (
                      <div key={def.key} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                        <button
                          className="flex w-full items-center justify-between p-5 text-left transition hover:bg-white/[0.03]"
                          onClick={() => toggleCategory(def.key)}
                          type="button"
                        >
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] text-white/70">
                              {def.icon}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{def.label}</h3>
                              <p className="text-xs text-white/40">{findings.length} finding{findings.length !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
                        </button>

                        {!isCollapsed && (
                          <div className="border-t border-white/[0.06] px-5 pb-5 pt-4 space-y-4">
                            {sortedFindings.map((finding, index) => (
                              <div key={`${finding.file}-${finding.line}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityStyles[finding.severity]}`}>
                                        {finding.severity}
                                      </span>
                                      <h4 className="text-sm font-semibold text-white">{finding.type}</h4>
                                    </div>
                                    <p className="mt-1.5 font-mono text-xs text-white/40">{finding.file}:{finding.line}</p>
                                  </div>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-white/50">{getImpactNarrative(finding.type)}</p>

                                {finding.investigation && (
                                  <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
                                    <div>
                                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300/70">
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                                        AI Investigation
                                      </div>
                                      <p className="mt-2 text-sm leading-6 text-white/50">{finding.investigation.reason}</p>
                                      {finding.investigation.context && (
                                        <p className="mt-2 text-xs leading-5 text-white/30 italic">Context: {finding.investigation.context}</p>
                                      )}
                                    </div>

                                    {finding.investigation.patch && (
                                      <div>
                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/70">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                          Patch Recommendation
                                        </div>
                                        <p className="mt-2 text-xs text-white/40">{finding.investigation.patch.title}</p>
                                        <div className="mt-3 space-y-2">
                                          <div className="relative rounded-lg bg-rose-400/[0.06] border border-rose-400/10 p-3">
                                            <div className="mb-1.5 flex items-center justify-between">
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300/70">Before</span>
                                            </div>
                                            <pre className="text-xs text-rose-100/80 whitespace-pre-wrap break-all">{finding.investigation.patch.before}</pre>
                                          </div>
                                          <div className="relative rounded-lg bg-emerald-400/[0.06] border border-emerald-400/10 p-3">
                                            <div className="mb-1.5 flex items-center justify-between">
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">After</span>
                                              <CopyButton
                                                text={finding.investigation.patch.after}
                                                copied={copiedField === `patch-${finding.file}-${finding.line}`}
                                                onCopy={(text) => handleCopy(text, `patch-${finding.file}-${finding.line}`)}
                                              />
                                            </div>
                                            <pre className="text-xs text-emerald-100/80 whitespace-pre-wrap break-all">{finding.investigation.patch.after}</pre>
                                          </div>
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-white/40">{finding.investigation.patch.explanation}</p>
                                      </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                                      <span>Confidence: <span className="font-semibold text-white/70 capitalize">{finding.investigation.confidence}</span></span>
                                      {finding.verification && (
                                        <span className="flex items-center gap-1.5">
                                          Verified: <span className={`font-semibold ${finding.verification.status === "Fixed" ? "text-emerald-300" : "text-rose-300"}`}>{finding.verification.status}</span>
                                        </span>
                                      )}
                                    </div>

                                    {finding.investigation.recommendation && (
                                      <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">Recommendation</p>
                                        <p className="text-sm leading-6 text-white/60">{finding.investigation.recommendation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {result.findings.length > 0 && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Framework Mappings</h3>
                  <div className="space-y-3">
                    {(() => {
                      const uniqueTypes = Array.from(new Set(result.findings.map(f => f.type)));
                      return uniqueTypes.map(type => {
                        const mitre = getMitreRefs(type);
                        const owasp = getOwaspRefs(type);
                        return (
                          <div key={type} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                            <h4 className="text-sm font-semibold text-white mb-2">{type}</h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">MITRE ATT&CK</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {mitre.map(ref => (
                                    <span key={ref.id} className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-white/60">
                                      {ref.id} <span className="text-white/30">– {ref.name}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">OWASP Top 10</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {owasp.map(ref => (
                                    <span key={ref.id} className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-white/60">
                                      {ref.id} <span className="text-white/30">– {ref.name}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#060a08]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row sm:px-10 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg border border-emerald-100/35 bg-gradient-to-br from-emerald-100 to-emerald-400 text-[#052513]">
              <ShieldIcon className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-[-0.04em] text-white/80">Guardian</span>
          </div>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Guardian AI. Autonomous security engineering.</p>
        </div>
      </footer>

      <ToastContainer toasts={toasts} />
    </main>
  );
}