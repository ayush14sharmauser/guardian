# 🛡️ Guardian – Autonomous AI Security Engineer

Guardian is an AI-powered security engineering platform that analyzes GitHub repositories, identifies security vulnerabilities, explains their impact, generates remediation guidance, verifies fixes, and produces executive-ready security reports.

Unlike traditional static scanners, Guardian combines automated repository analysis with AI-assisted investigation to help developers understand **why** a vulnerability exists, **how** to fix it, and **how severe the risk is**.

---

## 🌐 Live Demo

**https://guardian-gamma-vert.vercel.app**

## 💻 GitHub Repository

**https://github.com/ayush14sharmauser/guardian**

---

# 🎯 Problem Statement

Modern GitHub repositories often contain thousands of files, making manual security reviews slow, inconsistent, and error-prone. Existing security tools frequently overwhelm developers with raw findings but provide little context or remediation guidance.

Guardian solves this problem by combining automated repository analysis with AI-powered investigation to detect security issues, explain their impact, map findings to industry-standard frameworks such as **OWASP Top 10** and **MITRE ATT&CK**, and generate actionable remediation guidance along with executive-ready reports.

---

# ✨ Features

- 🔍 AI-powered GitHub repository analysis
- 🔐 Secret & credential detection
- 🧠 AI-assisted security investigation
- ⚠️ Risk assessment & security grading
- 🛠️ AI-generated remediation guidance
- ✅ Verification engine
- 🗺️ MITRE ATT&CK mapping
- 🛡️ OWASP Top 10 mapping
- 📄 Executive security reports
- 📤 Export reports (PDF, Markdown & JSON)
- 📊 Interactive security dashboard
- ⚡ Responsive modern UI
- 🎨 Smooth animations and real-time feedback

---

# 📸 Project Preview

> Replace these placeholders with screenshots from your deployed application.

| Landing Page |
|---------------|
| ![Landing Page](./public/screenshots/landing.png) |

| Repository Analysis |
|---------------------|
| ![Analysis](./public/screenshots/analysis.png) |

| Security Dashboard |
|--------------------|
| ![Dashboard](./public/screenshots/dashboard.png) |

| AI Findings |
|-------------|
| ![Findings](./public/screenshots/findings.png) |

| Executive Report |
|------------------|
| ![Report](./public/screenshots/report.png) |

| Mobile View |
|-------------|
| ![Mobile](./public/screenshots/mobile.png) |

---

# 🏗️ Architecture

```text
                 GitHub Repository
                        │
                        ▼
              Repository Scanner
                        │
                        ▼
             Security Analysis Engine
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
 Secret Detection   Risk Analysis   AI Investigation
       │                │                │
       └────────────────┼────────────────┘
                        ▼
          OWASP & MITRE Mapping Engine
                        │
                        ▼
             Executive Report Generator
                        │
                        ▼
              Interactive Security Dashboard
```

---

# 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Backend | Next.js API Routes |
| AI | GPT-powered Security Analysis |
| Security | OWASP Top 10, MITRE ATT&CK |
| Reports | PDF, Markdown, JSON |
| Deployment | Vercel |
| Version Control | Git & GitHub |

---

# 🚀 Installation

## Prerequisites

- Node.js 18+
- npm
- Git

## Clone Repository

```bash
git clone https://github.com/ayush14sharmauser/guardian.git
cd guardian/frontend
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🔄 How Guardian Works

1. User enters a GitHub repository URL.
2. Guardian retrieves repository metadata.
3. The security engine analyzes the repository.
4. AI investigates detected findings.
5. Risk severity is calculated.
6. Findings are mapped to OWASP Top 10.
7. Findings are mapped to MITRE ATT&CK.
8. AI generates remediation guidance.
9. Guardian verifies recommendations.
10. Interactive dashboards and downloadable reports are generated.

---

# 📂 Project Structure

```
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
```

---

# 📈 Future Roadmap

- [x] AI-powered repository analysis
- [x] Secret detection
- [x] Risk assessment
- [x] AI investigation
- [x] Patch recommendations
- [x] Verification engine
- [x] OWASP Top 10 mapping
- [x] MITRE ATT&CK mapping
- [x] Executive reports
- [ ] Authentication
- [ ] Scan history
- [ ] Team collaboration
- [ ] GitHub App integration
- [ ] CI/CD integration
- [ ] Multi-repository scanning
- [ ] Historical vulnerability tracking

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit meaningful changes.
4. Push your branch.
5. Open a Pull Request.

Please ensure new features include documentation and appropriate testing.

---

# 📄 License

This project is licensed under the **MIT License**.

See the **LICENSE** file for details.

---

# 🙏 Acknowledgements

Guardian is inspired by modern application security practices and industry standards, including:

- OWASP Top 10
- MITRE ATT&CK Framework
- Secure Software Development Lifecycle (SSDLC)
- AI-assisted vulnerability analysis
- Modern DevSecOps practices

---

# 🌟 Why Guardian?

Guardian isn't just another repository scanner—it acts as an **AI Security Engineer** that helps developers:

- Detect vulnerabilities
- Understand why they matter
- Receive AI-generated remediation guidance
- Verify fixes
- Produce executive-ready security reports

making secure software development faster, easier, and more accessible.

---

Built with ❤️ using **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **AI-powered security analysis**.