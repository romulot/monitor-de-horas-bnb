'use client'

import { type Ticket } from './types'

interface EntregaveisCellProps {
  t: Ticket
}

export function EntregaveisCell({ t }: EntregaveisCellProps) {
  const parts: React.ReactNode[] = []

  if (t.linkEntregavel) {
    parts.push(
      <a
        key="l"
        href={t.linkEntregavel}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 11, display: 'block' }}
      >
        Ver link
      </a>
    )
  }

  if (t.descEntregavel) {
    parts.push(
      <span
        key="d"
        style={{
          fontSize: 11,
          color: '#888',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 140
        }}
      >
        {t.descEntregavel}
      </span>
    )
  }

  if (t.attachments && t.attachments.length > 0) {
    parts.push(
      <span
        key="a"
        style={{ fontSize: 11, color: '#854f0b', display: 'block' }}
      >
        {t.attachments.length} anexo{t.attachments.length > 1 ? 's' : ''}
      </span>
    )
  }

  if (!parts.length) {
    return <span style={{ color: '#bbb', fontSize: 11 }}>-</span>
  }

  return <div>{parts}</div>
}
