# TS Orbit - Enterprise Business Operations Platform

> **TS Orbit** (سامانه مدیریت یکپارچه عملیات و پروژه‌های سازمانی)
> A modern, full-stack Multi-Tenant Enterprise Operations & Agency Management Portal built with React, TypeScript, Tailwind CSS, Express, and WebSocket architecture.

---

## 🌟 Key Features (ویژگی‌های کلیدی)

- **Multi-Tenant Architecture & Org Builder**: Dynamic department management, modular permissions, and custom organization structures.
- **Project & Task Management**: Real-time project tracking, interactive status selectors, progress monitoring, and custom table layouts.
- **Client Portal**: Secure token-based external access for client feedback, approvals, and live project monitoring.
- **Department Technical Views**: Specialized tools for Development, SEO, Content Marketing, and QA Bug tracking.
- **Approval Center**: System owner approval workflows, role-based access control (RBAC), and security audit logs.
- **System Notifications**: Real-time notification streams with global bubble tooltips.
- **Adaptive UI**: Responsive design with full RTL (Persian / Vazirmatn typography) and LTR support, plus dark & light mode themes.

---

## 🛠️ Tech Stack (تکنولوژی‌های استفاده‌شده)

- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion React.
- **Backend**: Node.js, Express, Socket.IO, esbuild, file-backed JSON database service.
- **Styling**: Tailwind CSS with custom RTL typography and dark/light modes.

---

## 🚀 Getting Started (راه اندازی پروژه)

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Development Mode

Start the full-stack development server (Express + Vite on port 3000):

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 3. Production Build

Compile the static client assets with Vite and bundle the Node backend using esbuild:

```bash
npm run build
```

### 4. Production Start

Launch the compiled CommonJS backend server:

```bash
npm run start
```

---

## 📄 License

Internal Enterprise License. Designed and engineered for TS Orbit.
