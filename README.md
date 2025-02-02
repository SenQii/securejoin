# SecureJoin

A web application that provides a secure verification layer for group joins, supporting multiple verification methods including security questions and OTP verification.

## Quick Start

```bash
# Install pnpm if you haven't
npm i -g pnpm

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

> **Note:** This project requires pnpm 8+ and Node.js 16+

## Features

- **Multiple Verification Methods**

  - Security Questions (Text & Multiple Choice)
  - OTP Verification (Email/Phone)
  - Combined Verification

- **Secure Group Links**

  - Generate secure join links
  - Support for multiple platforms (WhatsApp, Telegram, Instagram)
  - Real-time link validation

- **User-Friendly Interface**
  - Intuitive verification setup
  - Mobile-responsive design
  - RTL support

## Project Structure

```
src/
├── features/          # Feature-based modules
│   └── secure-link/   # Secure link feature
├── components/        # Shared UI components
├── hooks/            # Global hooks
├── lib/              # Utilities and configurations
└── types/            # TypeScript type definitions
```

## Tech Stack

- **Frontend Framework**: React 18
- **Type Safety**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
