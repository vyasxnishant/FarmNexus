import { useState, useEffect } from 'react'
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar
} from 'lucide-react'
import { weatherApi } from '../../../services/apiServices'

export interface WeatherData {
  locationName: string
  district: string
  state: string
  temperature: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  rainProbability: number
  precipitationMm: number
  forecast: Array<{
    date: string
    dayOfWeek: string
    maxTemp: number
    minTemp: number
    condition: string
    rainProbability: number
  }>
  agriculturalAdvice: string
  updatedTime: string
  isLive: boolean
  source: string
}

interface WeatherWidgetProps {
  location?: string
  lat?: number
  lon?: number
  compact?: boolean
  className?: string
}

export function WeatherWidget({
  location = 'Sirali, Harda (M.P.)',
  lat,
  lon,
  compact = false,
  className = '',
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const fetchWeather = async (showLoader = true) => {
    if (showLoader) setIsLoading(true)
    setIsRefreshing(true)
    try {
      const res = await weatherApi.getWeather({ location, lat, lon })
      if (res.data) {
        setWeather(res.data)
      }
    } catch (err) {
      console.warn('[WeatherWidget] Weather load fallback active', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [location, lat, lon])

  const getWeatherIcon = (condition: string = '') => {
    const c = condition.toLowerCase()
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudRain className="w-8 h-8 text-[#5FD0C0]" />
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <CloudSun className="w-8 h-8 text-turmeric" />
    }
    return <Sun className="w-8 h-8 text-turmeric animate-spin-slow" />
  }

  if (isLoading && !weather) {
    return (
      <div className={`p-5 rounded-2xl bg-monsoon/40 border border-wheat/15 animate-pulse flex items-center justify-between text-wheat ${className}`}>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-wheat/20 rounded" />
          <div className="h-7 w-24 bg-wheat/20 rounded" />
        </div>
        <div className="w-10 h-10 rounded-full bg-wheat/20" />
      </div>
    )
  }

  if (!weather) return null

  if (compact) {
    return (
      <div className={`p-4 rounded-xl bg-monsoon text-wheat border border-wheat/15 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-soil/40 border border-wheat/10">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xl font-bold">{weather.temperature}°C</span>
              <span className="text-xs text-wheat/70 font-body">({weather.condition})</span>
            </div>
            <p className="text-[11px] text-wheat/60 font-body">{weather.locationName}</p>
          </div>
        </div>
        <div className="text-right text-[11px] text-wheat/70 font-body space-y-0.5">
          <div className="flex items-center gap-1 justify-end">
            <Droplets className="w-3 h-3 text-[#5FD0C0]" />
            <span>{weather.humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <CloudRain className="w-3 h-3 text-turmeric" />
            <span>{weather.rainProbability}% rain chance</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 rounded-2xl bg-monsoon text-wheat border border-wheat/15 shadow-sm space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#5FD0C0]/15 text-[#5FD0C0] border border-[#5FD0C0]/30">
              {weather.isLive ? 'Live Weather Feed' : 'Offline Baseline'}
            </span>
            <span className="text-[11px] text-wheat/50 font-body">Source: {weather.source}</span>
          </div>
          <h3 className="font-serif text-lg font-semibold text-wheat mt-1.5 flex items-center gap-1.5">
            🌤️ Agricultural Weather & Transit Advisory
          </h3>
          <p className="text-xs text-wheat/70 font-body">
            Target Corridor: <strong className="text-wheat">{weather.locationName}</strong>
          </p>
        </div>

        <button
          onClick={() => fetchWeather(false)}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-soil/40 hover:bg-soil/70 text-wheat/70 hover:text-wheat transition-colors border border-wheat/10 cursor-pointer"
          title="Refresh live weather metrics"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-turmeric' : ''}`} />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-soil/30 p-4 rounded-xl border border-wheat/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-monsoon border border-wheat/15">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <span className="text-[11px] text-wheat/60 font-body block uppercase">Temp / Feels</span>
            <span className="font-mono text-xl font-bold text-wheat">{weather.temperature}°C</span>
            <span className="text-[11px] text-wheat/50 ml-1 font-body">({weather.feelsLike}°C)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-monsoon border border-wheat/15">
            <Droplets className="w-5 h-5 text-[#5FD0C0]" />
          </div>
          <div>
            <span className="text-[11px] text-wheat/60 font-body block uppercase">Humidity</span>
            <span className="font-mono text-xl font-bold text-wheat">{weather.humidity}%</span>
            <span className="text-[11px] text-wheat/50 ml-1 font-body">RH</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-monsoon border border-wheat/15">
            <CloudRain className="w-5 h-5 text-turmeric" />
          </div>
          <div>
            <span className="text-[11px] text-wheat/60 font-body block uppercase">Rain Chance</span>
            <span className="font-mono text-xl font-bold text-wheat">{weather.rainProbability}%</span>
            <span className="text-[11px] text-wheat/50 ml-1 font-body">({weather.precipitationMm} mm)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-monsoon border border-wheat/15">
            <Wind className="w-5 h-5 text-wheat/80" />
          </div>
          <div>
            <span className="text-[11px] text-wheat/60 font-body block uppercase">Wind Speed</span>
            <span className="font-mono text-xl font-bold text-wheat">{weather.windSpeed}</span>
            <span className="text-[11px] text-wheat/50 ml-1 font-body">km/h</span>
          </div>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-body ${
        weather.rainProbability > 40
          ? 'bg-turmeric/10 border-turmeric/30 text-wheat'
          : 'bg-[#5FD0C0]/10 border-[#5FD0C0]/25 text-wheat'
      }`}>
        {weather.rainProbability > 40 ? (
          <AlertTriangle className="w-4 h-4 text-turmeric shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#5FD0C0] shrink-0 mt-0.5" />
        )}
        <p className="leading-relaxed">
          <strong className="text-wheat font-semibold">Agronomic Transport Note: </strong>
          {weather.agriculturalAdvice}
        </p>
      </div>

      {/* 7-Day Micro Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-wheat/60 font-body">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> 7-Day District Weather Forecast
            </span>
            <span className="text-[11px]">Informational advisory only</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {weather.forecast.map((day, idx) => (
              <div
                key={idx}
                className="bg-soil/25 p-2 rounded-lg border border-wheat/10 text-center space-y-1 hover:bg-soil/40 transition-colors"
              >
                <p className="text-[11px] font-bold text-wheat/80">{day.dayOfWeek}</p>
                <div className="flex justify-center py-0.5">
                  {day.condition.toLowerCase().includes('rain') ? (
                    <CloudRain className="w-4 h-4 text-[#5FD0C0]" />
                  ) : day.condition.toLowerCase().includes('cloud') ? (
                    <CloudSun className="w-4 h-4 text-turmeric" />
                  ) : (
                    <Sun className="w-4 h-4 text-turmeric" />
                  )}
                </div>
                <p className="font-mono text-xs font-semibold text-wheat">{day.maxTemp}°</p>
                <p className="text-[10px] text-wheat/50 font-mono">{day.rainProbability}% rain</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
