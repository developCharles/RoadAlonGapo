// Demo data + persistence used when Supabase is not configured.
// Lets you click through every screen without a backend.

import { isSupabaseConfigured } from './supabase'

const REPORTS_KEY = 'ra_demo_reports_v2'
const MESSAGES_KEY = 'ra_demo_messages_v2'
const REQUESTS_KEY = 'ra_demo_requests_v2'
const ROLE_KEY = 'ra_demo_role'

export const DEMO_PROFILES = {
  citizen: {
    id: 'demo-citizen',
    name: 'Juan Dela Cruz',
    email: 'juan@demo.local',
    role: 'citizen',
    status: 'active',
    barangay: 'East Tapinac',
    passwordChanged: true
  },
  barangay: {
    id: 'demo-barangay',
    name: 'Maria Santos',
    email: 'maria@demo.local',
    role: 'barangay',
    status: 'active',
    barangay: 'East Tapinac',
    position: 'Barangay Captain',
    passwordChanged: true
  },
  engineer: {
    id: 'demo-engineer',
    name: 'Engr. Ramon Reyes',
    email: 'ramon@demo.local',
    role: 'engineer',
    status: 'active',
    position: 'City Engineer',
    passwordChanged: true
  },
  admin: {
    id: 'demo-admin',
    name: 'IT Administrator',
    email: 'admin@demo.local',
    role: 'admin',
    status: 'active',
    passwordChanged: true
  }
}

export function demoEnabled() {
  return !isSupabaseConfigured
}

export function getDemoRole() {
  return localStorage.getItem(ROLE_KEY) || 'citizen'
}

export function setDemoRole(role) {
  localStorage.setItem(ROLE_KEY, role)
}

export function clearDemoRole() {
  localStorage.removeItem(ROLE_KEY)
}

export function getDemoProfile(role = getDemoRole()) {
  return DEMO_PROFILES[role] || DEMO_PROFILES.citizen
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback()
    return JSON.parse(raw)
  } catch {
    return fallback()
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota errors */
  }
}

const daysAgo = (days, hours = 0) =>
  new Date(Date.now() - days * 86400000 - hours * 3600000).toISOString()

function seedReports() {
  return [
    {
      id: 'demo-r1',
      category: 'Pothole',
      description:
        'Large pothole along the national highway near the East Tapinac covered court. Tricycles are swerving into oncoming traffic to avoid it.',
      location: 'Rizal Avenue, East Tapinac, Olongapo City',
      lat: 14.8322,
      lng: 120.2846,
      imageUrl: '',
      status: 'Pending',
      upvotes: 14,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Juan Dela Cruz',
      barangay: 'East Tapinac',
      createdAt: daysAgo(0, 3)
    },
    {
      id: 'demo-r2',
      category: 'Road Flooding',
      description: 'Knee-deep flooding after heavy rain. Drainage appears clogged with plastic and silt.',
      location: 'Barretto National Highway, Olongapo City',
      lat: 14.8243,
      lng: 120.2701,
      imageUrl: '',
      status: 'Verified',
      upvotes: 22,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Ana Reyes',
      barangay: 'Barretto',
      verifiedAt: daysAgo(1, 2),
      createdAt: daysAgo(1, 5)
    },
    {
      id: 'demo-r3',
      category: 'Broken Street Light',
      description: 'Three consecutive street lights are out, making the road very dark at night.',
      location: 'Gordon Heights main road',
      lat: 14.8411,
      lng: 120.2952,
      imageUrl: '',
      status: 'In Progress',
      upvotes: 9,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Mark Lim',
      barangay: 'Gordon Heights',
      assignedTeam: 'Crew Bravo',
      repairStage: 'in-progress',
      workDescription: 'Electrical team inspected the line; replacement fixtures ordered.',
      verifiedAt: daysAgo(4),
      createdAt: daysAgo(5)
    },
    {
      id: 'demo-r4',
      category: 'Fallen Tree',
      description: 'Fallen acacia branch blocking one lane. Barangay tanod already placed cones.',
      location: 'New Cabalan road near the elementary school',
      lat: 14.8521,
      lng: 120.3087,
      imageUrl: '',
      status: 'Resolved',
      upvotes: 31,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Liza Garcia',
      barangay: 'New Cabalan',
      assignedTeam: 'Crew Alpha',
      repairStage: 'resolved',
      workDescription: 'Branch cut and hauled away. Lane cleared and swept.',
      verifiedAt: daysAgo(9),
      resolvedAt: daysAgo(8),
      createdAt: daysAgo(10)
    },
    {
      id: 'demo-r5',
      category: 'Missing Manhole Cover',
      description: 'Open manhole in the middle of the sidewalk. Very dangerous for pedestrians at night.',
      location: 'Kalaklan, near the public market',
      lat: 14.8198,
      lng: 120.2833,
      imageUrl: '',
      status: 'Verified',
      upvotes: 17,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Paolo Cruz',
      barangay: 'Kalaklan',
      verifiedAt: daysAgo(2),
      createdAt: daysAgo(3)
    },
    {
      id: 'demo-r6',
      category: 'Road Crack / Fracture',
      description: 'Long transverse crack widening after the recent rains.',
      location: 'Santa Rita Road',
      lat: 14.8122,
      lng: 120.2765,
      imageUrl: '',
      status: 'Rejected',
      upvotes: 1,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Juan Dela Cruz',
      barangay: 'Santa Rita',
      barangayRemarks: 'Already covered by an existing city road rehabilitation project.',
      rejectedAt: daysAgo(6),
      createdAt: daysAgo(7)
    },
    {
      id: 'demo-r7',
      category: 'Debris / Obstruction',
      description: 'Construction materials spill onto the shoulder, forcing cyclists onto the highway.',
      location: 'West Bajac-Bajac national road',
      lat: 14.8288,
      lng: 120.2772,
      imageUrl: '',
      status: 'In Progress',
      upvotes: 6,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Rico Perez',
      barangay: 'West Bajac-Bajac',
      assignedTeam: 'Crew Charlie',
      repairStage: 'assigned',
      workDescription: 'Contractor notified; clean-up scheduled.',
      verifiedAt: daysAgo(2),
      createdAt: daysAgo(3)
    },
    {
      id: 'demo-r8',
      category: 'Damaged Road Sign',
      description: 'Stop sign at the intersection is bent and no longer visible to drivers.',
      location: 'Mabayuan intersection',
      lat: 14.8377,
      lng: 120.2899,
      imageUrl: '',
      status: 'Pending',
      upvotes: 3,
      upvotedBy: [],
      communityImages: [],
      reportedBy: 'demo-citizen',
      reporterName: 'Grace Uy',
      barangay: 'Mabayuan',
      createdAt: daysAgo(0, 9)
    }
  ]
}

function seedMessages() {
  return [
    {
      id: 'demo-m1',
      barangay: 'East Tapinac',
      senderId: 'demo-barangay',
      senderName: 'Maria Santos',
      senderRole: 'barangay',
      text: 'Good morning! We have two verified potholes along Rizal Avenue. Requesting a crew schedule.',
      readByEngineer: true,
      readByBarangay: true,
      createdAt: daysAgo(1, 4)
    },
    {
      id: 'demo-m2',
      barangay: 'East Tapinac',
      senderId: 'demo-engineer',
      senderName: 'Engr. Ramon Reyes',
      senderRole: 'engineer',
      text: 'Noted. Crew Bravo is available Thursday morning. Please keep the area coned.',
      readByEngineer: true,
      readByBarangay: false,
      createdAt: daysAgo(1, 2)
    },
    {
      id: 'demo-m3',
      barangay: 'Barretto',
      senderId: 'demo-barangay',
      senderName: 'Maria Santos',
      senderRole: 'barangay',
      text: 'Flooding in Barretto is recurring. Can we schedule a drainage inspection?',
      readByEngineer: false,
      readByBarangay: true,
      createdAt: daysAgo(0, 6)
    }
  ]
}

function seedRequests() {
  return [
    {
      id: 'demo-req1',
      uid: 'demo-req-user-1',
      name: 'Pedro Bautista',
      email: 'pedro.bautista@example.com',
      position: 'Barangay Councilor',
      barangay: 'New Asinan',
      contact: '09171234567',
      requestedRole: 'barangay',
      status: 'pending',
      documents: [{ name: 'appointment-letter.pdf', url: '' }],
      createdAt: daysAgo(2)
    },
    {
      id: 'demo-req2',
      uid: 'demo-req-user-2',
      name: 'Carla Mendoza',
      email: 'carla.mendoza@example.com',
      position: 'Barangay Secretary',
      barangay: 'West Tapinac',
      contact: '09181234567',
      requestedRole: 'barangay',
      status: 'pending',
      documents: [{ name: 'barangay-id.png', url: '' }],
      createdAt: daysAgo(1)
    }
  ]
}

export function getDemoReports() {
  return read(REPORTS_KEY, seedReports)
}

export function saveDemoReports(reports) {
  write(REPORTS_KEY, reports)
}

export function getDemoMessages() {
  return read(MESSAGES_KEY, seedMessages)
}

export function saveDemoMessages(messages) {
  write(MESSAGES_KEY, messages)
}

export function getDemoRequests() {
  return read(REQUESTS_KEY, seedRequests)
}

export function saveDemoRequests(requests) {
  write(REQUESTS_KEY, requests)
}
