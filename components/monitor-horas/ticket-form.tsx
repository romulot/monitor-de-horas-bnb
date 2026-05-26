'use client'

import { useState } from 'react'
import { type Ticket } from './types'
import { STATUSES, uuid } from './utils'
import { AttachmentManager } from './attachment-manager'

interface TicketFormProps {
  ticket: Ticket | null
  onSave: (ticket: Ticket) => void
  onCancel: () => void
}

export function TicketForm({ ticket, onSave, onCancel }: TicketFormProps) {
  const empty: Ticket = {
    id: '',
    rtc: '',
    descricao: '',
    horasEstimadas: 0,
    horasRealizadas: 0,
    status: 'Em Andamento',
    linkEntregavel: '',
    descEntregavel: '',
    attachments: [],
    dataAbertura: new Date().toISOString().slice(0, 10),
    dataFechamento: ''
  }

  const [f, setF] = useState<Ticket>(ticket ? { ...empty, ...ticket } : empty)

  const set = <K extends keyof Ticket>(k: K, v: Ticket[K]) => setF(p => ({ ...p, [k]: v }))

  const W = { width: '100%', marginTop: 3 }

  return (
    <div>
      <label className="field-label">Número do RTC</label>
      <input
        style={W}
        value={f.rtc}
        onChange={e => set('rtc', e.target.value)}
        placeholder="Ex: RTC-001"
      />

      <label className="field-label">Descrição da Atividade</label>
      <textarea
        style={{ ...W, minHeight: 68, resize: 'vertical' }}
        value={f.descricao}
        onChange={e => set('descricao', e.target.value)}
        placeholder="Descreva a atividade realizada..."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="field-label">Horas Estimadas</label>
          <input
            style={W}
            type="number"
            min={0}
            step={0.5}
            value={f.horasEstimadas}
            onChange={e => set('horasEstimadas', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="field-label">Horas Realizadas</label>
          <input
            style={W}
            type="number"
            min={0}
            step={0.5}
            value={f.horasRealizadas}
            onChange={e => set('horasRealizadas', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <label className="field-label">Status</label>
      <select
        style={W}
        value={f.status}
        onChange={e => set('status', e.target.value)}
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="section-sep">Entregáveis</div>

      <label className="field-label" style={{ marginTop: 0 }}>Link</label>
      <input
        style={W}
        value={f.linkEntregavel || ''}
        onChange={e => set('linkEntregavel', e.target.value)}
        placeholder="https://..."
      />

      <label className="field-label">Descrição / Observação</label>
      <textarea
        style={{ ...W, minHeight: 52, resize: 'vertical' }}
        value={f.descEntregavel || ''}
        onChange={e => set('descEntregavel', e.target.value)}
        placeholder="Descreva os entregáveis..."
      />

      <label className="field-label">Arquivos anexos</label>
      <AttachmentManager
        attachments={f.attachments || []}
        onChange={atts => set('attachments', atts)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <div>
          <label className="field-label">Data de Abertura</label>
          <input
            style={W}
            type="date"
            value={f.dataAbertura}
            onChange={e => set('dataAbertura', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Data de Fechamento</label>
          <input
            style={W}
            type="date"
            value={f.dataFechamento}
            onChange={e => set('dataFechamento', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <button onClick={onCancel}>Cancelar</button>
        <button
          className="primary"
          onClick={() => onSave({
            ...f,
            id: f.id || uuid(),
            horasEstimadas: parseFloat(String(f.horasEstimadas)) || 0,
            horasRealizadas: parseFloat(String(f.horasRealizadas)) || 0
          })}
        >
          Salvar RTC
        </button>
      </div>
    </div>
  )
}
