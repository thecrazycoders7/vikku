// OpenAI calls are handled by Supabase edge functions - API keys never exposed to the frontend

import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function getUserToken() {
  if (!supabase) return SUPABASE_ANON_KEY
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || SUPABASE_ANON_KEY
}

async function callEdgeFunction(fnName, body, useUserToken = false) {
  const token = useUserToken ? await getUserToken() : SUPABASE_ANON_KEY
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || `${fnName} failed`)
  }
  return response.json()
}

export async function estimateProjectCost(requirements, location = null) {
  try {
    return await callEdgeFunction('openai-estimate', { requirements, location })
  } catch (error) {
    throw new Error(`Failed to generate cost estimate: ${error.message}`)
  }
}

export async function calculateROI(inputs) {
  try {
    return await callEdgeFunction('openai-roi', inputs)
  } catch (error) {
    throw new Error(`Failed to calculate ROI: ${error.message}`)
  }
}

export async function checkAIVisibility(url) {
  try {
    return await callEdgeFunction('openai-visibility', { url })
  } catch (error) {
    throw new Error(`Failed to check AI visibility: ${error.message}`)
  }
}

export async function calculateTimeline(inputs) {
  try {
    return await callEdgeFunction('openai-timeline', inputs)
  } catch (error) {
    throw new Error(`Failed to calculate timeline: ${error.message}`)
  }
}

export async function recommendStack(inputs) {
  try {
    return await callEdgeFunction('openai-stack', inputs)
  } catch (error) {
    throw new Error(`Failed to recommend stack: ${error.message}`)
  }
}

export async function estimateMaintenance(inputs) {
  try {
    return await callEdgeFunction('openai-maintenance', inputs)
  } catch (error) {
    throw new Error(`Failed to estimate maintenance: ${error.message}`)
  }
}

export async function planProject(description) {
  try {
    // Sends user JWT so the edge function can verify Pro subscription
    return await callEdgeFunction('openai-plan', { description }, true)
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function sendWeeklyDigest(userId) {
  try {
    const token = await getUserToken()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/weekly-digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to send digest')
    }
    return response.json()
  } catch (error) {
    throw new Error(`Failed to send digest: ${error.message}`)
  }
}
