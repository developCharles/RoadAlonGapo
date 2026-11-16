// ── Domain constants shared across every portal ─────────────────────────────

export const BARANGAYS = [
  'Barretto',
  'East Bajac-Bajac',
  'East Tapinac',
  'Gordon Heights',
  'Kalaklan',
  'Mabayuan',
  'New Asinan',
  'New Banicain',
  'New Cabalan',
  'New Ilalim',
  'New Kababae',
  'New Kalalake',
  'Old Cabalan',
  'Pag-asa',
  'Santa Rita',
  'West Bajac-Bajac',
  'West Tapinac'
]

export const POSITIONS = [
  'Barangay Captain',
  'Barangay Secretary',
  'Barangay Treasurer',
  'Barangay Councilor',
  'Barangay Health Worker',
  'Barangay Tanod',
  'Other Barangay Official'
]

export const HAZARD_CATEGORIES = [
  'Pothole',
  'Road Flooding',
  'Road Crack / Fracture',
  'Debris / Obstruction',
  'Fallen Tree',
  'Broken Street Light',
  'Water Pipe Burst',
  'Water Pipe Leak',
  'Oil Spill',
  'Road Sinkhole / Cave-in',
  'Damaged Guard Rail',
  'Missing Manhole Cover',
  'Open / Uncovered Manhole',
  'Broken Traffic Signal',
  'Road Landslide',
  'Damaged Road Sign',
  'Collapsed Road Shoulder',
  'Sewage Overflow',
  'Damaged Sidewalk / Footpath',
  'Bridge Damage',
  'Construction Hazard Zone',
  'Road Erosion',
  'Fuel / Chemical Leak',
  'Damaged Drainage',
  'Road Closure',
  'Crumbling Road Edge',
  'Mud / Silt on Road',
  'Loose Gravel',
  'Broken Curb'
]

const CATEGORY_ICONS = [
  { match: ['pothole'], icon: 'fa-dot-circle' },
  { match: ['flood', 'drainage', 'pipe', 'sewage', 'water'], icon: 'fa-water' },
  { match: ['crack', 'fracture', 'erosion'], icon: 'fa-wave-square' },
  { match: ['debris', 'obstruction', 'gravel'], icon: 'fa-cube' },
  { match: ['tree'], icon: 'fa-tree' },
  { match: ['street light'], icon: 'fa-lightbulb' },
  { match: ['oil', 'fuel', 'chemical'], icon: 'fa-oil-can' },
  { match: ['sinkhole', 'cave'], icon: 'fa-arrow-down' },
  { match: ['guard rail'], icon: 'fa-grip-lines' },
  { match: ['manhole'], icon: 'fa-circle-notch' },
  { match: ['traffic signal'], icon: 'fa-traffic-light' },
  { match: ['landslide', 'mud', 'silt'], icon: 'fa-mountain' },
  { match: ['road sign'], icon: 'fa-signs-post' },
  { match: ['shoulder', 'road closure', 'curb', 'bridge', 'sidewalk', 'footpath'], icon: 'fa-road' },
  { match: ['construction'], icon: 'fa-hard-hat' },
  { match: ['sinkhole'], icon: 'fa-arrow-down' }
]

export function getCategoryIcon(category) {
  const c = (category || '').toLowerCase()
  const found = CATEGORY_ICONS.find((entry) => entry.match.some((m) => c.includes(m)))
  return found ? found.icon : 'fa-triangle-exclamation'
}

export const REPORT_STATUSES = ['Pending', 'Verified', 'In Progress', 'Resolved', 'Rejected']

export function getStatusLabel(status) {
  return status || 'Pending'
}

export const URGENT_CATS = [
  'flood',
  'pothole',
  'sinkhole',
  'pole',
  'collapse',
  'landslide',
  'shoulder',
  'bridge',
  'fuel'
]

export function computeSeverity(report) {
  const upvotes = Number(report.upvotes || report.voteCount || 0)
  const cat = (report.category || '').toLowerCase()
  const isUrgentCat = URGENT_CATS.some((c) => cat.includes(c))
  if (
    upvotes >= 20 ||
    (upvotes >= 10 && isUrgentCat) ||
    cat.includes('fire') ||
    cat.includes('collapse') ||
    cat.includes('landslide')
  ) {
    return 'critical'
  }
  if (upvotes >= 10 || (upvotes >= 5 && isUrgentCat) || (isUrgentCat && upvotes >= 2)) {
    return 'high'
  }
  if (upvotes >= 3 || isUrgentCat) {
    return 'moderate'
  }
  return 'low'
}

export const SEVERITY_META = {
  critical: { label: 'Critical', badge: 'bg-[#fde8e8] text-danger' },
  high: { label: 'High', badge: 'bg-warning-bg text-warning' },
  moderate: { label: 'Moderate', badge: 'bg-[#fff8e1] text-[#f57f17]' },
  low: { label: 'Low', badge: 'bg-info-bg text-primary' }
}

export const STATUS_META = {
  Pending: { label: 'Pending', badge: 'bg-[#fdecea] text-danger', pill: '#e53935' },
  Verified: { label: 'Verified', badge: 'bg-warning-bg text-warning', pill: '#ff9f43' },
  'In Progress': { label: 'In Progress', badge: 'bg-info-bg text-primary', pill: '#0056b3' },
  Resolved: { label: 'Resolved', badge: 'bg-success-bg text-success', pill: '#2e7d32' },
  Rejected: { label: 'Rejected', badge: 'bg-canvas text-gray-400', pill: '#9e9e9e' }
}

export const STAGES = [
  {
    key: 'verified',
    label: 'Verified',
    icon: 'fa-shield-alt',
    desc: 'Report validated by a barangay official.'
  },
  {
    key: 'assigned',
    label: 'Team Assigned',
    icon: 'fa-users',
    desc: 'Response team has been dispatched.'
  },
  {
    key: 'in-progress',
    label: 'Work In Progress',
    icon: 'fa-tools',
    desc: 'Repair or remediation work is underway.'
  },
  {
    key: 'resolved',
    label: 'Resolved',
    icon: 'fa-check-circle',
    desc: 'Issue has been fully addressed and closed.'
  }
]

export function getStageIndex(report) {
  if (report.progressStage !== undefined && report.progressStage !== null) {
    return Math.min(parseInt(report.progressStage, 10) || 0, STAGES.length - 1)
  }
  const repair = (report.repairStage || report.stage || '').toLowerCase()
  const repairIdx = STAGES.findIndex((s) => s.key === repair)
  if (repairIdx >= 0) return repairIdx
  const s = (report.status || '').toLowerCase()
  if (s === 'resolved') return 3
  if (s === 'verified') return 0
  if (s === 'in progress') return 2
  return -1
}

export const ROLES = {
  citizen: { label: 'Citizen', home: '/' },
  barangay: { label: 'Barangay', home: '/barangay' },
  engineer: { label: 'Engineer', home: '/engineer' },
  admin: { label: 'Admin', home: '/admin' }
}

export function homeForRole(role) {
  return ROLES[role]?.home || '/'
}
