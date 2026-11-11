import { useMemo, useRef, useState } from 'react'
import { ClipboardList, MessageSquarePlus, MessagesSquare, RotateCcw, Trash2 } from 'lucide-react'
import FeedbackCard from '../../components/citizen/FeedbackCard'
import FormSection from '../../components/forms/FormSection'
import InputField from '../../components/forms/InputField'
import SelectField from '../../components/forms/SelectField'
import SubmitButton from '../../components/forms/SubmitButton'
import TextareaField from '../../components/forms/TextareaField'
import { StarRating } from '../../components/citizen/StarRating'
import { feedbackCategories, initialFeedbackHistory, ratingLabels } from '../../data/feedbackMockData'
import { validators } from '../../utils/validation'

const MAX_DESCRIPTION_LENGTH = 500
const MAX_SUGGESTION_LENGTH = 300

const EMPTY_FORM = {
  category: '',
  subject: '',
  description: '',
  suggestions: '',
}

function FeedbackPage() {
  const [rating, setRating] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({ rating: '', category: '', subject: '', description: '' })
  const [history, setHistory] = useState(initialFeedbackHistory)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const ratingErrorRef = useRef(null)

  const showToast = (message) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 5000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const validator = validators[name]
    if (!validator) return
    setErrors((prev) => ({ ...prev, [name]: validator(value) }))
  }

  const selectRating = (value) => {
    setRating(value)
    if (errors.rating) setErrors((prev) => ({ ...prev, rating: '' }))
  }

  const isSubmittingRef = useRef(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmittingRef.current) return

    const newErrors = {
      rating: rating > 0 ? '' : 'Please select a star rating before submitting',
      category: validators.category(form.category),
      subject: validators.feedbackSubject(form.subject),
      description: validators.description(form.description),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) {
      if (newErrors.rating) {
        ratingErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      showToast('Please fix the highlighted fields before submitting')
      return
    }

    // Lock guards against accidental duplicate submissions during the mock delay.
    isSubmittingRef.current = true
    setIsSubmitting(true)
    // TODO: replace with real feedback submission API in a later milestone
    const entry = {
      id: `FB-${Date.now()}`,
      rating,
      category: form.category,
      subject: form.subject,
      description: form.description,
      submittedOn: new Date().toISOString().slice(0, 10),
      response: null,
    }
    console.log('Feedback submitted (mock):', entry)
    setTimeout(() => {
      isSubmittingRef.current = false
      setIsSubmitting(false)
      setHistory((prev) => [entry, ...prev])
      setForm(EMPTY_FORM)
      setRating(0)
      setErrors({ rating: '', category: '', subject: '', description: '' })
      showToast('Thank you! Your feedback has been recorded (demo)')
    }, 1200)
  }

  const clearForm = () => {
    setForm(EMPTY_FORM)
    setRating(0)
    setErrors({ rating: '', category: '', subject: '', description: '' })
    showToast('Form cleared')
  }

  const notifyStats = useMemo(() => {
    const responded = history.filter((entry) => entry.response).length
    return { total: history.length, responded, awaiting: history.length - responded }
  }, [history])

  return (
    <div className="min-h-full bg-primary-light/30">
      <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <header className="flex items-start gap-4 sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl text-white shadow-lg shadow-primary/30">
            💬
          </span>
          <div>
            <h1 className="text-2xl font-bold text-primary-ink sm:text-3xl">Share Your Feedback</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Your feedback helps us improve waste collection services in your community.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <section
            ref={ratingErrorRef}
            className={`rounded-2xl border bg-white p-6 text-center shadow-sm shadow-primary/5 sm:p-8 ${
              errors.rating ? 'border-red-300' : 'border-primary/15'
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light/70">
              <ClipboardList className="h-6 w-6 text-primary-dark" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-primary-ink">Rate Your Experience</h2>
            <p className="mt-1 text-sm text-gray-600">
              How satisfied are you with our garbage collection services?
            </p>

            <div className="mt-5 flex flex-col items-center gap-2">
              <StarRating value={rating} onChange={selectRating} size="lg" />
              <p
                aria-live="polite"
                className={`text-sm font-semibold ${
                  rating > 0 ? 'text-primary-dark' : 'text-gray-400'
                }`}
              >
                {rating > 0 ? ratingLabels[rating - 1] : 'Select a rating'}
              </p>
            </div>

            {errors.rating && (
              <p className="mt-2 text-xs text-red-600" role="alert">
                <span aria-hidden="true">&#9888;</span> {errors.rating}
              </p>
            )}
          </section>

          <FormSection
            icon={<MessageSquarePlus className="h-5 w-5" aria-hidden="true" />}
            title="Feedback Details"
            description="Tell us more so we know exactly what to improve"
          >
            <SelectField
              label="Feedback Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.category}
              placeholder="Select feedback category"
              options={feedbackCategories}
            />

            <InputField
              label="Subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.subject}
              placeholder="e.g. Timely collection in my locality this week"
            />

            <TextareaField
              label="Feedback Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.description}
              placeholder="Describe your experience with the garbage collection services..."
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={5}
            />

            <TextareaField
              label="Suggestions (optional)"
              name="suggestions"
              value={form.suggestions}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Share ideas to improve waste collection in your community..."
              maxLength={MAX_SUGGESTION_LENGTH}
              rows={3}
            />

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={clearForm}
                className="flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear Form
              </button>
              <div className="sm:w-56">
                <SubmitButton isSubmitting={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </SubmitButton>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              This is a frontend demo — feedback stays in your browser session and is not sent to the
              municipality yet.
            </p>
          </FormSection>
        </form>

        <FormSection
          icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
          title="Your Previous Feedback"
          description={
            notifyStats.total > 0
              ? `${notifyStats.total} submissions · ${notifyStats.responded} responded · ${notifyStats.awaiting} awaiting response`
              : 'Feedback you submit will appear here'
          }
        >
          {history.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {history.map((entry) => (
                <FeedbackCard key={entry.id} feedback={entry} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary/25 bg-primary-light/30 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-dark shadow-sm ring-1 ring-primary/15">
                <Trash2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-primary-ink">No feedback yet</h3>
              <p className="mt-1 max-w-xs text-xs text-gray-500">
                Rate your experience above and submit your first feedback — it will show up here with
                any authority response.
              </p>
            </div>
          )}
        </FormSection>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-primary-ink px-4 py-3 text-sm font-medium text-white shadow-lg sm:right-6 sm:bottom-6"
        >
          <span aria-hidden="true">{toast.includes('fix') ? '⚠️' : '✅'}</span>
          {toast}
        </div>
      )}
    </div>
  )
}

export default FeedbackPage
