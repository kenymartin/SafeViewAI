# SafeView AI

A cross-platform application that uses AI to detect and modify inappropriate content in movies and TV shows in real-time.

## Features

- Real-time content analysis using AI
- Cross-platform support (Smart TVs, tablets, mobile phones)
- Remote control app for configuration
- Multiple content modification options (blur, mute, cut)
- Customizable content filtering preferences

## Project Structure

```
safestream-ai/
├── apps/
│   ├── tv-app/              # Electron frontend
│   ├── mobile-remote/       # React Native app
│   └── backend/             # Node.js + FFmpeg + AI logic
├── libs/
│   └── shared/              # Shared types, constants, filters
├── docker/
│   └── docker-compose.yml
├── tsconfig.base.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM 8+
- FFmpeg
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/safeview-ai.git
cd safeview-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Start development servers:
```bash
pnpm dev
```

## Development

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm lint` - Run linting

## License

MIT

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests. 