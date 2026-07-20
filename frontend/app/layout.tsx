import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://guardian-gamma-vert.vercel.app";

const project = {
  name: "Guardian",
  fullName: "Guardian — Autonomous AI Security Engineer",
  description:
    "AI-powered GitHub security scanner with AI investigation, MITRE ATT&CK mapping, OWASP analysis, patch generation, and executive reports.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
  default: project.fullName,
  template: `%s | Guardian`,
},

  description: project.description,

  keywords: [
    "AI Security",
    "GitHub Security",
    "Repository Scanner",
    "Static Analysis",
    "OWASP Top 10",
    "MITRE ATT&CK",
    "DevSecOps",
    "Cybersecurity",
  ],

  authors: [
    {
      name: "Ayush Sharma",
      url: "https://github.com/ayush14sharmauser",
    },
  ],
robots: {
  index: true,
  follow: true,
},
category: "Technology",
  openGraph: {
    title: project.fullName,
    description: project.description,
    url: siteUrl,
    siteName: project.name,
    type: "website",
     images: [
       {
         url: "/og-image.png",
         width: 1200,
         height: 630,
         alt: "Guardian",
       },
     ],
  },

  twitter: {
    card: "summary_large_image",
    title: project.fullName,
    description: project.description,
     images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#05070A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${mono.variable}`}
    >
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}