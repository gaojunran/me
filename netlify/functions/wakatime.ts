import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

// WakaTime API Base URL - can be overridden with environment variable
// Default to self-hosted Wakapi instance
const WAKATIME_API_BASE = process.env.WAKATIME_API_BASE || 'https://wakapi.codenebula.dpdns.org/api/compat/wakatime/v1'

// Helper function to get API key
function getApiKey(): string {
  const apiKey = process.env.WAKATIME_API_KEY
  if (!apiKey) {
    throw new Error('WAKATIME_API_KEY environment variable is not set')
  }
  return apiKey
}

// Helper function to create CORS headers
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }
}

// Main handler
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const origin = event.headers.origin || event.headers.Origin

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    }
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Get API key
    const apiKey = getApiKey()

    // Get the endpoint from query parameters
    const endpoint = event.queryStringParameters?.endpoint || 'users/current/stats/last_30_days'

    // Build the full URL
    const url = `${WAKATIME_API_BASE}/${endpoint}`

    // Add query parameters if any (excluding 'endpoint')
    const queryParams = new URLSearchParams()
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (key !== 'endpoint' && value) {
          queryParams.append(key, value)
        }
      })
    }

    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url

    console.log('Fetching WakaTime data from:', fullUrl)

    // Fetch data from WakaTime API
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WakaTime API error:', response.status, errorText)
      return {
        statusCode: response.status,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({
          error: 'Failed to fetch data from WakaTime',
          status: response.status,
          message: errorText,
        }),
      }
    }

    const data = await response.json()

    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: JSON.stringify(data),
    }
  }
  catch (error: any) {
    console.error('Error in wakatime function:', error)
    return {
      statusCode: 500,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      }),
    }
  }
}
