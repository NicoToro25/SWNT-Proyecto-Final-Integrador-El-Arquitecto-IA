import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="page-card">
      <h3 className="section-title">{title}</h3>
      <p className="subtle">{description}</p>
      {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
    </section>
  )
}