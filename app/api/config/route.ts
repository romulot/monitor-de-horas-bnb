import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    totalHoras: Number(data.total_horas),
    valorHora: Number(data.valor_hora),
    contrato: data.contrato || '',
    cliente: data.cliente || '',
    inicioContrato: data.inicio_contrato || ''
  })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const config = await request.json()

  const { data, error } = await supabase
    .from('config')
    .update({
      total_horas: config.totalHoras,
      valor_hora: config.valorHora,
      contrato: config.contrato,
      cliente: config.cliente,
      inicio_contrato: config.inicioContrato,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    console.error('Error updating config:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    totalHoras: Number(data.total_horas),
    valorHora: Number(data.valor_hora),
    contrato: data.contrato || '',
    cliente: data.cliente || '',
    inicioContrato: data.inicio_contrato || ''
  })
}
