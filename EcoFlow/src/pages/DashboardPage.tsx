export function DashboardPage() {
  return (
    <section className="page-card">
      <span className="pill">Feature-Sliced Design + Supabase</span>
      <h2>Dashboard operativo para EcoFlow</h2>
      <p className="subtle">
        Base visual y estructural preparada para conectar autenticación, proyectos,
        instalaciones y reportes sin mezclar responsabilidades.
      </p>

      <div className="page-grid" style={{ marginTop: 24 }}>
        <article className="metric-card">
          <strong>12</strong>
          <span>Proyectos en curso</span>
        </article>
        <article className="metric-card">
          <strong>4</strong>
          <span>Instalaciones activas</span>
        </article>
        <article className="metric-card">
          <strong>98%</strong>
          <span>Datos listos para RLS</span>
        </article>

        <article className="panel">
          <h3 className="section-title">Siguientes capas del scaffold</h3>
          <div className="list-grid">
            <div className="list-item">
              <span>app/</span>
              <span className="subtle">Providers, router y entrypoint</span>
            </div>
            <div className="list-item">
              <span>features/</span>
              <span className="subtle">Auth, projects, installations</span>
            </div>
            <div className="list-item">
              <span>lib/</span>
              <span className="subtle">Supabase, query client y schemas</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}