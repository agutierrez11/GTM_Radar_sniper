// Supabase Edge Function: omni-ingest
// Handles Slack and Telegram Webhooks for Inbound Intelligence

import { createClient } from 'https://esm.sh/@supabase/supabase-client@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Received Payload:", payload)

    // 1. Handle Slack URL Verification (Challenge)
    if (payload.type === 'url_verification') {
      return new Response(JSON.stringify({ challenge: payload.challenge }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // 2. Handle Slack Event (Message)
    if (payload.event && payload.event.type === 'message' && !payload.event.bot_id) {
      const text = payload.event.text || ""
      const urlMatch = text.match(/https?:\/\/[^\s]+/)
      
      if (urlMatch) {
        const url = urlMatch[0].replace(/[<>]/g, '') // Clean Slack URL formatting
        await insertLead(url, `Slack: ${payload.event.user}`)
      }
    }

    // 3. Handle Telegram Message
    if (payload.message && payload.message.text) {
      const text = payload.message.text
      const urlMatch = text.match(/https?:\/\/[^\s]+/)

      if (urlMatch) {
        const url = urlMatch[0]
        await insertLead(url, `Telegram: ${payload.message.from.first_name}`)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

async function insertLead(url: string, source: string) {
  const domain = new URL(url).hostname.replace('www.', '').toUpperCase()
  
  const { data, error } = await supabase
    .from('empresas')
    .insert([
      { 
        name: domain, 
        website: url, 
        status: 'PENDING',
        notes: `Ingested from ${source}` 
      }
    ])

  if (error) {
    console.error("Error inserting lead:", error)
    throw error
  }
  
  console.log(`Lead inserted: ${domain} from ${source}`)
}
