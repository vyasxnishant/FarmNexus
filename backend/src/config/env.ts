import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dataGovInApiKey: process.env.DATA_GOV_IN_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/farmnexus',
  cacheTtlMinutes: Number(process.env.CACHE_TTL_MINUTES) || 30,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  agmarknetEndpoint: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
}

