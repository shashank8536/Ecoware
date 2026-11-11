import { Calendar, Info, MessageSquareQuote } from 'lucide-react'
import CategoryBadge from './CategoryBadge'
import { StarRatingDisplay } from './StarRating'

function FeedbackCard({ feedback }) {
  const hasResponse = Boolean(feedback.response)

  return (
    <article className="flex flex-col rounded-2xl border border-primary/15 bg-white p-5 shadow-sm shadow-primary/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {new Date(feedback.submittedOn).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        {hasResponse ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark ring-1 ring-primary/20">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            Responded
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-400/30">
            Awaiting Response
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <StarRatingDisplay value={feedback.rating} />
        <CategoryBadge category={feedback.category} className="scale-90 origin-left" />
      </div>

      <h3 className="mt-2 text-sm font-bold text-primary-ink">{feedback.subject}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{feedback.description}</p>

      {hasResponse && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary-light/40 p-3.5">
          <MessageSquareQuote className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary-dark uppercase">
              Authority response ·{' '}
              {new Date(feedback.response.respondedOn).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{feedback.response.text}</p>
          </div>
        </div>
      )}
    </article>
  )
}

export default FeedbackCard
