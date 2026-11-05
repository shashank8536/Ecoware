import { Calendar, MapPin, Paperclip } from 'lucide-react'
import StatusBadge from '../dashboard/StatusBadge'

const categoryChip = 'rounded-full bg-primary-light/70 px-2.5 py-1 text-xs font-medium text-primary-dark'

function ComplaintCard({ complaint }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-primary/15 bg-white p-5 shadow-sm shadow-primary/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-primary-light/70 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-primary-dark">
          {complaint.id}
        </span>
        <StatusBadge status={complaint.status} />
      </div>

      <h3 className="mt-3 text-base leading-snug font-semibold text-primary-ink">
        {complaint.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">{complaint.description}</p>

      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{complaint.area}</span>
          <span className="text-gray-300">·</span>
          <span className="shrink-0 text-gray-500">{complaint.ward}</span>
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {new Date(complaint.reportedOn).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <Paperclip className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {complaint.photoCount}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <span className={categoryChip}>{complaint.category}</span>
      </div>
    </article>
  )
}

export default ComplaintCard
