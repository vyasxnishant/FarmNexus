import { useEffect, useRef, useState, useId } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, MapPin, AlertTriangle, RefreshCw } from 'lucide-react'

export interface MapMarkerPoint {
  id: string
  title: string
  type: 'origin' | 'mandi' | 'storage'
  coordinates: [number, number] // [lat, lng]
  subtitle?: string
  badgeText?: string
  detailsHtml?: string
}

interface AgriMapViewProps {
  origin?: MapMarkerPoint
  destination?: MapMarkerPoint
  storageFacilities?: MapMarkerPoint[]
  height?: string
  className?: string
  showRouteLine?: boolean
}

function isValidCoordinates(coords?: [number, number]): boolean {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) return false
  const [lat, lng] = coords
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export function AgriMapView({
  origin,
  destination,
  storageFacilities = [],
  height = '350px',
  className = '',
  showRouteLine = true,
}: AgriMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const uniqueId = useId().replace(/:/g, '')

  // Create a serializable representation of inputs to avoid stale reference loops
  const originCoordKey = origin && isValidCoordinates(origin.coordinates) ? origin.coordinates.join(',') : ''
  const destCoordKey = destination && isValidCoordinates(destination.coordinates) ? destination.coordinates.join(',') : ''
  const storageKeys = storageFacilities.filter(s => isValidCoordinates(s.coordinates)).map(s => `${s.id}-${s.coordinates.join(',')}`).join('|')

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    let isMounted = true
    setInitError(null)

    // 1. Teardown any existing Leaflet map on this container
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove()
      } catch {
        // ignore teardown error
      }
      mapInstanceRef.current = null
    }

    // Clear Leaflet internal DOM tracking ID to prevent "Map container is already initialized"
    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null
    }

    try {
      // Determine default center
      let initialCenter: [number, number] = [22.3395, 77.0945] // Default MP Center (Harda / Sirali)
      if (origin && isValidCoordinates(origin.coordinates)) {
        initialCenter = origin.coordinates
      } else if (destination && isValidCoordinates(destination.coordinates)) {
        initialCenter = destination.coordinates
      } else if (storageFacilities.length > 0 && isValidCoordinates(storageFacilities[0].coordinates)) {
        initialCenter = storageFacilities[0].coordinates
      }

      // Initialize Leaflet Map Instance
      const map = L.map(container, {
        center: initialCenter,
        zoom: 9,
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
      })

      mapInstanceRef.current = map

      // OpenStreetMap Standard Tile Layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        crossOrigin: true,
      })

      tileLayer.addTo(map)

      // Helper for custom HTML marker icons
      const createCustomIcon = (type: 'origin' | 'mandi' | 'storage', title: string) => {
        let bgColor = '#E4A335'
        let iconSymbol = '🌾'
        let borderColor = '#152A26'

        if (type === 'mandi') {
          bgColor = '#152A26'
          iconSymbol = '🏛️'
          borderColor = '#5FD0C0'
        } else if (type === 'storage') {
          bgColor = '#3E2A1E'
          iconSymbol = '🏭'
          borderColor = '#E4A335'
        }

        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: ${bgColor};
              color: #ffffff;
              border: 2px solid ${borderColor};
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              font-size: 14px;
              cursor: pointer;
              transform: translate3d(0,0,0);
            " title="${title}">
              ${iconSymbol}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        })
      }

      const allBounds: L.LatLngExpression[] = []

      // 1. Plot Origin Marker (Farmer's Godown)
      if (origin && isValidCoordinates(origin.coordinates)) {
        const originMarker = L.marker(origin.coordinates, {
          icon: createCustomIcon('origin', origin.title),
        }).addTo(map)

        originMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; min-width: 170px;">
            <span style="font-size: 10px; font-weight: bold; color: #E4A335; text-transform: uppercase; display: block; letter-spacing: 0.5px;">🌾 FARMER GODOWN (ORIGIN)</span>
            <h4 style="margin: 3px 0 2px; font-size: 13px; font-weight: bold; color: #152A26;">${origin.title}</h4>
            <p style="margin: 0; font-size: 11px; color: #555;">${origin.subtitle || 'Harvest Collection Location'}</p>
          </div>
        `)

        allBounds.push(origin.coordinates)
      }

      // 2. Plot Destination Mandi Marker
      if (destination && isValidCoordinates(destination.coordinates)) {
        const destMarker = L.marker(destination.coordinates, {
          icon: createCustomIcon('mandi', destination.title),
        }).addTo(map)

        destMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
            <span style="font-size: 10px; font-weight: bold; color: #5FD0C0; background: #152A26; padding: 2px 6px; border-radius: 4px; display: inline-block;">🏛️ APMC MANDI (DESTINATION)</span>
            <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: bold; color: #152A26;">${destination.title}</h4>
            <p style="margin: 0; font-size: 11px; color: #444;">${destination.subtitle || 'Arrival & Auction Yard'}</p>
            ${destination.badgeText ? `<p style="margin: 4px 0 0; font-size: 11px; font-weight: bold; color: #E4A335;">${destination.badgeText}</p>` : ''}
          </div>
        `)

        allBounds.push(destination.coordinates)

        // 3. Draw Route Polyline
        if (origin && isValidCoordinates(origin.coordinates) && showRouteLine) {
          // Shadow outer line
          L.polyline([origin.coordinates, destination.coordinates], {
            color: '#152A26',
            weight: 6,
            opacity: 0.4,
          }).addTo(map)

          // Glowing active dash line
          const routeLine = L.polyline([origin.coordinates, destination.coordinates], {
            color: '#E4A335',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.95,
          }).addTo(map)

          routeLine.bindTooltip('🛣️ Active Transit Corridor', { sticky: true })
        }
      }

      // 4. Plot Storage Facilities
      storageFacilities.forEach((fac) => {
        if (!isValidCoordinates(fac.coordinates)) return

        const marker = L.marker(fac.coordinates, {
          icon: createCustomIcon('storage', fac.title),
        }).addTo(map)

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
            <span style="font-size: 10px; font-weight: bold; color: #3E2A1E; background: #F3E9D2; padding: 2px 6px; border-radius: 4px; display: inline-block;">🏭 STORAGE WAREHOUSE</span>
            <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: bold; color: #152A26;">${fac.title}</h4>
            <p style="margin: 0; font-size: 11px; color: #555;">${fac.subtitle || 'Warehouse Capacity Available'}</p>
            ${fac.badgeText ? `<p style="margin: 4px 0 0; font-size: 11px; font-weight: bold; color: #2B6CB0;">${fac.badgeText}</p>` : ''}
          </div>
        `)

        allBounds.push(fac.coordinates)
      })

      // Fit map viewport to encompass all plotted points
      if (allBounds.length > 1) {
        map.fitBounds(allBounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 12 })
      } else if (allBounds.length === 1) {
        map.setView(allBounds[0] as L.LatLngExpression, 10)
      }

      // Invalidate map size after DOM layout computes
      const timer1 = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 60)

      const timer2 = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 250)

      if (isMounted) {
        setMapReady(true)
      }

      // ResizeObserver to automatically resize map when container size changes
      let resizeObserver: ResizeObserver | null = null
      if (typeof ResizeObserver !== 'undefined' && container) {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        })
        resizeObserver.observe(container)
      }

      return () => {
        isMounted = false
        clearTimeout(timer1)
        clearTimeout(timer2)
        if (resizeObserver) {
          resizeObserver.disconnect()
        }
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove()
          } catch {
            // ignore
          }
          mapInstanceRef.current = null
        }
        if (container && (container as any)._leaflet_id) {
          (container as any)._leaflet_id = null
        }
      }
    } catch (err: any) {
      console.warn('Leaflet map initialization notice:', err)
      setInitError(err.message || 'Map rendering fallback active')
      setMapReady(true)
    }
  }, [originCoordKey, destCoordKey, storageKeys, showRouteLine, height])

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-soil/15 shadow-sm bg-[#f3e9d2] ${className}`}
      style={{ minHeight: height, height }}
    >
      {/* Map DOM Element */}
      <div
        id={`agri-map-${uniqueId}`}
        ref={mapContainerRef}
        style={{ height: '100%', width: '100%', minHeight: height, backgroundColor: '#f3e9d2' }}
        className="z-10 relative"
      />

      {/* Fallback View if WebGL/Leaflet fails */}
      {initError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-wheat text-soil space-y-3">
          <div className="flex items-center gap-2 text-turmeric font-bold text-sm">
            <Navigation className="w-5 h-5" />
            <span>Transit Corridor Route Display</span>
          </div>
          <div className="w-full max-w-md p-4 bg-soil/5 rounded-xl border border-soil/10 text-xs space-y-2">
            {origin && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-soil">🌾 Origin:</span>
                <span>{origin.title}</span>
              </div>
            )}
            {destination && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-soil">🏛️ Destination:</span>
                <span>{destination.title}</span>
              </div>
            )}
            {destination?.badgeText && (
              <div className="text-right text-datateal font-bold">
                {destination.badgeText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-2 right-2 z-[400] bg-monsoon/95 backdrop-blur-md text-wheat p-2.5 rounded-xl border border-wheat/20 text-[11px] font-body space-y-1 shadow-md pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-turmeric inline-block border border-white/50" />
          <span>Farmer Origin Godown</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-datateal inline-block border border-white/50" />
          <span>APMC Mandi Yard</span>
        </div>
        {storageFacilities.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-wheat inline-block border border-soil/50" />
            <span>Storage Warehouse</span>
          </div>
        )}
      </div>
    </div>
  )
}
