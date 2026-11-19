// ── Small helpers ────────────────────────────────────────────────────────────

export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function timeAgo(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(value)
}

export function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function toCamel(row) {
  if (!row) return row
  const map = {
    image_url: 'imageUrl',
    community_images: 'communityImages',
    upvoted_by: 'upvotedBy',
    reported_by: 'reportedBy',
    reporter_name: 'reporterName',
    created_at: 'createdAt',
    verified_at: 'verifiedAt',
    rejected_at: 'rejectedAt',
    resolved_at: 'resolvedAt',
    assigned_at: 'assignedAt',
    assigned_team: 'assignedTeam',
    progress_stage: 'progressStage',
    repair_stage: 'repairStage',
    work_description: 'workDescription',
    resolve_image_url: 'resolveImageUrl',
    barangay_remarks: 'barangayRemarks',
    stage1_at: 'stage1At',
    stage2_at: 'stage2At',
    stage3_at: 'stage3At',
    stage4_at: 'stage4At',
    stage5_at: 'stage5At',
    sender_id: 'senderId',
    sender_name: 'senderName',
    sender_role: 'senderRole',
    read_by_engineer: 'readByEngineer',
    read_by_barangay: 'readByBarangay',
    requested_role: 'requestedRole',
    submitted_at: 'submittedAt',
    reviewed_at: 'reviewedAt',
    reviewed_by: 'reviewedBy',
    password_changed: 'passwordChanged',
    emp_id: 'empId'
  }
  const out = { ...row }
  Object.entries(map).forEach(([snake, camel]) => {
    if (snake in out) {
      out[camel] = out[snake]
      delete out[snake]
    }
  })
  return out
}

export function toSnake(obj) {
  const map = {
    imageUrl: 'image_url',
    communityImages: 'community_images',
    upvotedBy: 'upvoted_by',
    reportedBy: 'reported_by',
    reporterName: 'reporter_name',
    createdAt: 'created_at',
    verifiedAt: 'verified_at',
    rejectedAt: 'rejected_at',
    resolvedAt: 'resolved_at',
    assignedAt: 'assigned_at',
    assignedTeam: 'assigned_team',
    progressStage: 'progress_stage',
    repairStage: 'repair_stage',
    workDescription: 'work_description',
    resolveImageUrl: 'resolve_image_url',
    barangayRemarks: 'barangay_remarks',
    stage1At: 'stage1_at',
    stage2At: 'stage2_at',
    stage3At: 'stage3_at',
    stage4At: 'stage4_at',
    stage5At: 'stage5_at',
    senderId: 'sender_id',
    senderName: 'sender_name',
    senderRole: 'sender_role',
    readByEngineer: 'read_by_engineer',
    readByBarangay: 'read_by_barangay',
    requestedRole: 'requested_role',
    submittedAt: 'submitted_at',
    reviewedAt: 'reviewed_at',
    reviewedBy: 'reviewed_by',
    passwordChanged: 'password_changed',
    empId: 'emp_id'
  }
  const out = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) return
    out[map[key] || key] = value
  })
  return out
}
