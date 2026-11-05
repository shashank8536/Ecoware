const tintStyles = {
  primary: 'bg-primary-light text-primary-dark',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
}

function SummaryCard({ label, value, icon, accent = 'primary' }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-primary-ink">{value}</p>
        </div>
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${tintStyles[accent] || tintStyles.primary}`}
        >
          {icon}
        </span>
      </div>
    </div>
  )
}

export default SummaryCard
