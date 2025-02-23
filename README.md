# My PWA

A Progressive Web Application built with React and TypeScript.

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v16 or higher)
- Yarn package manager

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/my-pwa.git
cd my-pwa
```

2. Install dependencies:

```bash
yarn install
```

### Development

Run the application locally in development mode:
```bash
yarn start
```

This will start the development server at [http://localhost:3000](http://localhost:3000). The page will automatically reload when you make changes to the code.

### Production Build

Create a production-ready build:
```bash
yarn build
```

This command creates an optimized production build in the `build` directory.

### Serving Production Build

To serve the production build locally:
```bash
yarn serve
```

This will serve the static files from the `build` directory, typically at [http://localhost:3000](http://localhost:3000).

### Testing

Run tests in watch mode (development):
```bash
yarn test
```

Generate test coverage report:
```bash
yarn test:coverage
```

Run tests in CI mode:
```bash
yarn test:ci
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start development server |
| `yarn build` | Create production build |
| `yarn serve` | Serve production build |
| `yarn test` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn test:ci` | Run tests in CI mode |
| `yarn lint` | Check for linting errors |
| `yarn lint:fix` | Fix linting errors |
| `yarn format` | Format code with Prettier |
| `yarn type-check` | Check TypeScript types |
