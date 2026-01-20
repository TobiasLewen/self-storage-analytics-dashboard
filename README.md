# StorageHub - Self-Storage Analytics Dashboard

A modern analytics dashboard for self-storage facility management, built with React, TypeScript, and Vite. Provides real-time insights into occupancy rates, revenue metrics, customer analytics, and forecasting.

## Features

- **Executive Overview** - KPI cards for occupancy, revenue, available units, and rental duration with trend charts
- **Unit Performance** - Detailed metrics by unit size, profitability analysis, and occupancy tracking
- **Customer Analytics** - Customer segmentation, churn analysis, lifetime value tracking, and top customer insights
- **Forecast & Recommendations** - Revenue forecasting with confidence bands, pricing recommendations, and seasonal analysis
- **PDF Export** - Generate monthly reports as downloadable PDFs
- **Dark/Light Theme** - Toggle between themes with persistent preference
- **Responsive Design** - Mobile-friendly interface with collapsible sidebar

## Tech Stack

- **Frontend**: React 19, TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts 3
- **PDF Generation**: @react-pdf/renderer
- **Routing**: React Router 7
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd self-storage-analytics-dashboard
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173`

## Building for Production

### Build the application

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This creates an optimized production build in the `dist` folder.

### Preview the production build locally

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## Hosting the App in a Browser

### Option 1: Static File Hosting

After running `npm run build`, the `dist` folder contains static files that can be hosted on any web server:

- **Nginx**: Copy `dist` contents to your web root
- **Apache**: Copy `dist` contents to `htdocs`
- **GitHub Pages**: Push `dist` contents to `gh-pages` branch
- **Netlify**: Connect repo and set build command to `npm run build`, publish directory to `dist`
- **Vercel**: Connect repo - auto-detects Vite configuration

### Option 2: Cloud Platforms

**Netlify (Recommended for simplicity)**
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy

**Vercel**
1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Vercel auto-detects Vite - just deploy

**AWS S3 + CloudFront**
1. Build the project: `npm run build`
2. Create S3 bucket with static website hosting enabled
3. Upload `dist` contents to bucket
4. Configure CloudFront distribution pointing to S3

### Option 3: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t storagehub-dashboard .
docker run -p 8080:80 storagehub-dashboard
```

Access at `http://localhost:8080`

## Project Structure

```
src/
├── components/
│   ├── cards/          # KPI and Alert card components
│   ├── layout/         # Dashboard layout, Header, Sidebar
│   ├── reports/        # PDF export components
│   └── ui/             # Reusable UI components (Button, Card, Table, etc.)
├── contexts/           # React contexts (Theme)
├── data/               # Mock data and TypeScript types
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components (routes)
├── App.tsx             # Router configuration
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind config
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT
