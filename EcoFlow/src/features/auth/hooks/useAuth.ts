import { useMutation, useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query/queryKeys'

import { getCurrentUser, signInWithPassword, signOut } from '../services/authService'
import type { SignInCredentials } from '../types/auth.types'

export function useAuth() {
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth(),
    queryFn: getCurrentUser,
  })

  const signInMutation = useMutation({
    mutationFn: (credentials: SignInCredentials) => signInWithPassword(credentials),
  })

  const signOutMutation = useMutation({
    mutationFn: signOut,
  })

  return {
    user: sessionQuery.data ?? null,
    isLoading: sessionQuery.isLoading,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
  }
}