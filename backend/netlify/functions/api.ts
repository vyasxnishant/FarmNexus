import serverless from 'serverless-http'
import app from '../../src/index.js'

export const handler = serverless(app, {
  requestId: 'x-nf-request-id'
})