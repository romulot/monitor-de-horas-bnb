import { type Ticket, type Config, type MonthData } from './types'

export const STATUSES = ['Planejado', 'Em Andamento', 'Aprovado', 'Faturado', 'Cancelado']
export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const DEFAULT_CONFIG: Config = {
  totalHoras: 2500,
  valorHora: 188,
  contrato: '2025/340',
  cliente: 'Banco do Nordeste do Brasil S.A.',
  inicioContrato: '2026-01-05'
}

export const SEED_TICKETS: Ticket[] = [
  {
    id: 'rtc001imported',
    rtc: 'RTC-1332235',
    descricao: 'Engenharia reversa do Ambiente Liferay Intranet do BNB',
    horasEstimadas: 185,
    horasRealizadas: 185,
    status: 'Aprovado',
    linkEntregavel: 'https://gitlab.dreads.bnb/celula-de-estrategia-e-arquitetura-de-ti/front-end/liferay/core-upgrade-7.4/-/tree/source-code-recovery',
    descEntregavel: '',
    attachments: [{
      id: 'att001',
      name: 'Relatório de Engenharia Reversa dos Módulos Intranet BNB.docx (1).pdf',
      size: 0,
      type: 'application/pdf',
      data: ''
    }],
    dataAbertura: '2026-03-09',
    dataFechamento: '2026-04-27'
  },
  {
    id: 'rtc002imported',
    rtc: 'RTC-1432552',
    descricao: 'Engenharia reversa do Ambiente Liferay Portal de Internet do BNB.',
    horasEstimadas: 264,
    horasRealizadas: 264,
    status: 'Em Andamento',
    linkEntregavel: 'https://gitlab.dreads.bnb/celula-de-estrategia-e-arquitetura-de-ti/front-end/liferay/core-upgrade-7.4/-/tree/source-code-recovery',
    descEntregavel: '',
    attachments: [{
      id: 'att002',
      name: 'relatorio_engenharia_reversa_modulos_internet.pdf',
      size: 0,
      type: 'application/pdf',
      data: ''
    }],
    dataAbertura: '2026-04-06',
    dataFechamento: '2026-04-28'
  }
]

export function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function fmt(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

export function fmth(n: number): string {
  return Number(n).toFixed(1) + 'h'
}

export function fmtBytes(b: number): string {
  if (!b || b === 0) return '—'
  if (b < 1024) return b + 'B'
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB'
  return (b / 1048576).toFixed(1) + 'MB'
}

export function readB64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = e => res(e.target?.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export function gerarMeses(inicio: string, qtd: number): Omit<MonthData, 'real' | 'acumIdeal' | 'acumReal' | 'passado' | 'atual' | 'futuro' | 'saldoMes' | 'saldoAcum'>[] {
  const out: { key: string; label: string; ano: number; mes: number }[] = []
  const d = new Date(inicio + 'T12:00:00')
  for (let i = 0; i < qtd; i++) {
    const y = d.getFullYear()
    const m = d.getMonth()
    out.push({
      key: `${y}-${String(m + 1).padStart(2, '0')}`,
      label: MESES[m] + '/' + String(y).slice(2),
      ano: y,
      mes: m
    })
    d.setMonth(m + 1)
  }
  return out
}

export function horasMes(tickets: Ticket[], key: string): number {
  return tickets
    .filter(t => t.status !== 'Cancelado' && t.dataAbertura && t.dataAbertura.slice(0, 7) === key)
    .reduce((a, t) => a + Number(t.horasRealizadas || 0), 0)
}
