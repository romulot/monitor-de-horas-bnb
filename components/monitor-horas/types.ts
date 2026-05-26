export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  data: string
}

export interface Ticket {
  id: string
  rtc: string
  descricao: string
  horasEstimadas: number
  horasRealizadas: number
  status: string
  linkEntregavel: string
  descEntregavel: string
  attachments: Attachment[]
  dataAbertura: string
  dataFechamento: string
}

export interface Config {
  totalHoras: number
  valorHora: number
  contrato: string
  cliente: string
  inicioContrato: string
}

export interface MonthData {
  key: string
  label: string
  ano: number
  mes: number
  real: number
  acumIdeal: number
  acumReal: number
  passado: boolean
  atual: boolean
  futuro: boolean
  saldoMes: number
  saldoAcum: number
}
