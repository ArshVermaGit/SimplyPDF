# Contributing to SimplyPDF

First off, thank you for considering contributing to SimplyPDF! It's people like you that make it such a great tool for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- **Check for existing issues**: Before opening a new issue, please search the repository to see if the bug has already been reported.
- **Use the template**: When creating a new issue, use the Bug Report template provided.
- **Provide details**: Include as much information as possible, such as steps to reproduce, browser version, and any relevant logs or screenshots.

### Suggesting Enhancements

- **Check for existing suggestions**: See if someone else has already suggested the enhancement.
- **Use the template**: Use the Feature Request template when opening an issue for an enhancement.
- **Explain the "Why"**: Describe why this enhancement would be useful to most users.

## Development Process

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/SimplyPDF.git
    cd SimplyPDF
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Create a branch** for your feature or fix. Use a descriptive name:
    - `feat/new-tool-name`
    - `fix/merge-pdf-bug`
    - `docs/update-readme`
5.  **Start coding!** Run the dev server:
    ```bash
    npm run dev
    ```

## Coding Standards

To ensure consistency and quality, we enforce strict standards:

- **TypeScript**: We use strict TypeScript. No `any` types allowed. Use shared types from `src/types/index.ts` where possible.
- **Formatting**: We use **Prettier**. You must format your code before committing:
  ```bash
  npm run format
  ```
- **Linting**: We use **ESLint**. Ensure your code passes all lint checks:

  ```bash
  npm run lint
  ```

  - Note: If you encounter errors, try `npm run lint:fix` to auto-correct some issues.

- **Styling**: Use **Tailwind CSS**. Avoid custom CSS classes unless absolutely necessary.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat: add rotate pdf tool`
  - `fix: resolve crash on upload`
  - `style: format code with prettier`

## Directory Structure

Understanding the project structure will help you place your contributions correctly:

- **`src/app`**: Application routes (strictly `page.tsx`, `layout.tsx`, `loading.tsx` only).
- **`src/components`**: Reusable UI components.
  - **`pages`**: Main page implementations (Client Components). All logic goes here.
  - **`sections`**: Modular sections (Hero, Features, etc.) used by pages.
  - **`ui`**: Generic reusable UI atoms (Buttons, Cards, BackgroundGradient).
  - **`layout`**: Global layout components (Navbar, Footer).
  - **`auth`**: Authentication components.
- **`src/lib`**: Utility functions and constants.
  - **`constants.ts`**: Global configuration (Tool definitions, navigation items).
  - **`legal-data.ts`**: Content for legal pages.
- **`src/hooks`**: Custom React hooks (e.g., `useScrollReveal`).
- **`src/types`**: Shared TypeScript definitions.

Thank you for your contributions!
