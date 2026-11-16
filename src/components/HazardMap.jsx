import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { getCategoryIcon, getStatusLabel, STATUS_META } from '../lib/constants'
import { cn } from '../lib/utils'

const DEFAULT_CENTER = [14.8265, 120.2865] // Olongapo City
const DEFAULT_ZOOM = 13

function createIcon(report) {
  const meta = STATUS_META[report.status] || STATUS_META.Pending
  const icon = getCategoryIcon(report.category)
  return L.divIcon({
    className: 'ra-pin',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:#fff;border:2px solid ${meta.pill};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.28);">
      <i class="fas ${icon}" style="color:${meta.pill};font-size:0.95rem;"></i>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -16]
  })
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick?.(e.latlng)
  })
  return null
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom || 16, { duration: 0.8 })
  }, [target, map])
  return null
}

function MapControls({ locateSignal, onLocate }) {
  const map = useMap()
  useEffect(() => {
    if (locateSignal == null) return
    map.locate({ setView: true, maxZoom: 16 })
  }, [locateSignal, map])
  return null
}

function ControlButtons() {
  const map = useMap()
  return (
    <div className="absolute bottom-[175px] right-3.5 z-[999] flex flex-col gap-2.5">
      <button
        className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-lg border border-line bg-card text-[0.95rem] text-gray-500 shadow"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
      >
        <i className="fas fa-plus" />
      </button>
      <button
        className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-lg border border-line bg-card text-[0.95rem] text-gray-500 shadow"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
      >
        <i className="fas fa-minus" />
      </button>
      <button
        className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-lg border border-line bg-card text-[0.95rem] text-primary shadow"
        onClick={() => map.locate({ setView: true, maxZoom: 16 })}
        aria-label="My location"
      >
        <i className="fas fa-crosshairs" />
      </button>
    </div>
  )
}

function PopupCard({ report, onOpen }) {
  const meta = STATUS_META[report.status] || STATUS_META.Pending
  return (
    <div className="w-[262px]">
      <div
        className="flex h-[110px] items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: report.imageUrl ? `url(${report.imageUrl})` : undefined, background: report.imageUrl ? undefined : '#dde' }}
      >
        {!report.imageUrl && <i className={cn('fas text-[2rem] text-gray-300', getCategoryIcon(report.category))} />}
        <span
          className="absolute left-2 top-2 rounded-full px-[10px] py-[3px] text-[0.62rem] font-extrabold uppercase tracking-wide text-white"
          style={{ background: meta.pill }}
        >
          {getStatusLabel(report.status)}
        </span>
      </div>
      <div className="px-[14px] py-3">
        <div className="mb-0.5 truncate text-[0.82rem] font-extrabold text-ink">{report.category}</div>
        <div className="mb-2.5 flex items-center gap-1 overflow-hidden text-[0.75rem] text-muted">
          <i className="fas fa-map-marker-alt flex-shrink-0 text-primary" />
          <span className="truncate">{report.location || `${report.lat?.toFixed(4)}, ${report.lng?.toFixed(4)}`}</span>
        </div>
        <button
          className="w-full cursor-pointer rounded-lg bg-primary-dark py-2 text-[0.75rem] font-extrabold text-white"
          onClick={() => onOpen?.(report)}
        >
          View Report
        </button>
      </div>
    </div>
  )
}

export default function HazardMap({
  reports = [],
  onMarkerClick,
  onMapClick,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  flyTo = null,
  locateSignal = null,
  className = '',
  interactive = true,
  dragging = true,
  scrollWheelZoom = true,
  showMarkers = true,
  showControls = false,
  pin = null,
  style
}) {
  const iconsRef = useRef(new Map())

  const markers = useMemo(
    () =>
      reports
        .filter((r) => Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lng)))
        .map((r) => {
          const key = r.id
          if (!iconsRef.current.has(key)) iconsRef.current.set(key, createIcon(r))
          return { report: r, icon: iconsRef.current.get(key) }
        }),
    [reports]
  )

  return (
    <div className={cn('relative h-full w-full', className)} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        dragging={dragging}
        scrollWheelZoom={scrollWheelZoom}
        className="h-full w-full"
        style={{ background: '#dde' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapClickHandler onMapClick={onMapClick} />
        <FlyTo target={flyTo} />
        <MapControls locateSignal={locateSignal} />
        {showControls && <ControlButtons />}
        {pin && (
          <Marker
            position={[Number(pin.lat), Number(pin.lng)]}
            icon={L.divIcon({
              className: 'ra-pin',
              html: '<div style="color:#ff9f43;font-size:1.8rem;text-shadow:0 2px 6px rgba(0,0,0,0.35);"><i class="fas fa-map-marker-alt"></i></div>',
              iconSize: [28, 40],
              iconAnchor: [14, 40]
            })}
          />
        )}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount()
            return L.divIcon({
              html: `<div style="width:40px;height:40px;border-radius:50%;background:#0056b3;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.8rem;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:3px solid #fff;">${count}</div>`,
              className: 'ra-dot',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })
          }}
        >
          {showMarkers &&
            markers.map(({ report, icon }) => (
              <Marker
                key={report.id}
                position={[Number(report.lat), Number(report.lng)]}
                icon={icon}
                eventHandlers={{ click: () => onMarkerClick?.(report) }}
              >
                <Popup className="ra-popup" closeButton>
                  <PopupCard report={report} onOpen={onMarkerClick} />
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
