# Drone Video Analysis Client

A React-based web application for streaming and analyzing drone video footage using HLS (HTTP Live Streaming). Connect to any custom backend to view your live or recorded video data. This removes the dependency on a potentially untrusted 3rd party (e.g. DJI, Youtube, etc...) to store and access your video data.

## Features

- Live streaming of drone video footage
- HLS video playback support
- Responsive design for desktop and mobile viewing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/drone-video-analysis-client.git
   cd drone-video-analysis-client
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   ```
   cp .env.example .env
   ```
   - Update .env variables to match your backend configuration

## Running the Application

### Development Mode

```
npm start
# or
yarn start
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Production Build

```
npm run build
# or
yarn build
```

This will create an optimized production build in the `build` folder.

To serve the production build locally:
```
npx serve -s build
```

## Deployment

This application can be easily deployed to various platforms:

- Vercel or Netlify (recommended for simplicity)
- AWS Amplify
- AWS S3 + CloudFront
- GitHub Pages

For detailed deployment instructions, refer to the documentation of your preferred hosting platform.

## License

[MIT](LICENSE) 