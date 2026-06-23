# SentinelAI — Workforce Fatigue & Wellness Platform (MVP Frontend)

An AI-powered fatigue and biometric risk monitoring system built for the world's most demanding work environments. It continuously fuses computer vision, IoT telemetry, and physiological signals to score every worker's risk — in real time, at industrial scale.

This repository contains the enterprise-grade, frontend-only MVP. Built with a consistent SaaS design system across three role-based experiences: **Employee**, **Manager**, and **Owner**.

> Frontend only. All data is mocked/simulated — there is no backend.

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (light/dark theme via CSS variables)
- **React Router v6** (role-based routing)
- **Recharts** (charts & analytics)
- **lucide-react** (professional icon set)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. From the landing page, click **Try the live demo**, choose a role, enter any 6-digit code on the OTP screen, and you'll land in that role's workspace.

```bash
npm run build    # production build
npm run preview  # preview the build
```

## Roles & routes

### Employee — `/user/*`
Dashboard · Live Monitoring · Alert Center · Break Management · Leave Management · Reports · Profile · Settings · Support

### Manager — `/admin/*`
Dashboard · Workforce · Employee Detail · Alerts · Fatigue Analytics · Devices · Approvals · Reports · Onboarding · Hierarchy · Audit Logs · Settings

### Owner — `/owner/*`
Dashboard · Activity · User Management · Company Management · IoT Fleet · Billing · Revenue · Reports · Settings


