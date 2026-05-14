export type UserRole = 'admin' | 'project_manager' | 'technician' | 'viewer'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface SignInCredentials {
  email: string
  password: string
}