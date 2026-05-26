import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedTickets = tickets.map(t => ({
    id: t.id,
    rtc: t.rtc,
    descricao: t.descricao,
    horasEstimadas: Number(t.horas_estimadas ?? 0),
    horasRealizadas: Number(t.horas_realizadas ?? 0),
    status: t.status,
    linkEntregavel: t.link_entregavel || '',
    descEntregavel: t.desc_entregavel || '',
    attachments: t.attachments || [],
    dataAbertura: t.data_abertura || '',
    dataFechamento: t.data_fechamento || ''
  }))

  return NextResponse.json(formattedTickets)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const ticket = await request.json()

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      id: ticket.id,
      rtc: ticket.rtc,
      descricao: ticket.descricao,
      horas_estimadas: ticket.horasEstimadas,
      horas_realizadas: ticket.horasRealizadas,
      status: ticket.status,
      link_entregavel: ticket.linkEntregavel || null,
      desc_entregavel: ticket.descEntregavel || null,
      attachments: ticket.attachments || [],
      data_abertura: ticket.dataAbertura || null,
      data_fechamento: ticket.dataFechamento || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const ticket = await request.json()

  const { data, error } = await supabase
    .from('tickets')
    .update({
      rtc: ticket.rtc,
      descricao: ticket.descricao,
      horas_estimadas: ticket.horasEstimadas,
      horas_realizadas: ticket.horasRealizadas,
      status: ticket.status,
      link_entregavel: ticket.linkEntregavel || null,
      desc_entregavel: ticket.descEntregavel || null,
      attachments: ticket.attachments || [],
      data_abertura: ticket.dataAbertura || null,
      data_fechamento: ticket.dataFechamento || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticket.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { id } = await request.json()

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
