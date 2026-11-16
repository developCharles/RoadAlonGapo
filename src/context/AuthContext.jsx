import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getProfile, signOut as apiSignOut } from '../lib/api'
import {
  demoEnabled,
  getDemoProfile,
  getDemoRole,
  setDemoRole as persistDemoRole,
  clearDemoRole
} from '../lib/demo'

const AuthContext = createContext(null)

function demoSessionFor(role) {
  const profile = getDemoProfile(role || getDemoRole())
  return {
    session: { user: { id: profile.id, email: profile.email } },
    profile
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId || !isSupabaseConfigured) {
      setProfile(null)
      return null
    }
    try {
      const p = await getProfile(userId)
      setProfile(p)
      return p
    } catch (e) {
      console.warn('[auth] profile load failed', e)
      setProfile(null)
      return null
    }
  }, [])

  useEffect(() => {
    if (demoEnabled()) {
      const demo = demoSessionFor()
      setSession(demo.session)
      setProfile(demo.profile)
      setLoading(false)
      return undefined
    }

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return
      setSession(next)
      if (next?.user) loadProfile(next.user.id)
      else setProfile(null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    if (demoEnabled()) {
      clearDemoRole()
      setSession(null)
      setProfile(null)
      return
    }
    await apiSignOut()
    setSession(null)
    setProfile(null)
  }, [])

  const enterDemo = useCallback((role) => {
    persistDemoRole(role)
    const demo = demoSessionFor(role)
    setSession(demo.session)
    setProfile(demo.profile)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (demoEnabled()) {
      const demo = demoSessionFor(profile?.role)
      setProfile(demo.profile)
      return demo.profile
    }
    if (session?.user?.id) return loadProfile(session.user.id)
    return null
  }, [session, loadProfile, profile])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      signOut,
      refreshProfile,
      enterDemo,
      demo: demoEnabled(),
      configured: isSupabaseConfigured
    }),
    [session, profile, loading, signOut, refreshProfile, enterDemo]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
