# SentinelAI — Workforce Fatigue & Wellness Platform (MVP Frontend)

An enterprise-grade, frontend-only MVP for **SentinelAI**, an AI-powered workforce fatigue and wellness platform. Built with a consistent SaaS design system across three role-based experiences: **Employee**, **Manager**, and **Owner**.

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

## Design system

Reusable primitives live in `src/components/ui` (Button, Card, Badge, Input, Avatar, Modal, Drawer, Tabs, Switch, Progress, DataTable, Dropdown) and shared widgets in `src/components/shared` (KPI cards, gauge, charts, page header, empty/loading/error states, report builder).

Every screen includes layouts, KPIs, widgets, tables, charts, filters, and empty/loading/error states, and is fully mobile responsive.

## Project structure

```
src/
  components/
    ui/        # design-system primitives
    shared/    # KPI cards, charts, gauges, states
    layout/    # AppShell (sidebar + topbar)
  features/
    auth/      # landing, role select, OTP
    employee/  # employee screens
    manager/   # manager screens
    owner/     # owner screens
  lib/         # auth, theme, nav config, mock data, utils
```
