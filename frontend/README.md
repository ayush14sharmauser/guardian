🛡️ Guardian – Autonomous AI Security Engineer

Guardian is an AI-powered security engineering platform built to analyze GitHub repositories. It spots security vulnerabilities, explains what they mean, offers step-by-step fixes, double-checks your changes, and packages all this into polished, executive-level reports.

While most static analyzers just spit out endless lists, Guardian actually digs into your code, shows you why a vulnerability matters, outlines how to fix it, and gives you a real sense of the risk involved.

🌐 Live Demo

https://guardian-gamma-vert.vercel.app

💻 GitHub Repository

https://github.com/ayush14sharmauser/guardian

🎯 The Problem

Modern GitHub repos are huge—sometimes with thousands of files. Reviewing everything by hand is slow and painful, and most security tools just drown developers in findings with zero context or advice.

Guardian tackles this by combining automated scanning with AI-powered investigation. It doesn’t just find problems. It explains their impact, links them to frameworks like OWASP Top 10 and MITRE ATT&CK, and shows you exactly what to do about them. Plus, you get slick, executive-ready reports in one click.

✨ Features

- Smart, AI-based analysis for any GitHub repo
- Detects secrets and credentials hiding in code
- AI-driven investigation of every security issue
- Grades risks and helps prioritize
- Generates clear, actionable fix instructions
- Built-in verification
- Maps findings to MITRE ATT&CK and OWASP Top 10
- Executive-level reporting
- Export options: PDF, Markdown, and JSON
- Interactive security dashboards
- Fast, modern UI with smooth animations and real-time updates

📸 Project Preview

Landing Page
![Landing Page](./public/screenshots/landing.png)

Repository Analysis
![Analysis](./public/screenshots/analysis.png)

Security Dashboard
![Dashboard](./public/screenshots/dashboard.png)

AI Findings
![Findings](./public/screenshots/findings.png)

Executive Report
![Report](./public/screenshots/report.png)

Mobile View
![Mobile](./public/screenshots/mobile.png)

🏗️ Architecture

GitHub Repository
     │
     ▼
Repository Scanner
     │
     ▼
Security Analysis Engine
   ┌──────┬───────────┬────────────┐
   ▼      ▼           ▼
Secret Detection  Risk Analysis  AI Investigation
   │      │           │
   └──────┼───────────┘
     ▼
OWASP & MITRE Mapping
     │
     ▼
Executive Report Generator
     │
     ▼
Interactive Security Dashboard

🛠️ Tech Stack

Category        Technologies
Frontend        Next.js 16, React 19, TypeScript
Styling         Tailwind CSS v4, Framer Motion
Backend         Next.js API Routes
AI              GPT-powered Security Analysis
Security        OWASP Top 10, MITRE ATT&CK
Reports         PDF, Markdown, JSON
Deployment      Vercel
Version Control Git & GitHub

🚀 Getting Started

Prerequisites

- Node.js 18+
- npm
- Git

Clone the repository

git clone https://github.com/ayush14sharmauser/guardian.git
cd guardian/frontend

Install dependencies

npm install

Start the development server

npm run dev

Then head to:

http://localhost:3000

🔄 How Guardian Works

1. You enter a GitHub repository URL.
2. Guardian pulls in the repository’s details.
3. The security engine analyzes the codebase.
4. AI digs into anything fishy it finds.
5. Each finding gets a risk level.
6. Issues are mapped to OWASP Top 10.
7. They're also mapped to MITRE ATT&CK.
8. AI creates step-by-step remediation advice.
9. Guardian verifies if fixes are legit.
10. You get interactive dashboards and downloadable reports.

📂 Project Structure

guardian/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   └── package.json
│
├── README.md
└── LICENSE

📈 Roadmap

- AI-powered repo analysis
- Secret detection
- Risk assessment
- AI investigation
- Patch recommendations
- Verification engine
- OWASP Top 10 mapping
- MITRE ATT&CK mapping
- Executive reports
- Authentication (coming soon)
- Scan history (coming soon)
- Team collaboration (coming soon)
- GitHub App integration (coming soon)
- CI/CD integration (coming soon)
- Multi-repository scanning (coming soon)
- Historical vulnerability tracking (coming soon)

🤝 Contributing

Want to help out? Great!

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a pull request

Just make sure you add documentation and tests for new features.

📄 License

This project uses the MIT License. Check the LICENSE file for full details.

🙏 Acknowledgements

Big thanks to the industry standards and practices that helped shape Guardian, including:

- OWASP Top 10
- MITRE ATT&CK Framework
- Secure Software Development Lifecycle (SSDLC)
- AI-fueled vulnerability analysis
- Modern DevSecOps ideas

🌟 Why Guardian?

Guardian does more than scan your repositories. It acts like a true AI Security Engineer—finding real issues, explaining why they matter, giving you smart, actionable advice, double-checking your fixes, and making fancy reports for management. Secure development finally feels approachable.

Built with ❤️ on Next.js, React, TypeScript, Tailwind CSS, Framer Motion, and a powerful AI security engine.

🤖 AI Development Workflow (GPT-5.6 & Codex)

Guardian was designed and built with a little help from OpenAI’s GPT-5.6 and Codex throughout development.

GPT-5.6 helped:

- Plan the app architecture
- Refine the security analysis workflow
- Improve UI copy and user experience
- Review docs and README content
- Double-check production readiness

Codex stepped in to:

- Speed up React and Next.js component development
- Assist with TypeScript and debugging
- Optimize UI layouts, animations, and responsiveness
- Troubleshoot build and deployment hiccups
- Sharpen code through iteration

Developer Contribution

All features, design, architecture, integration, testing, deployment, and final checks were driven by the project author. AI made for a great coding partner, speeding up implementation and raising code quality, but every key product decision stayed human.