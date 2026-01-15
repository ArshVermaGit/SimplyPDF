<!-- HEADER -->
<br />
<div align="center">
  <a href="https://github.com/ArshVermaGit/SimplyPDF">
    <img src="public/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">SimplyPDF</h3>

  <p align="center">
    The Ultimate, Privacy-Focused PDF Swiss-Army Knife
    <br />
    <a href="https://simplypdf.vercel.app">View Demo</a>
    ·
    <a href="https://github.com/ArshVermaGit/SimplyPDF/issues">Report Bug</a>
    ·
    <a href="https://github.com/ArshVermaGit/SimplyPDF/issues">Request Feature</a>
  </p>
</div>

<!-- BADGES -->
<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://github.com/ArshVermaGit/SimplyPDF/blob/main/LICENSE)

</div>

<br />

### Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/) & [pdf.js](https://mozilla.github.io/pdf.js/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Host**: [Vercel](https://vercel.com/)

<br />

<!-- ABOUT THE PROJECT -->

## ✨ About The Project

**SimplyPDF** is a premium, high-performance web application designed to redefine how you interact with PDFs. Built with a hyper-polished, responsive aesthetic, it offers a seamless, desktop-class experience for editing, converting, and managing documents directly in your browser.

Unlike other tools that upload your data to remote servers, SimplyPDF operates **entirely client-side**. Your sensitive documents never leave your device, ensuring maximum privacy and security without compromising on power or features.

### Key Features

- ⚡ **Client-Side Processing**: Zero server uploads. All magic happens locally in your browser for 100% privacy.
- 💎 **Premium Design**: A stunning, responsive UI built with **Tailwind CSS 4**, featuring glassmorphism, micro-interactions, and fluid animations.
- 📝 **Advanced Editor**: Full suite of professional tools—add text, signatures, shapes, and images with ease.
- 🛠️ **16+ Powerful Tools**: Merge, Split, Compress, Convert (Word/Excel/JPG), Organize, Watermark, and more.
- 🔒 **Enterprise Grade**: Secure by design with no data retention.

<!-- GETTING STARTED -->

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or yarn

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/ArshVermaGit/SimplyPDF.git
    ```
2.  **Install dependencies**
    ```sh
    npm install
    ```
3.  **Configure Environment**
    Create a `.env.local` file based on the following variables:
    ```sh
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
    ```
4.  **Start the server**
    ```sh
    npm run dev
    ```

### Project Structure

```bash
simply-pdf/
├── src/
│   ├── app/                 # Next.js App Router (pages and tools)
│   │   ├── merge-pdf/       # Merge Tool
│   │   ├── split-pdf/       # Split Tool
│   │   └── ...
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── pdf/             # PDF-specific components
│   │   └── auth/            # Authentication components
│   ├── lib/                 # Utilities and helpers
│   └── types/               # Shared TypeScript definitions
├── public/                  # Static assets
└── ...
```

<!-- DOCUMENTATION -->

## 📚 Documentation

Detailed information about the project's health and contribution guidelines:

- [**Contributing**](CONTRIBUTING.md): Guidelines for submitting code and reporting issues.
- [**Code of Conduct**](CODE_OF_CONDUCT.md): Our standards for a healthy community.
- [**Security Policy**](SECURITY.md): How to report security vulnerabilities.
- [**Support**](SUPPORT.md): How to get help with SimplyPDF.
- [**Changelog**](CHANGELOG.md): Track every update and improvement.
- [**Roadmap**](ROADMAP.md): Our vision for the future of SimplyPDF.

<!-- CONTRIBUTING -->

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn and create. Any contributions you make are **greatly appreciated**.

Please check our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

<!-- AUTHOR -->

## 👤 Author

**Arsh Verma**

- **Portfolio**: [arshcreates.vercel.app](https://arshcreates.vercel.app)
- **GitHub**: [@ArshVermaGit](https://github.com/ArshVermaGit)
- **LinkedIn**: [Arsh Verma](https://www.linkedin.com/in/arshvermadev/)
- **X (Twitter)**: [@TheArshVerma](https://x.com/TheArshVerma)

<!-- LICENSE -->

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<br />
<div align="center">
  Made with ❤️ by Arsh Verma
</div>
