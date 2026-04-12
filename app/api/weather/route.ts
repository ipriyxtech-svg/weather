import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('q')

  if (!city) {
    return NextResponse.json({ message: 'Missing city' }, { status: 400 })
  }

  const API_KEY = '57770725e1b7af0fe1585301467f4ae0'

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    )

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ message: 'Failed to fetch weather' }, { status: 500 })
  }
}
