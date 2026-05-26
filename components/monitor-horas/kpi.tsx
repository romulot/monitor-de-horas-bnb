'use client'

interface KPIProps {
  label: string
  value: string
  sub?: string
  warn?: boolean
  big?: boolean
  green?: boolean
}

export function KPI({ label, value, sub, warn, big, green }: KPIProps) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div
        className="kpi-value"
        style={{
          fontSize: big ? 22 : 20,
          color: warn ? '#a32d2d' : green ? '#3b6d11' : '#1a1a1a'
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="kpi-sub"
          style={{ color: warn ? '#a32d2d' : '#888' }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}
