import { useMemo, useRef, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import HazardMap from '../../components/HazardMap'
import { HAZARD_CATEGORIES } from '../../lib/constants'
import { insertReport, uploadFile } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

export default function ReportForm({ open, onClose, onSubmitted }) {
  const { profile } = useAuth()
  const fileRef = useRef(null)
  const [category, setCategory] = useState('')
  const [catQuery, setCatQuery] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [coords, setCoords] = useState(null)
  const [location, setLocation] = useState('')
  const [pinMode, setPinMode] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const catResults = useMemo(() => {
    const q = catQuery.trim().toLowerCase()
    if (!q) return HAZARD_CATEGORIES
    return HAZARD_CATEGORIES.filter((c) => c.toLowerCase().includes(q))
  }, [catQuery])

  const reset = () => {
    setCategory('')
    setCatQuery('')
    setCatOpen(false)
    setDescription('')
    setImage(null)
    setImagePreview('')
    setCoords(null)
    setLocation('')
    setPinMode(false)
    setGpsStatus('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const detectGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported on this device.')
      return
    }
    setGpsStatus('Detecting location…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
        setGpsStatus('Location acquired.')
        setPinMode(false)
      },
      () => setGpsStatus('Could not get location. You can pin it on the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleMapClick = (latlng) => {
    setCoords({ lat: latlng.lat, lng: latlng.lng })
    setLocation(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`)
  }

  const handleSubmit = async () => {
    setError('')
    if (!category) return setError('Please select a hazard type.')
    if (!description.trim()) return setError('Please describe the hazard.')
    if (!coords) return setError('Please provide a location (GPS or pin).')

    setBusy(true)
    try {
      let imageUrl = null
      if (image) {
        const path = `${profile.id}/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        imageUrl = await uploadFile('report-images', path, image)
      }
      const report = await insertReport({
        category,
        description: description.trim(),
        location: location || null,
        lat: coords.lat,
        lng: coords.lng,
        imageUrl,
        status: 'Pending',
        upvotes: 0,
        upvotedBy: [],
        communityImages: [],
        reportedBy: profile.id,
        reporterName: profile.name,
        barangay: profile.barangay || null
      })
      reset()
      onSubmitted?.(report)
    } catch (err) {
      setError(err.message || 'Could not submit the report.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title="Report Road Hazard"
      footer={
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={busy}>
          {busy ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Submitting…
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane" /> Submit Report
            </>
          )}
        </button>
      }
    >
      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-[9px] border border-red-200 bg-danger-bg px-3 py-2.5 text-[0.8rem] font-bold text-danger">
          <i className="fas fa-exclamation-circle" /> {error}
        </div>
      )}

      <div className="mb-4">
        <label className="input-label">Evidence</label>
        <div
          className="flex h-[148px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-canvas text-muted"
          onClick={() => fileRef.current?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <>
              <i className="fas fa-camera mb-2 text-[2rem] text-primary" />
              <p className="text-[0.85rem] font-bold">Tap to Capture or Upload</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
      </div>

      <div className="mb-4">
        <label className="input-label">Hazard Type</label>
        <div className="relative">
          <div
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5"
            onClick={() => setCatOpen((o) => !o)}
          >
            <i className="fas fa-search text-[0.85rem] text-gray-400" />
            <input
              className="flex-1 border-0 bg-transparent text-[0.9rem] text-ink outline-none"
              placeholder="Search hazard type…"
              value={catOpen ? catQuery : category}
              onChange={(e) => {
                setCatOpen(true)
                setCatQuery(e.target.value)
              }}
              onFocus={() => setCatOpen(true)}
            />
            <i className="fas fa-chevron-down text-[0.85rem] text-gray-400" />
          </div>
          {catOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[200px] overflow-y-auto rounded-[10px] border border-gray-200 bg-white shadow-lg">
              {catResults.length === 0 && <div className="p-3.5 text-center text-[0.83rem] text-gray-400">No matches</div>}
              {catResults.map((c) => (
                <div
                  key={c}
                  className="cursor-pointer border-b border-gray-50 px-3.5 py-2.5 text-[0.86rem] text-ink hover:bg-primary/5"
                  onClick={() => {
                    setCategory(c)
                    setCatQuery('')
                    setCatOpen(false)
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="input-label">Description</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="Describe the hazard and its impact on traffic…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label className="input-label">Location (GPS)</label>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5">
            <i className="fas fa-map-marker-alt flex-shrink-0 text-primary" />
            <input
              className="flex-1 border-0 bg-transparent text-[0.9rem] text-ink outline-none"
              placeholder="Tap detect or pin on map"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button type="button" className="btn-outline btn-sm" onClick={detectGps}>
            <i className="fas fa-crosshairs" />
          </button>
          <button
            type="button"
            className={cn('btn-sm btn', pinMode ? 'bg-primary text-white' : 'btn-outline')}
            onClick={() => setPinMode((p) => !p)}
          >
            <i className="fas fa-map" />
          </button>
        </div>
        {gpsStatus && <div className="mt-1.5 text-[0.72rem] font-semibold text-muted">{gpsStatus}</div>}
        {pinMode && (
          <div className="mt-2.5 h-[160px] overflow-hidden rounded-xl border-[1.5px] border-line">
            <HazardMap
              reports={[]}
              showMarkers={false}
              showControls={false}
              onMapClick={handleMapClick}
              pin={coords}
              center={coords ? [coords.lat, coords.lng] : undefined}
              zoom={coords ? 16 : undefined}
            />
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
