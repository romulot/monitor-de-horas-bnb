import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')

  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Keepalive: variáveis do Supabase ausentes')

    return NextResponse.json(
      { ok: false, error: 'Server configuration error' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/config?id=eq.1&select=id`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      const error = await response.text()

      console.error('Keepalive Supabase:', response.status, error)

      return NextResponse.json(
        {
          ok: false,
          status: response.status,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Keepalive:', error)

    return NextResponse.json(
      { ok: false },
      { status: 500 },
    )
  }
}