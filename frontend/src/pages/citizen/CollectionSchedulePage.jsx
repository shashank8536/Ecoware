import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Recycle,
  CalendarX2,
  TriangleAlert,
  Megaphone,
} from 'lucide-react'
import CategoryBadge from '../../components/citizen/CategoryBadge'
import CollectionCard from '../../components/citizen/CollectionCard'
import FormSection from '../../components/forms/FormSection'
import { scheduleAnnouncements, scheduleLocation, weeklySchedule } from '../../data/scheduleMockData'
import { getDotColor } from '../../utils/categoryStyles'

const getStartOfWeek = (date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return start
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const getCollectionsForDay = (dayOfWeek) => weeklySchedule.filter((entry) => entry.day === dayOfWeek)

function CollectionSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [today] = useState(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  )

  const isCurrentWeek = weekStart.toDateString() === getStartOfWeek(today).toDateString()
  const weekLabel = `${weekDays[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`

  const nextCollection = useMemo(() => {
    for (let offset = 0; offset <= 13; offset += 1) {
      const date = addDays(today, offset)
      const entries = getCollectionsForDay(date.getDay())
      if (entries.length > 0) {
        return { date, entries: entries.sort((a, b) => a.time.localeCompare(b.time)) }
      }
    }
    return null
  }, [today])

  const upcomingCollections = useMemo(() => {
    const upcoming = []
    for (let offset = 0; offset <= 20 && upcoming.length < 6; offset += 1) {
      const date = addDays(today, offset)
      const entries = getCollectionsForDay(date.getDay())
      entries.forEach((entry) => upcoming.push({ date, ...entry }))
    }
    return upcoming
  }, [today])

  const selectedDayCollections = getCollectionsForDay(selectedDate.getDay())

  const announcements = scheduleAnnouncements

  return (
    <div className="min-h-full bg-primary-light/30">
      <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-ink sm:text-3xl">Collection Schedule</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Stay informed about upcoming garbage collection in your locality.
            </p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-primary/15 bg-white px-4 py-3 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light/70 text-primary-dark">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-primary-ink">
                {scheduleLocation.ward} · {scheduleLocation.locality}
              </p>
              <p className="text-xs text-gray-500">Your registered collection location</p>
            </div>
          </div>
        </header>

        {nextCollection && (
          <section
            aria-label="Next collection highlight"
            className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-ink p-6 text-white shadow-lg shadow-primary/25 sm:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <Recycle className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold sm:text-2xl">Next Collection</h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
                      Upcoming
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-primary-light">
                    Bins out by 6:30 AM on collection day for a smooth pickup.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
                <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3.5 ring-1 ring-white/20">
                  <CalendarDays className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-primary-light">Date &amp; Day</p>
                    <p className="text-sm font-semibold">
                      {nextCollection.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3.5 ring-1 ring-white/20">
                  <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-primary-light">Time</p>
                    <p className="text-sm font-semibold">{nextCollection.entries[0].time}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-3.5 ring-1 ring-white/20 sm:col-span-2">
                  <p className="text-xs text-primary-light">Category</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 ring-1 ring-white/30">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getDotColor(nextCollection.entries[0].category, { onDark: true })}`}
                        aria-hidden="true"
                      />
                      {nextCollection.entries[0].category}
                    </span>
                    <span className="text-primary-light">
                      · {scheduleLocation.ward}, {scheduleLocation.locality}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <FormSection
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          title="Weekly Calendar"
          description={
            isCurrentWeek
              ? 'This week — tap a date to see its collection details'
              : 'Tap a date to see its collection details'
          }
        >
          <div className="rounded-xl border border-primary/10 bg-primary-light/40 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                aria-label="Go to previous week"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-dark shadow-sm ring-1 ring-primary/10 transition-colors hover:bg-primary-light"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="flex items-center gap-2 text-sm font-semibold text-primary-ink">
                {weekLabel}
                {isCurrentWeek && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                    This Week
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                aria-label="Go to next week"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-dark shadow-sm ring-1 ring-primary/10 transition-colors hover:bg-primary-light"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((date) => {
                const isSelected = date.toDateString() === selectedDate.toDateString()
                const isToday = date.toDateString() === today.toDateString()
                const dayCollections = getCollectionsForDay(date.getDay())
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    aria-current={isToday ? 'date' : undefined}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-center transition-all sm:py-3 ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-transparent bg-white text-gray-700 hover:border-primary/30 hover:bg-primary-light/60'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold tracking-wide uppercase ${isSelected ? 'text-primary-light' : 'text-gray-400'}`}>
                      {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </span>
                    <span className={`text-sm font-bold sm:text-base ${isSelected ? 'text-white' : isToday ? 'text-primary-dark' : 'text-primary-ink'}`}>
                      {date.getDate()}
                    </span>
                    <span className="flex h-1.5 items-center gap-0.5" aria-hidden="true">
                      {dayCollections.map((entry) => (
                        <span
                          key={entry.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? 'bg-white' : getDotColor(entry.category)
                          }`}
                        />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-5">
            <p className="text-sm font-semibold text-primary-ink">
              {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {selectedDate.toDateString() === today.toDateString() && (
                <span className="ml-2 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-dark uppercase">
                  Today
                </span>
              )}
            </p>

            {selectedDayCollections.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {selectedDayCollections
                  .slice()
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/10 bg-white px-4 py-3"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-primary-ink">
                        <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                        {entry.time}
                      </span>
                      <CategoryBadge category={entry.category} />
                      <span className="text-xs text-gray-500">
                        {scheduleLocation.ward} · {scheduleLocation.locality}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white py-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <CalendarX2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-700">No collection scheduled</p>
                <p className="mt-1 max-w-xs text-xs text-gray-500">
                  Nothing is scheduled for this day. Your next pickup is highlighted in the green card above.
                </p>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection
          icon={<Recycle className="h-5 w-5" aria-hidden="true" />}
          title="Upcoming Collections"
          description="The next scheduled pickups in your area"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcomingCollections.map(({ date, id, category, time }) => (
              <CollectionCard key={`${date.toISOString()}-${id}`} collection={{ date, id, category, time }} />
            ))}
          </div>
        </FormSection>

        <FormSection
          icon={<Megaphone className="h-5 w-5" aria-hidden="true" />}
          title="Announcements &amp; Notices"
          description="Municipal updates affecting your collection service"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {announcements.map((announcement) => {
              const isImportant = announcement.type === 'Important'
              return (
                <article
                  key={announcement.id}
                  className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                    isImportant
                      ? 'border-amber-300/60 bg-amber-50/60 shadow-sm hover:shadow-md'
                      : 'border-primary/15 bg-white shadow-sm shadow-primary/5 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        isImportant
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-400/30'
                          : 'bg-primary-light text-primary-dark ring-1 ring-primary/20'
                      }`}
                    >
                      {isImportant ? (
                        <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Info className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {isImportant ? 'Important Alert' : 'Information'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(announcement.publishedOn).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-primary-ink">{announcement.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{announcement.description}</p>
                </article>
              )
            })}
          </div>
        </FormSection>
      </div>
    </div>
  )
}

export default CollectionSchedulePage
