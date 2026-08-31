import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export const AuthContext = createContext(undefined)

// Mirrors auth.js's syncUserFromSession(): the session's public.users row is
// the source of truth for role/name/status. A missing row (0 results, no
// error) means an OAuth sign-up whose handle_new_user() trigger skipped the
// insert because no role was chosen yet.
async function loadProfile(session) {
  if (!session) {
    return { user: null, needsProfileCompletion: false }
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, role, name, status')
    .eq('id', session.user.id)
    .maybeSingle()

  if (!error && data) {
    return { user: data, needsProfileCompletion: false }
  }
  return { user: null, needsProfileCompletion: true }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // Do NOT call supabase.auth.getSession() here as well. onAuthStateChange
    // always fires one 'INITIAL_SESSION' event once Supabase has finished
    // resolving the session (including exchanging a Google OAuth redirect's
    // token), so it alone is the reliable source of truth. Calling
    // getSession() separately on mount can race that resolution and read an
    // empty session right after an OAuth redirect (see auth.js).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      const { user: profile, needsProfileCompletion: incomplete } = await loadProfile(newSession)
      setUser(profile)
      setNeedsProfileCompletion(incomplete)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }
    return { data }
  }

  async function signInWithGoogle(redirectTo) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) return { error }
    return { data }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user,
    authReady,
    needsProfileCompletion,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
