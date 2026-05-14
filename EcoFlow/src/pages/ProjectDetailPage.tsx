import { useParams } from 'react-router-dom'

export function ProjectDetailPage() {
  const { projectId } = useParams()

  return (
    <section className="page-card">
      <h2>Detalle de proyecto</h2>
      <p className="subtle">Scaffold de ruta listo para conectar queries por ID.</p>
      <div className="panel" style={{ marginTop: 20 }}>
        <strong>ID actual:</strong> {projectId ?? 'sin id'}
      </div>
    </section>
  )
}