# Guardian Architecture

## Project Overview

Guardian is an AI-powered security engineering platform built to analyze GitHub repositories for security vulnerabilities and present actionable remediation guidance.

Unlike traditional static scanners that only identify issues, Guardian combines automated repository analysis with AI-assisted investigation to explain findings, estimate risk, recommend fixes, verify remediation, and generate executive-ready security reports.

The application follows a modern client-server architecture using Next.js, where the frontend provides an interactive dashboard while the backend performs repository analysis and orchestrates AI-powered security workflows.
---







## System Architecture

Guardian follows a client-server architecture where the frontend is responsible for user interaction and visualization, while the backend performs repository analysis and AI-powered security processing.

```text
                    ┌─────────────────────────────┐
                    │          User               │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │    Next.js Frontend UI      │
                    │                             │
                    │ • Hero Section              │
                    │ • Repository Input          │
                    │ • Dashboard                 │
                    │ • Reports                   │
                    └──────────────┬──────────────┘
                                   │
                        POST /api/analyze
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       Analysis Engine        │
                    │                             │
                    │ • Repository Analysis       │
                    │ • Secret Detection          │
                    │ • AI Investigation          │
                    │ • Risk Assessment           │
                    │ • Patch Generation          │
                    │ • Verification              │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │      Security Report         │
                    │                             │
                    │ • Dashboard                 │
                    │ • Executive Summary         │
                    │ • MITRE ATT&CK Mapping      │
                    │ • OWASP Mapping             │
                    │ • Patch Suggestions         │
                    └─────────────────────────────┘
```




---

## Project Structure

```
guardian/
│
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # Repository analysis API
│   │
│   ├── components/
│   │   ├── LiveTerminal.tsx
│   │   ├── ScrollReveal.tsx
│   │   ├── HowItWorksTimeline.tsx
│   │   └── Toast.tsx
│   │
│   ├── hooks/
│   │   └── useInView.ts
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── public/
│
├── AGENTS.md
├── CLAUDE.md
├── package.json
└── tsconfig.json
```

### Folder Responsibilities

| Folder | Purpose |
|---------|---------|
| **app/** | Contains the Next.js application, pages, API routes, and reusable UI components. |
| **app/api/** | Backend API endpoints responsible for repository analysis and AI orchestration. |
| **components/** | Reusable user interface components shared across the application. |
| **hooks/** | Custom React hooks used throughout the frontend. |
| **public/** | Static assets such as images and icons. |