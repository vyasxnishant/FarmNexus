/**
 * Backend Geocoding & Geographic Distance Resolver for Indian Agriculture Corridors
 */

export interface GeocodedLocation {
  name: string
  district?: string
  state: string
  coordinates: [number, number] // [latitude, longitude]
}

export const INDIAN_AGRI_GEO_REGISTRY: Record<string, GeocodedLocation> = {
  // --- Madhya Pradesh Corridors ---
  'harda': { name: 'Harda', district: 'Harda', state: 'Madhya Pradesh', coordinates: [22.3395, 77.0945] },
  'sirali': { name: 'Sirali', district: 'Harda', state: 'Madhya Pradesh', coordinates: [22.2850, 77.0120] },
  'timarni': { name: 'Timarni', district: 'Harda', state: 'Madhya Pradesh', coordinates: [22.3680, 77.2340] },
  'guna': { name: 'Guna', district: 'Guna', state: 'Madhya Pradesh', coordinates: [24.6465, 77.3110] },
  'myana': { name: 'Myana', district: 'Guna', state: 'Madhya Pradesh', coordinates: [24.4925, 77.2917] },
  'indore': { name: 'Indore APMC Mandi', district: 'Indore', state: 'Madhya Pradesh', coordinates: [22.7196, 75.8577] },
  'bhopal': { name: 'Bhopal Karond APMC', district: 'Bhopal', state: 'Madhya Pradesh', coordinates: [23.2599, 77.4126] },
  'ujjain': { name: 'Ujjain APMC Mandi', district: 'Ujjain', state: 'Madhya Pradesh', coordinates: [23.1765, 75.7885] },
  'hoshangabad': { name: 'Narmadapuram / Hoshangabad', district: 'Narmadapuram', state: 'Madhya Pradesh', coordinates: [22.7510, 77.7290] },
  'narmadapuram': { name: 'Narmadapuram Mandi Hub', district: 'Narmadapuram', state: 'Madhya Pradesh', coordinates: [22.7510, 77.7290] },
  'itarsi': { name: 'Itarsi Hub', district: 'Narmadapuram', state: 'Madhya Pradesh', coordinates: [22.6120, 77.7600] },
  'khandwa': { name: 'Khandwa APMC', district: 'Khandwa', state: 'Madhya Pradesh', coordinates: [21.8314, 76.3498] },
  'dewas': { name: 'Dewas APMC Mandi', district: 'Dewas', state: 'Madhya Pradesh', coordinates: [22.9676, 76.0534] },
  'sehore': { name: 'Sehore Mandi', district: 'Sehore', state: 'Madhya Pradesh', coordinates: [23.2030, 77.0844] },
  'vidisha': { name: 'Vidisha APMC', district: 'Vidisha', state: 'Madhya Pradesh', coordinates: [23.5251, 77.8081] },
  'jabalpur': { name: 'Jabalpur APMC', district: 'Jabalpur', state: 'Madhya Pradesh', coordinates: [23.1815, 79.9864] },
  'gwalior': { name: 'Gwalior Mandi', district: 'Gwalior', state: 'Madhya Pradesh', coordinates: [26.2183, 78.1828] },
  'sagar': { name: 'Sagar Mandi', district: 'Sagar', state: 'Madhya Pradesh', coordinates: [23.8388, 78.7378] },
  'ratlam': { name: 'Ratlam APMC', district: 'Ratlam', state: 'Madhya Pradesh', coordinates: [23.3315, 75.0367] },
  'mandsaur': { name: 'Mandsaur APMC', district: 'Mandsaur', state: 'Madhya Pradesh', coordinates: [24.0722, 75.0682] },
  'neemuch': { name: 'Neemuch Mandi', district: 'Neemuch', state: 'Madhya Pradesh', coordinates: [24.4619, 74.8722] },
  'khargone': { name: 'Khargone Cotton Hub', district: 'Khargone', state: 'Madhya Pradesh', coordinates: [21.8234, 75.6144] },

  // --- Maharashtra Corridors ---
  'mumbai': { name: 'Mumbai APMC Terminal, Vashi', district: 'Thane', state: 'Maharashtra', coordinates: [19.0760, 72.8777] },
  'navi mumbai': { name: 'Navi Mumbai APMC Terminal', district: 'Thane', state: 'Maharashtra', coordinates: [19.0330, 73.0297] },
  'pune': { name: 'Pune APMC Market Yard', district: 'Pune', state: 'Maharashtra', coordinates: [18.5204, 73.8567] },
  'nagpur': { name: 'Nagpur Cotton & Grain APMC', district: 'Nagpur', state: 'Maharashtra', coordinates: [21.1458, 79.0882] },
  'nashik': { name: 'Nashik Onion Mandi, Lasalgaon', district: 'Nashik', state: 'Maharashtra', coordinates: [20.0059, 74.2372] },
  'lasalgaon': { name: 'Lasalgaon Onion Mandi', district: 'Nashik', state: 'Maharashtra', coordinates: [20.1478, 74.2281] },
  'akola': { name: 'Akola Pulse Hub', district: 'Akola', state: 'Maharashtra', coordinates: [20.7002, 77.0082] },
  'amravati': { name: 'Amravati APMC', district: 'Amravati', state: 'Maharashtra', coordinates: [20.9374, 77.7796] },
  'solapur': { name: 'Solapur APMC', district: 'Solapur', state: 'Maharashtra', coordinates: [17.6599, 75.9064] },

  // --- Gujarat Corridors ---
  'ahmedabad': { name: 'Ahmedabad APMC Hub', district: 'Ahmedabad', state: 'Gujarat', coordinates: [23.0225, 72.5714] },
  'surat': { name: 'Surat Grain Terminal', district: 'Surat', state: 'Gujarat', coordinates: [21.1702, 72.8311] },
  'rajkot': { name: 'Rajkot Groundnut APMC', district: 'Rajkot', state: 'Gujarat', coordinates: [22.3039, 70.8022] },
  'unjha': { name: 'Unjha Spices Mandi', district: 'Mehsana', state: 'Gujarat', coordinates: [23.8038, 72.3920] },
  'gondal': { name: 'Gondal APMC', district: 'Rajkot', state: 'Gujarat', coordinates: [21.9619, 70.7997] },

  // --- Punjab & Haryana Corridors ---
  'amritsar': { name: 'Amritsar Grain Market', district: 'Amritsar', state: 'Punjab', coordinates: [31.6340, 74.8723] },
  'ludhiana': { name: 'Ludhiana APMC Yard', district: 'Ludhiana', state: 'Punjab', coordinates: [30.9010, 75.8573] },
  'khanna': { name: 'Khanna Asia Grain Hub', district: 'Ludhiana', state: 'Punjab', coordinates: [30.7028, 76.2163] },
  'karnal': { name: 'Karnal Basmati Rice Hub', district: 'Karnal', state: 'Haryana', coordinates: [29.6857, 76.9905] },
  'kurukshetra': { name: 'Kurukshetra APMC', district: 'Kurukshetra', state: 'Haryana', coordinates: [29.9695, 76.8783] },
  'taraori': { name: 'Taraori Basmati Market', district: 'Karnal', state: 'Haryana', coordinates: [29.8055, 76.9328] },

  // --- Rajasthan Corridors ---
  'jaipur': { name: 'Jaipur Muhana Mandi', district: 'Jaipur', state: 'Rajasthan', coordinates: [26.9124, 75.7873] },
  'jodhpur': { name: 'Jodhpur APMC', district: 'Jodhpur', state: 'Rajasthan', coordinates: [26.2389, 73.0243] },
  'kota': { name: 'Kota Bhamashah Mandi', district: 'Kota', state: 'Rajasthan', coordinates: [25.2138, 75.8648] },
  'bikaner': { name: 'Bikaner Mandi', district: 'Bikaner', state: 'Rajasthan', coordinates: [28.0229, 73.3119] },

  // --- Uttar Pradesh Corridors ---
  'lucknow': { name: 'Lucknow Dubagga Mandi', district: 'Lucknow', state: 'Uttar Pradesh', coordinates: [26.8467, 80.9462] },
  'kanpur': { name: 'Kanpur Grain Market', district: 'Kanpur', state: 'Uttar Pradesh', coordinates: [26.4499, 80.3319] },
  'varanasi': { name: 'Varanasi APMC', district: 'Varanasi', state: 'Uttar Pradesh', coordinates: [25.3176, 82.9739] },
  'agra': { name: 'Agra Potato & Grain Mandi', district: 'Agra', state: 'Uttar Pradesh', coordinates: [27.1767, 78.0081] },

  // --- Southern Hubs ---
  'bangalore': { name: 'Bangalore Yeshwantpur APMC', district: 'Bangalore Urban', state: 'Karnataka', coordinates: [13.0238, 77.5529] },
  'hubli': { name: 'Hubli Cotton & Chilli Mandi', district: 'Dharwad', state: 'Karnataka', coordinates: [15.3647, 75.1240] },
  'hyderabad': { name: 'Hyderabad Malakpet APMC', district: 'Hyderabad', state: 'Telangana', coordinates: [17.3688, 78.4988] },
  'warangal': { name: 'Warangal Enamamula Mandi', district: 'Warangal', state: 'Telangana', coordinates: [17.9784, 79.5941] },
  'guntur': { name: 'Guntur Chilli Market Yard', district: 'Guntur', state: 'Andhra Pradesh', coordinates: [16.3067, 80.4365] },
  'chennai': { name: 'Chennai Koyambedu Wholesale Market', district: 'Chennai', state: 'Tamil Nadu', coordinates: [13.0694, 80.1948] },
  'madurai': { name: 'Madurai APMC', district: 'Madurai', state: 'Tamil Nadu', coordinates: [9.9252, 78.1198] },
  'coimbatore': { name: 'Coimbatore Wholesale Hub', district: 'Coimbatore', state: 'Tamil Nadu', coordinates: [11.0168, 76.9558] },

  // --- Eastern & Northern Outposts ---
  'kolkata': { name: 'Kolkata Posta & Burrabazar Wholesale Hub', district: 'Kolkata', state: 'West Bengal', coordinates: [22.5726, 88.3639] },
  'patna': { name: 'Patna Bazaar Samiti', district: 'Patna', state: 'Bihar', coordinates: [25.5941, 85.1376] },
  'raipur': { name: 'Raipur APMC Rice Hub', district: 'Raipur', state: 'Chhattisgarh', coordinates: [21.2514, 81.6296] },
  'pampore': { name: 'Pampore Spice Park', district: 'Pulwama', state: 'Jammu & Kashmir', coordinates: [34.0180, 74.9280] },
  'srinagar': { name: 'Srinagar Fruit & Grain Terminal', district: 'Srinagar', state: 'Jammu & Kashmir', coordinates: [34.0837, 74.7973] },
  'delhi': { name: 'Delhi Azadpur APMC Terminal', district: 'North Delhi', state: 'Delhi', coordinates: [28.7159, 77.1788] },
}

export function geocodeLocation(locationStr?: string | null): GeocodedLocation | null {
  if (!locationStr || typeof locationStr !== 'string') return null
  const clean = locationStr.toLowerCase().trim()
  if (clean.length < 2) return null

  for (const [key, geo] of Object.entries(INDIAN_AGRI_GEO_REGISTRY)) {
    if (clean === key || clean.includes(key)) {
      return geo
    }
  }

  const tokens = clean.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2)
  for (const token of tokens) {
    if (INDIAN_AGRI_GEO_REGISTRY[token]) {
      return INDIAN_AGRI_GEO_REGISTRY[token]
    }
  }

  const coordMatch = clean.match(/([-+]?\d{1,2}\.\d+)\s*,\s*([-+]?\d{1,3}\.\d+)/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        name: locationStr,
        state: 'India',
        coordinates: [lat, lng],
      }
    }
  }

  return null
}

export function calculateGeoDistanceKm(originCoords: [number, number], destCoords: [number, number]): number {
  const [lat1, lon1] = originCoords
  const [lat2, lon2] = destCoords
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const straightKm = R * c
  return Math.max(5, Math.round(straightKm * 1.25))
}

