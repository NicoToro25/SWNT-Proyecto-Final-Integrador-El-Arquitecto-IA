export const queryKeys = {
  projects: (filters?: Record<string, string | number | boolean | undefined>) =>
    ['projects', filters ?? {}] as const,
  project: (projectId: string) => ['projects', projectId] as const,
  installations: () => ['installations'] as const,
  auth: () => ['auth'] as const,
}