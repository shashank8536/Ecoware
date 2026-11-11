import { Clock, MapPin } from 'lucide-react'
import CategoryBadge from './CategoryBadge'
import { scheduleLocation } from '../../data/scheduleMockData'

function CollectionCard({ collection }) {
  return (
    <article className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm shadow-primary/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-ink">
            {collection.date.toLocaleDateString('en-IN', { weekday: 'long' })}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {collection.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span className="rounded-lg bg-primary-light/70 px-2.5 py-1 text-xs font-semibold text-primary-dark">
          Upcoming
        </span>
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <CategoryBadge category={collection.category} />
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {collection.time}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">
            {scheduleLocation.ward} · {scheduleLocation.locality}
          </span>
        </p>
      </div>
    </article>
  )
}

export default CollectionCard
