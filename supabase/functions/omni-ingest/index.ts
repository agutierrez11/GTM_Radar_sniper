// Supabase Edge Function: omni-ingest
// Handles Slack and Telegram Webhooks for Inbound Intelligence

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // 2. Handle Tactical/Mass Ingestion (Direct Payload)
    if (payload.url) {
      await insertLead(payload.url, payload.source || 'Manual_Hunt', payload.source_url)
    }

    // 3. Handle Slack Event (Message)
    if (payload.event && payload.event.type === 'message' && !payload.event.bot_id) {
      const text = payload.event.text || ""
      const urlMatch = text.match(/https?:\/\/[^\s]+/)
      
      if (urlMatch) {
        const url = urlMatch[0].replace(/[<>]/g, '') // Clean Slack URL formatting
        await insertLead(url, `Slack: ${payload.event.user}`)
      }
    }

    // 4. Handle Telegram Message
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

async function insertLead(url: string, source_attribution: string, source_url?: string) {
  const domain = new URL(url).hostname.replace('www.', '').toLowerCase()
  
  // Clean URL for comparison
  const cleanUrl = url.split('?')[0].replace(/\/$/, '')

  const { data, error } = await supabase
    .from('empresas')
    .upsert(
      [
        { 
          name: domain, 
          website: cleanUrl, 
          status: 'PENDING',
          source_attribution: source_attribution,
          source_url: source_url || url,
          notes: `Intelligence captured via ${source_attribution} at ${new Date().toISOString()}` 
        }
      ],
      { onConflict: 'website', ignoreDuplicates: false }
    )

  if (error) {
    if (error.code === '23505') {
       console.log(`Target ${domain} already monitored. Intel updated.`)
       return
    }
    console.error("Error inserting/updating lead:", error)
    throw error
  }
  
  console.log(`Target locked/updated: ${domain} from ${source_attribution}`)
}
