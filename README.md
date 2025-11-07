<div align="center">

# 🌙 Yoruhime (夜姫)

### Modern Anime Streaming Platform

[![Live Demo](https://img.shields.io/badge/demo-online-success?style=for-the-badge&logo=vercel)](https://yoruhime.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**A beautiful, fast, and feature-rich anime streaming platform built with modern web technologies**

[🚀 Live Demo](https://yoruhime.vercel.app/) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

</div>

---

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🎬 **Vast Library** | Access thousands of anime titles via HiAnime scraper |
| 🎥 **Embedded Player** | HLS streaming with adaptive quality (360p-1080p) |
| 🔍 **Smart Search** | Real-time suggestions with auto-complete |
| 🎨 **Modern UI** | Glassmorphism design with smooth animations |
| 📱 **Responsive** | Optimized for desktop, tablet, and mobile |
| ⚡ **Lightning Fast** | Serverless architecture on Vercel |
| 🌐 **Multi-Quality** | Stream in SD, HD, or Full HD based on your connection |
| 📝 **Subtitles** | Customizable subtitle tracks |
| 🎯 **User-Friendly** | Intuitive navigation and clean interface |

</div>

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![HiAnime](https://img.shields.io/badge/HiAnime-Scraper-FF6B6B?style=for-the-badge&logo=anime&logoColor=white)

### Key Libraries
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Video Player**: HLS.js for adaptive streaming
- **Routing**: Wouter (lightweight alternative to React Router)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Data Source**: HiAnime API via `aniwatch` npm package
- **Forms**: React Hook Form with Zod validation

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yoruhime.git
   cd yoruhime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:5000
   ```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5000 |
| `npm run build` | Build for production |
| `npm start` | Start production server |

---

## 🏗️ Project Structure

```
yoruhime/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and helpers
│   │   └── hooks/       # Custom React hooks
│   └── index.html
├── server/              # Express backend
│   ├── routes/          # API routes
│   └── index.ts         # Server entry point
├── api/                 # Vercel serverless functions
├── shared/              # Shared types and schemas
└── public/              # Static assets
```

---

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

The project is optimized for Vercel with serverless functions configured in `vercel.json`.

---

## 🎯 Key Features Explained

### Custom Video Player
- **HLS Adaptive Streaming**: Automatically adjusts quality based on network speed
- **Quality Selection**: Manual control for 360p, 480p, 720p, and 1080p
- **Subtitle Support**: Multiple subtitle tracks with customization
- **Playback Controls**: Speed adjustment, volume control, progress seeking
- **Picture-in-Picture**: Watch while browsing other content
- **Full-Screen Mode**: Immersive viewing experience
- **Mobile Optimized**: Touch controls and screen orientation lock

### HiAnime Integration
Yoruhime leverages the **HiAnime scraper** through the `aniwatch` npm package to provide:
- Real-time anime data and metadata
- Episode information and streaming sources
- Search functionality with autocomplete
- Trending and top-airing anime lists
- Multiple server options for reliability

### Serverless Architecture
- **Frontend**: Static site generated with Vite
- **Backend**: Express.js API routes as Vercel serverless functions
- **Benefits**: Automatic scaling, global CDN, zero server management

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [HiAnime](https://hianime.to/) for anime data via the `aniwatch` scraper
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Vercel](https://vercel.com/) for hosting and serverless functions

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ by anime fans, for anime fans

[⬆ Back to Top](#-yoruhime-夜姫)

</div>
