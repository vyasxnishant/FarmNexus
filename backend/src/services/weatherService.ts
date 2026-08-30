import axios from 'axios'
import { config } from '../config/env.js'

export interface WeatherForecastDay {
  date: string
  dayOfWeek: string
  maxTemp: number
  minTemp: number
  condition: string
  rainProbability: number
}

export interface NormalizedWeather {
  locationName: string
  district: string
  state: string
  coordinates: { latitude: number; longitude: number }
  temperature: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  rainProbability: number
  precipitationMm: number
  uvIndex: number
  forecast: WeatherForecastDay[]
  agriculturalAdvice: string
  updatedTime: string
  isLive: boolean
  source: string
}

// Known coordinates for agricultural districts in Central India
const KNOWN_GEO_COORDINATES: Record<string, { lat: number; lon: number; state: string; district: string }> = {
  harda: { lat: 22.3395, lon: 77.0945, state: 'Madhya Pradesh', district: 'Harda' },
  sirali: { lat: 22.3167, lon: 77.0167, state: 'Madhya Pradesh', district: 'Harda' },
  timarni: { lat: 22.3683, lon: 77.2307, state: 'Madhya Pradesh', district: 'Harda' },
  indore: { lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh', district: 'Indore' },
  ujjain: { lat: 23.1765, lon: 75.7885, state: 'Madhya Pradesh', district: 'Ujjain' },
  bhopal: { lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh', district: 'Bhopal' },
  hoshangabad: { lat: 22.7533, lon: 77.7289, state: 'Madhya Pradesh', district: 'Narmadapuram' },
  narmadapuram: { lat: 22.7533, lon: 77.7289, state: 'Madhya Pradesh', district: 'Narmadapuram' },
  vidisha: { lat: 23.5251, lon: 77.8081, state: 'Madhya Pradesh', district: 'Vidisha' },
  khandwa: { lat: 21.8314, lon: 76.3498, state: 'Madhya Pradesh', district: 'Khandwa' },
  dewas: { lat: 22.9676, lon: 76.0534, state: 'Madhya Pradesh', district: 'Dewas' },
  sehore: { lat: 23.2032, lon: 77.0844, state: 'Madhya Pradesh', district: 'Sehore' },
  jabalpur: { lat: 23.1815, lon: 79.9864, state: 'Madhya Pradesh', district: 'Jabalpur' },
}

// In-memory weather cache: key = `lat_lon`, ttl = 20 mins
const weatherCache = new Map<string, { data: NormalizedWeather; cachedAt: number }>()
const CACHE_TTL_MS = 20 * 60 * 1000

export class WeatherService {
  /**
   * Resolve location name or coordinates to { lat, lon, locationName, district, state }
   */
  static resolveLocation(locationQuery?: string, lat?: number, lon?: number) {
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      return {
        lat,
        lon,
        locationName: locationQuery || 'Current Farm Coordinates',
        district: 'Regional District',
        state: 'Madhya Pradesh',
      }
    }

    if (locationQuery) {
      const q = locationQuery.toLowerCase().trim()
      for (const [key, geo] of Object.entries(KNOWN_GEO_COORDINATES)) {
        if (q.includes(key)) {
          return {
            lat: geo.lat,
            lon: geo.lon,
            locationName: locationQuery,
            district: geo.district,
            state: geo.state,
          }
        }
      }
    }

    // Default to Harda / Sirali agro-corridor
    return {
      lat: 22.3395,
      lon: 77.0945,
      locationName: locationQuery || 'Sirali, Harda (M.P.)',
      district: 'Harda',
      state: 'Madhya Pradesh',
    }
  }

  /**
   * Fetch live weather data from Open-Meteo (Real Live Meteorologic Data)
   */
  static async getWeather(locationQuery?: string, latParam?: number, lonParam?: number): Promise<NormalizedWeather> {
    const { lat, lon, locationName, district, state } = this.resolveLocation(locationQuery, latParam, lonParam)
    const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`
    const now = Date.now()

    // Check cache
    const cached = weatherCache.get(cacheKey)
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      return cached.data
    }

    try {
      // Query Open-Meteo Global Weather API (High accuracy, no private key needed)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`
      
      const response = await axios.get(url, { timeout: 8000 })
      const current = response.data?.current
      const daily = response.data?.daily

      if (!current || !daily) {
        throw new Error('Malformed weather response from Open-Meteo.')
      }

      const condition = this.mapWmoCodeToCondition(current.weather_code)
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      const forecast: WeatherForecastDay[] = (daily.time || []).map((dateStr: string, idx: number) => {
        const d = new Date(dateStr)
        return {
          date: dateStr,
          dayOfWeek: daysOfWeek[d.getDay()] || 'Day',
          maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 32),
          minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 22),
          condition: this.mapWmoCodeToCondition(daily.weather_code?.[idx]),
          rainProbability: Math.round(daily.precipitation_probability_max?.[idx] ?? 10),
        }
      })

      const rainProb = Math.round(daily.precipitation_probability_max?.[0] ?? 10)
      const temp = Math.round(current.temperature_2m)
      const humidity = Math.round(current.relative_humidity_2m)

      // Agro-climatic advisory based on real weather metrics
      let advisory = 'Optimal weather conditions for crop transport and open-air mandi auctions.'
      if (rainProb > 50) {
        advisory = `High rain probability (${rainProb}%). Protect loaded trucks with waterproof tarpaulins and consider covered mandi sheds or WDRA storage.`
      } else if (temp > 38) {
        advisory = `High heat advisory (${temp}°C). Schedule transport in early morning hours to preserve grain moisture and visual luster.`
      } else if (humidity > 80) {
        advisory = `Elevated relative humidity (${humidity}%). Monitor moisture assays to prevent fungal infestation in transit.`
      }

      const normalized: NormalizedWeather = {
        locationName,
        district,
        state,
        coordinates: { latitude: lat, longitude: lon },
        temperature: temp,
        feelsLike: Math.round(current.apparent_temperature),
        condition,
        humidity,
        windSpeed: Math.round(current.wind_speed_10m),
        rainProbability: rainProb,
        precipitationMm: Number(current.precipitation || 0),
        uvIndex: 7,
        forecast,
        agriculturalAdvice: advisory,
        updatedTime: new Date().toISOString(),
        isLive: true,
        source: 'Open-Meteo Live Ag-Weather',
      }

      weatherCache.set(cacheKey, { data: normalized, cachedAt: now })
      return normalized
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.warn(`[WeatherService] Live weather call failed (${errorMsg}). Serving fallback weather.`)

      return this.getFallbackWeather(locationName, district, state, lat, lon)
    }
  }

  /**
   * Convert WMO weather code to standard descriptive strings
   */
  private static mapWmoCodeToCondition(code?: number): string {
    if (code === undefined || code === null) return 'Clear Sky'
    if (code === 0) return 'Clear Sky'
    if (code === 1 || code === 2) return 'Partly Cloudy'
    if (code === 3) return 'Overcast'
    if (code === 45 || code === 48) return 'Foggy'
    if (code >= 51 && code <= 55) return 'Light Drizzle'
    if (code >= 61 && code <= 65) return 'Rain Showers'
    if (code >= 80 && code <= 82) return 'Heavy Showers'
    if (code >= 95) return 'Thunderstorm'
    return 'Clear / Sunny'
  }

  /**
   * Reliable fallback weather data when network is offline
   */
  private static getFallbackWeather(
    locationName: string,
    district: string,
    state: string,
    lat: number,
    lon: number
  ): NormalizedWeather {
    const today = new Date()
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const forecast: WeatherForecastDay[] = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      forecast.push({
        date: d.toISOString().split('T')[0],
        dayOfWeek: daysOfWeek[d.getDay()],
        maxTemp: 32 + (i % 3),
        minTemp: 22 + (i % 2),
        condition: i === 2 ? 'Light Drizzle' : i === 4 ? 'Partly Cloudy' : 'Clear Sky',
        rainProbability: i === 2 ? 40 : 15,
      })
    }

    return {
      locationName,
      district,
      state,
      coordinates: { latitude: lat, longitude: lon },
      temperature: 31,
      feelsLike: 33,
      condition: 'Sunny & Dry',
      humidity: 52,
      windSpeed: 14,
      rainProbability: 15,
      precipitationMm: 0,
      uvIndex: 6,
      forecast,
      agriculturalAdvice: 'Dry weather expected across the district. Suitable for grain transport and threshing operations.',
      updatedTime: new Date().toISOString(),
      isLive: false,
      source: 'Demo Weather (Offline Fallback)',
    }
  }

  /**
   * Health status for Admin desk
   */
  static async checkStatus(): Promise<{ status: 'Connected' | 'Unavailable'; source: string; latencyMs: number }> {
    const start = Date.now()
    try {
      await axios.get('https://api.open-meteo.com/v1/forecast?latitude=22.33&longitude=77.09&current=temperature_2m', { timeout: 4000 })
      return { status: 'Connected', source: 'Open-Meteo Live Meteorologic API', latencyMs: Date.now() - start }
    } catch {
      return { status: 'Unavailable', source: 'Offline Fallback Provider', latencyMs: Date.now() - start }
    }
  }
}

