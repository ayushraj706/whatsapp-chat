// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Login ke baad user ko dashboard par bhej do
      return NextResponse.redirect(`${origin}/protected`) 
    }
  }

  // Error aaye toh home par wapas bhej do
  return NextResponse.redirect(`${origin}`)
}

