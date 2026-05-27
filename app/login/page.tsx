'use client'

import { useState, useTransition } from 'react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: 16,
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e0e0dd',
        borderRadius: 12,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Contrato 2025/340</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
            Monitor de Horas BNB
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 5 }}>
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              disabled={isPending}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: 14,
                border: '1px solid #d1d1ce',
                borderRadius: 6,
                outline: 'none',
                background: isPending ? '#fafaf8' : '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 5 }}>
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isPending}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: 14,
                border: '1px solid #d1d1ce',
                borderRadius: 6,
                outline: 'none',
                background: isPending ? '#fafaf8' : '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: 13,
              color: '#a32d2d',
              background: '#fcebeb',
              border: '1px solid #f5c6c6',
              borderRadius: 6,
              padding: '8px 10px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '9px 0',
              fontSize: 14,
              fontWeight: 500,
              background: isPending ? '#7aafd4' : '#185fa5',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
