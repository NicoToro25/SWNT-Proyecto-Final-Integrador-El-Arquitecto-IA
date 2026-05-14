import { supabase } from '@/lib/supabase/client'

import type { SignInCredentials } from '../types/auth.types'

export async function signInWithPassword({ email, password }: SignInCredentials) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}