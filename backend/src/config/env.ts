import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'farmnexus_default_jwt_secret_2026',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/farmnexus',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  cacheTtlMinutes: Number(process.env.CACHE_TTL_MINUTES) || 30,
  dataGovInApiKey: process.env.DATA_GOV_IN_API_KEY || '',
  agmarknetApiKey: process.env.AGMARKNET_API_KEY || '',
  enamApiKey: process.env.ENAM_API_KEY || '',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  paymentSecretKey: process.env.PAYMENT_SECRET_KEY || '',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_5173FarmNexus',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'secret_test_farmnexus_rzp_2026',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_test_farmnexus_rzp_webhook_2026',
  agmarknetEndpoint: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
}