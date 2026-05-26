'use client'

interface StatusBadgeProps {
  s: string
}

export function StatusBadge({ s }: StatusBadgeProps) {
  const classMap: Record<string, string> = {
    'Planejado': 'badge badge-planejado',
    'Em Andamento': 'badge badge-andamento',
    'Aprovado': 'badge badge-aprovado',
    'Faturado': 'badge badge-faturado',
    'Cancelado': 'badge badge-cancelado'
  }
  const className = classMap[s] || 'badge badge-andamento'
  return <span className={className}>{s}</span>
}
