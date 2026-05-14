export interface Installation {
	id: string
	projectId: string
	status: 'Pendiente' | 'En progreso' | 'Completada'
	scheduledAt?: string
}