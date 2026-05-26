'use client'

import { useState, useEffect, useCallback, type CSSProperties } from 'react'
import { type Ticket, type Config } from './types'
import { STATUSES, DEFAULT_CONFIG, fmt, fmth } from './utils'
import { StatusBadge } from './status-badge'
import { KPI } from './kpi'
import { TicketForm } from './ticket-form'
import { EntregaveisCell } from './entregaveis-cell'
import { PainelMensal } from './painel-mensal'

export function MonitorHoras() {
  const [cfg, setCfg] = useState<Config>(DEFAULT_CONFIG)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loaded, setLoaded] = useState(false)
  const [modal, setModal] = useState<string | null>(null)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [filter, setFilter] = useState('Todos')
  const [showCfg, setShowCfg] = useState(false)
  const [cfgDraft, setCfgDraft] = useState<Config>(DEFAULT_CONFIG)
  const [aba, setAba] = useState('rtc')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [ticketsRes, configRes] = await Promise.all([
          fetch('/api/tickets'),
          fetch('/api/config')
        ])
        
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json()
          setTickets(ticketsData)
        }
        
        if (configRes.ok) {
          const configData = await configRes.json()
          setCfg(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(configData).filter(([, v]) => v !== '' && v != null)
            )
          }))
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
      setLoaded(true)
    }
    loadData()
  }, [])

  // Create ticket
  const createTicket = useCallback(async (ticket: Ticket) => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      })
      if (!res.ok) throw new Error('Falha ao criar')
      setTickets(prev => [ticket, ...prev])
      setSaveStatus('saved')
    } catch (error) {
      console.error('Erro ao criar ticket:', error)
      setSaveStatus('error')
    }
  }, [])

  // Update ticket
  const updateTicket = useCallback(async (ticket: Ticket) => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      })
      if (!res.ok) throw new Error('Falha ao atualizar')
      setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t))
      setSaveStatus('saved')
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error)
      setSaveStatus('error')
    }
  }, [])

  // Delete ticket
  const deleteTicket = useCallback(async (id: string) => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/tickets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Falha ao excluir')
      setTickets(prev => prev.filter(t => t.id !== id))
      setSaveStatus('saved')
    } catch (error) {
      console.error('Erro ao excluir ticket:', error)
      setSaveStatus('error')
    }
  }, [])

  // Save config
  const handleSaveCfg = useCallback(async (c: Config) => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      })
      if (!res.ok) throw new Error('Falha ao salvar config')
      setCfg(c)
      setSaveStatus('saved')
    } catch (error) {
      console.error('Erro ao salvar config:', error)
      setSaveStatus('error')
    }
    setShowCfg(false)
  }, [])

  const activeTs = tickets.filter(t => t.status !== 'Cancelado')
  const horasUsadas = activeTs.reduce((a, t) => a + Number(t.horasRealizadas || 0), 0)
  const horasFaturadas = tickets.filter(t => t.status === 'Faturado').reduce((a, t) => a + Number(t.horasRealizadas || 0), 0)
  const horasAndamento = tickets.filter(t => t.status === 'Em Andamento').reduce((a, t) => a + Number(t.horasRealizadas || 0), 0)
  const horasAprovadas = tickets.filter(t => t.status === 'Aprovado').reduce((a, t) => a + Number(t.horasRealizadas || 0), 0)
  const horasDisp = cfg.totalHoras - horasUsadas
  const pct = Math.min((horasUsadas / cfg.totalHoras) * 100, 100)
  const warn = horasDisp / cfg.totalHoras < 0.10
  const barColor = warn ? '#e24b4a' : pct > 70 ? '#ef9f27' : '#639922'
  const filtered = filter === 'Todos' ? tickets : tickets.filter(t => t.status === filter)

  const handleSaveTicket = useCallback((t: Ticket) => {
    const isExisting = tickets.find(x => x.id === t.id)
    if (isExisting) {
      updateTicket(t)
    } else {
      createTicket(t)
    }
    setModal(null)
    setEditTicket(null)
  }, [tickets, createTicket, updateTicket])

  const handleDelete = useCallback((id: string) => {
    if (confirm('Remover este RTC?')) {
      deleteTicket(id)
    }
  }, [deleteTicket])

  const exportCSV = () => {
    const rows = [
      ['RTC', 'Descrição', 'H.Est', 'H.Real', 'Status', 'Link', 'Desc.Entregável', 'Anexos', 'Abertura', 'Fechamento'],
      ...tickets.map(t => [
        t.rtc,
        t.descricao,
        t.horasEstimadas,
        t.horasRealizadas,
        t.status,
        t.linkEntregavel || '',
        t.descEntregavel || '',
        (t.attachments || []).map(a => a.name).join('; '),
        t.dataAbertura,
        t.dataFechamento
      ])
    ]
    const csv = rows.map(r => r.map(v => '"' + (v || '').toString().replace(/"/g, '""') + '"').join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv)
    a.download = 'horas-consultoria.csv'
    a.click()
  }

  if (!loaded) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
        Carregando dados do projeto...
      </div>
    )
  }

  const tabStyle = (a: string): CSSProperties => ({
    background: 'none',
    border: 'none',
    borderBottom: aba === a ? '2px solid #185fa5' : '2px solid transparent',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
    color: aba === a ? '#185fa5' : '#888',
    fontWeight: aba === a ? 500 : 400,
    borderRadius: 0
  })

  const cols: Record<string, { bg: string; c: string }> = {
    'Planejado': { bg: '#f3e8ff', c: '#6b21a8' },
    'Em Andamento': { bg: '#e6f1fb', c: '#0c447c' },
    'Aprovado': { bg: '#faeeda', c: '#633806' },
    'Faturado': { bg: '#eaf3de', c: '#27500a' },
    'Cancelado': { bg: '#fcebeb', c: '#791f1f' }
  }

  return (
    <div className="monitor-app" style={{ position: 'relative' }}>
      <h2 className="sr-only">Monitor de Horas de Consultoria — Contrato {cfg.contrato}</h2>

      {/* Banner Supabase */}
      <div className="alert-info">
        <span>&#9729;</span>
        <span>
          Dados sincronizados com Supabase ·{' '}
          {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvo'}
        </span>
      </div>

      {warn && (
        <div className="alert-warn">
          ⚠ Saldo baixo: restam apenas {fmth(horasDisp)} ({((horasDisp / cfg.totalHoras) * 100).toFixed(1)}% do total contratado)
        </div>
      )}

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>
            Contrato {cfg.contrato} · {cfg.cliente}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>Monitor de Horas BNB</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => { setCfgDraft({ ...cfg }); setShowCfg(true) }}>Configurar</button>
          <button onClick={exportCSV}>Exportar CSV</button>
          <button className="primary" onClick={() => { setEditTicket(null); setModal('form') }}>+ Novo RTC</button>
        </div>
      </div>

      {/* KPIs com box cinza */}
      <div style={{ background: '#e8e8e5', border: '1px solid #d8d8d5', borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <KPI label="Total Contratado" value={fmth(cfg.totalHoras)} sub={fmt(cfg.totalHoras * cfg.valorHora)} />
          <KPI label="Horas Utilizadas" value={fmth(horasUsadas)} sub={fmt(horasUsadas * cfg.valorHora)} />
          <KPI label="Horas Disponíveis" value={fmth(horasDisp)} sub={fmt(horasDisp * cfg.valorHora)} warn={warn} />
          <div className="kpi">
            <div className="kpi-label">Valor faturado</div>
            <div className="kpi-value" style={{ fontSize: 22, color: '#3b6d11' }}>
              {fmt(horasFaturadas * cfg.valorHora)}
            </div>
            <div className="kpi-sub">Valor/hora: {fmt(cfg.valorHora)}</div>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}>
          <span>Consumo acumulado de horas</span>
          <span style={{ fontWeight: 500, color: barColor }}>{pct.toFixed(1)}%</span>
        </div>
        <div className="progress-outer">
          <div className="progress-inner" style={{ width: pct + '%', background: barColor }} />
        </div>
      </div>

      {/* Abas */}
      <div className="tab-bar">
        <button style={tabStyle('rtc')} onClick={() => setAba('rtc')}>Registro de RTCs</button>
        <button style={tabStyle('mensal')} onClick={() => setAba('mensal')}>Acompanhamento mensal</button>
      </div>

      {/* Aba RTCs */}
      {aba === 'rtc' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#888' }}>Filtrar:</span>
            {['Todos', ...STATUSES].map(s => {
              const ac = filter === s
              const cl = cols[s]
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    background: ac && cl ? cl.bg : '',
                    color: ac && cl ? cl.c : ac ? '#185fa5' : '#888',
                    borderColor: ac ? 'currentColor' : '#d1d1ce'
                  }}
                >
                  {s}
                </button>
              )
            })}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#888' }}>
              {filtered.length} registro(s)
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
              {tickets.length === 0 ? 'Nenhum RTC ainda. Clique em "+ Novo RTC".' : 'Nenhum RTC com este status.'}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    {[['RTC', '9%'], ['Descrição', '22%'], ['H.Est', '7%'], ['H.Real', '7%'], ['Status', '12%'], ['Entregáveis', '17%'], ['Abertura', '10%'], ['', '8%']].map(([h, w]) => (
                      <th key={h + w} style={{ width: w, background: '#fafaf8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.rtc}</td>
                      <td style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descricao}</td>
                      <td style={{ textAlign: 'right' }}>{fmth(t.horasEstimadas)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{fmth(t.horasRealizadas)}</td>
                      <td><StatusBadge s={t.status} /></td>
                      <td><EntregaveisCell t={t} /></td>
                      <td style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>{t.dataAbertura || '—'}</td>
                      <td>
                        <div className="row-btns">
                          <button style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => { setEditTicket(t); setModal('form') }}>Editar</button>
                          <button className="danger" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => handleDelete(t.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 11, color: '#aaa', textAlign: 'right' }}>
            Faturado: {fmth(horasFaturadas)} · Aprovado: {fmth(horasAprovadas)} · Em andamento: {fmth(horasAndamento)}
          </div>
        </div>
      )}

      {aba === 'mensal' && <PainelMensal tickets={tickets} cfg={cfg} />}

      {/* Modal RTC */}
      {modal === 'form' && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setModal(null); setEditTicket(null) } }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editTicket ? 'Editar RTC' : 'Novo RTC'}</div>
              <button className="modal-close" onClick={() => { setModal(null); setEditTicket(null) }}>×</button>
            </div>
            <TicketForm
              ticket={editTicket}
              onSave={handleSaveTicket}
              onCancel={() => { setModal(null); setEditTicket(null) }}
            />
          </div>
        </div>
      )}

      {/* Modal Configurações */}
      {showCfg && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowCfg(false) }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Configurações do Contrato</div>
              <button className="modal-close" onClick={() => setShowCfg(false)}>×</button>
            </div>
            {[
              ['totalHoras', 'Total de Horas Contratadas', 'number'],
              ['valorHora', 'Valor por Hora (R$)', 'number'],
              ['contrato', 'Número do Contrato', 'text'],
              ['cliente', 'Cliente', 'text'],
              ['inicioContrato', 'Início do Contrato', 'date']
            ].map(([k, label, type]) => (
              <div key={k}>
                <label className="field-label">{label}</label>
                <input
                  type={type}
                  value={cfgDraft[k as keyof Config] || ''}
                  onChange={e => setCfgDraft(p => ({
                    ...p,
                    [k]: ['totalHoras', 'valorHora'].includes(k) ? parseFloat(e.target.value) || 0 : e.target.value
                  }))}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setShowCfg(false)}>Cancelar</button>
              <button className="primary" onClick={() => handleSaveCfg(cfgDraft)}>Salvar Configuração</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
