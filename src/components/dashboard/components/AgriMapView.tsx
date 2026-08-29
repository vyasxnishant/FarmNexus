import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

export function AgriMapView({
  origin,
  destination,
  storageFacilities = [],
  height = '400px',
  className = '',
  showRouteLine = true,
}: AgriMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up previous instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Default center around Central MP (Sirali / Harda)
    const defaultCenter: [number, number] = origin
      ? origin.coordinates
      : [22.3395, 77.0945]

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 9,
      zoomControl: true,
      attributionControl: false,
    })

    mapInstanceRef.current = map

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}.png', {
      maxZoom: 18,
    }).addTo(map)

    const allBounds: L.LatLngExpression[] = []

    // Helper to create custom HTML markers
    const createCustomIcon = (type: 'origin' | 'mandi' | 'storage', title: string) => {
      let bgClass = 'bg-turmeric text-monsoon border-monsoon'
      let iconSymbol = '🌾'

      if (type === 'mandi') {
        bgClass = 'bg-[#152A26] text-[#5FD0C0] border-[#E4A335]'
        iconSymbol = '🏛️'
      } else if (type === 'storage') {
        bgClass = 'bg-[#3E2A1E] text-[#F3E9D2] border-[#E4A335]'
        iconSymbol = '🏭'
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
            background-color: ${type === 'origin' ? '#E4A335' : type === 'mandi' ? '#152A26' : '#3E2A1E'};
            color: #ffffff;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      })
    }

    // 1. Plot Origin (Farmer's Godown)
    if (origin) {
      const originMarker = L.marker(origin.coordinates, {
        icon: createCustomIcon('origin', origin.title),
      }).addTo(map)

      originMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 160px;">
          <span style="font-size: 10px; font-weight: bold; color: #E4A335; text-transform: uppercase; display: block;">FARMER GODOWN (ORIGIN)</span>
          <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: bold; color: #152A26;">${origin.title}</h4>
          <p style="margin: 0; font-size: 11px; color: #555;">${origin.subtitle || 'Harvest Storage Location'}</p>
        </div>
      `)

      allBounds.push(origin.coordinates)
    }

    // 2. Plot Destination Mandi
    if (destination) {
      const destMarker = L.marker(destination.coordinates, {
        icon: createCustomIcon('mandi', destination.title),
      }).addTo(map)

      destMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 170px;">
          <span style="font-size: 10px; font-weight: bold; color: #5FD0C0; background: #152A26; padding: 2px 6px; border-radius: 4px; display: inline-block;">TARGET APMC MANDI</span>
          <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: bold; color: #152A26;">${destination.title}</h4>
          <p style="margin: 0; font-size: 11px; color: #444;">${destination.subtitle || 'Arrival & Auction Yard'}</p>
          ${destination.badgeText ? `<p style="margin: 4px 0 0; font-size: 11px; font-weight: bold; color: #E4A335;">${destination.badgeText}</p>` : ''}
        </div>
      `)

      allBounds.push(destination.coordinates)

      // 3. Draw Route Polyline if both origin and destination exist
      if (origin && showRouteLine) {
        const routeLine = L.polyline([origin.coordinates, destination.coordinates], {
          color: '#E4A335',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.85,
        }).addTo(map)

        routeLine.bindTooltip('Transit Corridor', { sticky: true })
      }
    }

    // 4. Plot Storage Facilities
    storageFacilities.forEach((fac) => {
      const marker = L.marker(fac.coordinates, {
        icon: createCustomIcon('storage', fac.title),
      }).addTo(map)

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
          <span style="font-size: 10px; font-weight: bold; color: #3E2A1E; background: #F3E9D2; padding: 2px 6px; border-radius: 4px; display: inline-block;">STORAGE FACILITY</span>
          <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: bold; color: #152A26;">${fac.title}</h4>
          <p style="margin: 0; font-size: 11px; color: #555;">${fac.subtitle || ''}</p>
          ${fac.badgeText ? `<p style="margin: 4px 0 0; font-size: 11px; font-weight: bold; color: #2B6CB0;">${fac.badgeText}</p>` : ''}
        </div>
      `)

      allBounds.push(fac.coordinates)
    })

    // Fit map view to encompass all markers
    if (allBounds.length > 1) {
      map.fitBounds(allBounds as L.LatLngBoundsExpression, { padding: [40, 40] })
    } else if (allBounds.length === 1) {
      map.setView(allBounds[0] as L.LatLngExpression, 10)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [origin, destination, storageFacilities, showRouteLine])

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-soil/15 shadow-sm ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-2 right-2 z-[400] bg-monsoon/90 backdrop-blur-md text-wheat p-2.5 rounded-xl border border-wheat/20 text-[11px] font-body space-y-1 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-turmeric inline-block" />
          <span>Farmer Origin Godown</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-datateal inline-block" />
          <span>APMC Mandi Yard</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-wheat inline-block" />
          <span>Storage Warehouse</span>
        </div>
      </div>
    </div>
  )
}
