'use client'

import { type Ticket, type Config } from './types'
import { gerarMeses, horasMes, fmth } from './utils'

interface PainelMensalProps {
  tickets: Ticket[]
  cfg: Config
}

export function PainelMensal({ tickets, cfg }: PainelMensalProps) {
  const meses = gerarMeses(cfg.inicioContrato, 24)
  const meta = cfg.totalHoras / 24
  const hoje = new Date()
  const atual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

  let ai = 0
  let ar = 0

  const rows = meses.map(m => {
    const real = horasMes(tickets, m.key)
    ai += meta
    ar += real
    const passado = m.key < atual
    const isCurrent = m.key === atual
    const futuro = m.key > atual

    return {
      ...m,
      real,
      acumIdeal: ai,
      acumReal: ar,
      passado,
      atual: isCurrent,
      futuro,
      saldoMes: real - meta,
      saldoAcum: ar - ai
    }
  })

  const maxBar = Math.max(meta * 1.8, ...rows.map(r => r.real))
  const BH = 88

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500 }}>Distribuição mensal de horas</h3>
        <span style={{ fontSize: 11, color: '#888' }}>
          Meta: {fmth(meta)}/mês ({fmth(cfg.totalHoras)} ÷ 24 meses)
        </span>
      </div>

      <div className="card" style={{ padding: '16px 12px', marginBottom: 16 }}>
        <div className="chart-wrap" style={{ height: BH + 30 }}>
          {rows.map(m => {
            const bh = m.real > 0 ? Math.round((m.real / maxBar) * (BH - 10)) : 0
            const mh = Math.round((meta / maxBar) * (BH - 10))
            const over = !m.futuro && m.real > meta
            const under = m.passado && m.real < meta && m.real > 0
            const zero = m.passado && m.real === 0
            const bc = m.futuro
              ? '#e0e0dd'
              : m.atual
              ? '#378add'
              : over
              ? '#ef9f27'
              : under || zero
              ? '#f09595'
              : '#97c459'

            return (
              <div key={m.key} className="bar-col">
                <div className="bar-top">
                  {!m.futuro && m.real > 0 ? m.real.toFixed(0) : ''}
                </div>
                <div className="bar-area" style={{ height: BH - 10 }}>
                  <div className="meta-line" style={{ bottom: mh }} />
                  <div
                    className="bar"
                    style={{
                      height: Math.max(bh, m.atual && m.real === 0 ? 2 : 0),
                      background: bc,
                      opacity: m.futuro ? 0.4 : 1
                    }}
                  />
                </div>
                <div className={`bar-lbl${m.atual ? ' atual' : ''}`}>{m.label}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            { c: '#97c459', l: 'Dentro da meta' },
            { c: '#ef9f27', l: 'Acima da meta' },
            { c: '#f09595', l: 'Abaixo/zerado' },
            { c: '#378add', l: 'Mês atual' },
            { c: '#e0e0dd', l: 'Futuro' }
          ].map(({ c, l }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: '#888' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {['Mês', 'Realizado', 'Meta/mês', 'Saldo mês', 'Acum. real', 'Acum. ideal', 'Saldo acum.'].map((h, i) => (
                <th
                  key={h}
                  style={{ textAlign: i === 0 ? 'left' : 'right', background: '#fafaf8' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m, idx) => {
              const bg = m.atual ? '#e6f1fb' : idx % 2 === 0 ? '#fff' : '#fafaf8'
              const tc = m.futuro ? '#bbb' : '#1a1a1a'
              const sm = m.futuro ? '#bbb' : m.saldoMes >= 0 ? '#3b6d11' : '#a32d2d'
              const sa = m.futuro ? '#bbb' : m.saldoAcum >= 0 ? '#3b6d11' : '#a32d2d'

              return (
                <tr key={m.key} style={{ background: bg, opacity: m.futuro ? 0.6 : 1 }}>
                  <td style={{ color: m.atual ? '#185fa5' : tc, fontWeight: m.atual ? 500 : 400 }}>
                    {m.label}
                  </td>
                  <td style={{ textAlign: 'right', color: tc, fontWeight: !m.futuro && m.real > 0 ? 500 : 400 }}>
                    {m.futuro ? '—' : fmth(m.real)}
                  </td>
                  <td style={{ textAlign: 'right', color: '#888' }}>{fmth(meta)}</td>
                  <td style={{ textAlign: 'right', color: sm, fontWeight: 500 }}>
                    {m.futuro ? '—' : (m.saldoMes >= 0 ? '+' : '') + fmth(m.saldoMes)}
                  </td>
                  <td style={{ textAlign: 'right', color: tc }}>{fmth(m.acumReal)}</td>
                  <td style={{ textAlign: 'right', color: '#888' }}>{fmth(m.acumIdeal)}</td>
                  <td style={{ textAlign: 'right', color: sa, fontWeight: 500 }}>
                    {m.futuro ? '—' : (m.saldoAcum >= 0 ? '+' : '') + fmth(m.saldoAcum)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
