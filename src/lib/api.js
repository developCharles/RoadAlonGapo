import { supabase, isSupabaseConfigured } from './supabase'
import { toCamel, toSnake } from './utils'
import {
  demoEnabled,
  getDemoProfile,
  getDemoReports,
  saveDemoReports,
  getDemoMessages,
  saveDemoMessages,
  getDemoRequests,
  saveDemoRequests,
  getDemoProfiles,
  saveDemoProfiles,
  getDemoLogs,
  saveDemoLogs,
  getDemoBackups,
  saveDemoBackups
} from './demo'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`

export function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function signInWithEmail(email, password) {
  if (demoEnabled()) {
    const profile = getDemoProfile()
    return { user: { id: profile.id, email: profile.email }, session: { user: { id: profile.id } } }
  }
  assertConfigured()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail({ name, email, password, role = 'citizen', ...rest }) {
  if (demoEnabled()) {
    const profile = { ...getDemoProfile(), name: name || getDemoProfile().name, email, role }
    return { user: { id: profile.id, email }, session: { user: { id: profile.id } }, profile }
  }
  assertConfigured()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        status: 'active',
        barangay: rest.barangay,
        position: rest.position,
        contact: rest.contact
      }
    }
  })
  if (error) throw error
  // The profile row is created by the `handle_new_user` trigger from the
  // metadata above, so this works even when email confirmation is required
  // and no session exists yet.
  return data
}

export async function signOut() {
  if (demoEnabled()) return
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email) {
  if (demoEnabled()) return
  assertConfigured()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  if (demoEnabled()) return
  assertConfigured()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  const { data } = await supabase.auth.getUser()
  const userId = data?.user?.id
  if (userId) {
    await updateProfile(userId, { passwordChanged: true })
  }
}

// ── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  if (demoEnabled()) return getDemoProfile()
  assertConfigured()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data ? toCamel(data) : null
}

export async function upsertProfile(profile) {
  if (demoEnabled()) return profile
  assertConfigured()
  const payload = toSnake(profile)
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? toCamel(data) : null
}

export async function updateProfile(userId, patch) {
  if (demoEnabled()) {
    const rows = getDemoProfiles()
    const existing = rows.find((p) => p.id === userId)
    if (!existing) {
      const created = { id: userId, role: 'citizen', status: 'active', ...patch }
      saveDemoProfiles([created, ...rows])
      return created
    }
    const next = rows.map((p) => (p.id === userId ? { ...p, ...patch } : p))
    saveDemoProfiles(next)
    return next.find((p) => p.id === userId)
  }
  assertConfigured()
  const { data, error } = await supabase
    .from('profiles')
    .update(toSnake(patch))
    .eq('id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? toCamel(data) : null
}

export async function fetchProfiles() {
  if (demoEnabled()) return getDemoProfiles()
  assertConfigured()
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(toCamel)
}

// ── Reports ──────────────────────────────────────────────────────────────────

export function mapReport(row) {
  return toCamel(row)
}

export async function fetchReports({ barangay, status, order = 'created_at.desc' } = {}) {
  if (demoEnabled()) {
    let rows = getDemoReports()
    if (barangay) rows = rows.filter((r) => r.barangay === barangay)
    if (status) rows = rows.filter((r) => r.status === status)
    const [col, dir] = order.split('.')
    const key = col === 'created_at' ? 'createdAt' : col
    rows = [...rows].sort((a, b) => {
      const av = a[key] || ''
      const bv = b[key] || ''
      return dir === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
    })
    return rows
  }
  assertConfigured()
  let query = supabase.from('reports').select('*')
  if (barangay) query = query.eq('barangay', barangay)
  if (status) query = query.eq('status', status)
  const [col, dir] = order.split('.')
  query = query.order(col, { ascending: dir === 'asc' })
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapReport)
}

export async function getReport(id) {
  if (demoEnabled()) return getDemoReports().find((r) => r.id === id) || null
  assertConfigured()
  const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapReport(data) : null
}

export async function insertReport(report) {
  if (demoEnabled()) {
    const reportRow = {
      ...report,
      id: newId(),
      createdAt: new Date().toISOString(),
      status: report.status || 'Pending',
      upvotes: report.upvotes || 0,
      upvotedBy: report.upvotedBy || [],
      communityImages: report.communityImages || []
    }
    saveDemoReports([reportRow, ...getDemoReports()])
    return reportRow
  }
  assertConfigured()
  const payload = toSnake(report)
  const { data, error } = await supabase.from('reports').insert(payload).select().maybeSingle()
  if (error) throw error
  return mapReport(data)
}

export async function updateReport(id, patch) {
  if (demoEnabled()) {
    const rows = getDemoReports()
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    saveDemoReports(next)
    return next.find((r) => r.id === id) || null
  }
  assertConfigured()
  const { data, error } = await supabase
    .from('reports')
    .update(toSnake(patch))
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? mapReport(data) : null
}

export async function deleteReport(id) {
  if (demoEnabled()) {
    saveDemoReports(getDemoReports().filter((r) => r.id !== id))
    return
  }
  assertConfigured()
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) throw error
}

export async function upvoteReport(id, voterKey) {
  if (demoEnabled()) {
    const report = getDemoReports().find((r) => r.id === id)
    if (!report) throw new Error('Report not found')
    const voters = Array.from(new Set([...(report.upvotedBy || []), voterKey]))
    return updateReport(id, { upvotes: voters.length, upvotedBy: voters })
  }
  assertConfigured()
  const { error } = await supabase.rpc('upvote_report', {
    p_report_id: id,
    p_voter: voterKey
  })
  if (error) throw error
  return getReport(id)
}

export async function addCommunityImage(id, imageUrl) {
  if (demoEnabled()) {
    const report = getDemoReports().find((r) => r.id === id)
    if (!report) throw new Error('Report not found')
    return updateReport(id, { communityImages: [...(report.communityImages || []), imageUrl] })
  }
  assertConfigured()
  const report = await getReport(id)
  if (!report) throw new Error('Report not found')
  return updateReport(id, { communityImages: [...(report.communityImages || []), imageUrl] })
}

export function subscribeReports(callback) {
  if (demoEnabled()) return () => {}
  assertConfigured()
  const channel = supabase
    .channel('reports-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => callback())
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── Messages ─────────────────────────────────────────────────────────────────

export async function fetchMessages(barangay) {
  if (demoEnabled()) {
    return getDemoMessages()
      .filter((m) => m.barangay === barangay)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  assertConfigured()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('barangay', barangay)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(toCamel)
}

export async function fetchAllMessages() {
  if (demoEnabled()) {
    return [...getDemoMessages()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  assertConfigured()
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(toCamel)
}

export async function insertMessage(message) {
  if (demoEnabled()) {
    const row = { ...message, id: newId(), createdAt: new Date().toISOString() }
    saveDemoMessages([...getDemoMessages(), row])
    return row
  }
  assertConfigured()
  const { data, error } = await supabase
    .from('messages')
    .insert(toSnake(message))
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? toCamel(data) : null
}

export async function markMessagesRead(barangay, role) {
  if (demoEnabled()) {
    const key = role === 'engineer' ? 'readByEngineer' : 'readByBarangay'
    saveDemoMessages(getDemoMessages().map((m) => (m.barangay === barangay ? { ...m, [key]: true } : m)))
    return
  }
  assertConfigured()
  const col = role === 'engineer' ? 'read_by_engineer' : 'read_by_barangay'
  const oppRole = role === 'engineer' ? 'barangay' : 'engineer'
  const { error } = await supabase
    .from('messages')
    .update({ [col]: true })
    .eq('barangay', barangay)
    .eq('sender_role', oppRole)
    .eq(col, false)
  if (error) throw error
}

export function subscribeMessages(barangay, callback) {
  if (demoEnabled()) return () => {}
  assertConfigured()
  const channel = supabase
    .channel(`messages-${barangay}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `barangay=eq.${barangay}` },
      () => callback()
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── Official access requests ─────────────────────────────────────────────────

export async function fetchOfficialRequests(status = null) {
  if (demoEnabled()) {
    const rows = getDemoRequests()
    return status ? rows.filter((r) => r.status === status) : rows
  }
  assertConfigured()
  let query = supabase.from('official_requests').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(toCamel)
}

export async function insertOfficialRequest(request) {
  if (demoEnabled()) {
    const row = { ...request, id: newId(), createdAt: new Date().toISOString() }
    saveDemoRequests([row, ...getDemoRequests()])
    return row
  }
  assertConfigured()
  const { data, error } = await supabase
    .from('official_requests')
    .insert(toSnake(request))
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? toCamel(data) : null
}

export async function reviewOfficialRequest(id, decision, reviewerId, notes = null) {
  if (demoEnabled()) {
    const rows = getDemoRequests().map((r) =>
      r.id === id
        ? {
            ...r,
            status: decision,
            notes: notes ?? r.notes,
            reviewedAt: new Date().toISOString(),
            reviewedBy: reviewerId
          }
        : r
    )
    saveDemoRequests(rows)
    return rows.find((r) => r.id === id) || null
  }
  assertConfigured()
  const { data, error } = await supabase
    .from('official_requests')
    .update({
      status: decision,
      notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId
    })
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? toCamel(data) : null
}

// ── Storage ──────────────────────────────────────────────────────────────────

export async function uploadFile(bucket, path, file) {
  if (demoEnabled()) return URL.createObjectURL(file)
  assertConfigured()
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// ── System logs / backups ────────────────────────────────────────────────────

export async function writeLog(level, message, meta = null) {
  if (demoEnabled()) {
    const row = {
      id: `log-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      level,
      message,
      meta,
      createdAt: new Date().toISOString()
    }
    saveDemoLogs([row, ...getDemoLogs()])
    return
  }
  if (!supabase) return
  const { error } = await supabase.from('system_logs').insert({ level, message, meta })
  if (error) console.warn('[log]', error.message)
}

export async function fetchLogs() {
  if (demoEnabled()) return getDemoLogs()
  assertConfigured()
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw error
  return (data || []).map(toCamel)
}

export async function clearLogs() {
  if (demoEnabled()) {
    saveDemoLogs([])
    return
  }
  assertConfigured()
  const { error } = await supabase.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

export async function saveBackup(snapshot) {
  if (demoEnabled()) {
    const row = {
      id: `backup-${Date.now()}`,
      snapshot,
      createdAt: new Date().toISOString()
    }
    saveDemoBackups([row, ...getDemoBackups()])
    return row
  }
  assertConfigured()
  const { error } = await supabase.from('backups').insert({ created_at: new Date().toISOString(), snapshot })
  if (error) throw error
}

export async function fetchBackups() {
  if (demoEnabled()) return getDemoBackups()
  assertConfigured()
  const { data, error } = await supabase.from('backups').select('*').order('created_at', { ascending: false }).limit(50)
  if (error) throw error
  return (data || []).map(toCamel)
}
