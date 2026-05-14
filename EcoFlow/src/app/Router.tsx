import type { ReactNode } from 'react'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { DashboardPage } from '@/pages/DashboardPage'
import { InstallationsPage } from '@/pages/InstallationsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectNewPage from '@/pages/ProjectNewPage'

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">EcoFlow</p>
          <h1>Arquitectura base del producto</h1>
          <p>Scaffold inicial alineado con React, Supabase y FSD.</p>
        </div>
        <nav className="app-nav" aria-label="Navegación principal">
          <a href="/">Dashboard</a>
          <a href="/projects">Proyectos</a>
          <a href="/installations">Instalaciones</a>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectNewPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/installations" element={<InstallationsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}