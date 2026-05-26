'use client'

import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { type Attachment } from './types'
import { uuid, readB64, fmtBytes } from './utils'

interface AttachmentManagerProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

export function AttachmentManager({ attachments, onChange }: AttachmentManagerProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const handle = useCallback(async (files: FileList) => {
    setBusy(true)
    const novo: Attachment[] = []
    for (const f of Array.from(files)) {
      if (f.size > 5 * 1024 * 1024) {
        alert(f.name + ' excede 5MB.')
        continue
      }
      try {
        const data = await readB64(f)
        novo.push({ id: uuid(), name: f.name, size: f.size, type: f.type, data })
      } catch {
        // ignore
      }
    }
    onChange([...(attachments || []), ...novo])
    setBusy(false)
    if (ref.current) ref.current.value = ''
  }, [attachments, onChange])

  const del = (id: string) => onChange((attachments || []).filter(a => a.id !== id))

  const dl = (att: Attachment) => {
    if (!att.data) {
      alert('Este arquivo foi importado do CSV e não tem conteúdo para baixar. Faça o upload novamente.')
      return
    }
    const a = document.createElement('a')
    a.href = att.data
    a.download = att.name
    a.click()
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault()
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handle(e.dataTransfer.files)
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handle(e.target.files)
  }

  return (
    <div>
      <div
        className="drop-zone"
        onClick={() => ref.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={ref}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        {busy ? 'Carregando...' : 'Clique ou arraste arquivos aqui (máx. 5MB)'}
      </div>
      {(attachments || []).map(att => (
        <div key={att.id} className="att-item">
          <div className="att-icon">
            {att.name.split('.').pop()?.toUpperCase().slice(0, 4)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="att-name">{att.name}</div>
            <div className="att-size">
              {att.data ? fmtBytes(att.size) : 'Referência importada — faça upload para restaurar'}
            </div>
          </div>
          <button onClick={() => dl(att)} style={{ fontSize: 11, padding: '2px 8px' }}>
            Baixar
          </button>
          <button className="danger" onClick={() => del(att.id)} style={{ fontSize: 11, padding: '2px 8px' }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
