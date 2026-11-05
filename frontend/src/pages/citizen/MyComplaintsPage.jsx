import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardList, FolderOpen, LoaderCircle, Plus, Search, SlidersHorizontal } from 'lucide-react'
import ComplaintCard from '../../components/citizen/ComplaintCard'
import FilterSelect from '../../components/citizen/FilterSelect'
import SummaryCard from '../../components/dashboard/SummaryCard'
import { citizenComplaints } from '../../data/citizenMockData'

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved']
const CATEGORY_OPTIONS = ['All Categories', 'Household Waste', 'Plastic Waste', 'Construction Waste', 'Commercial Waste', 'Other']
const SORT_OPTIONS = ['Newest First', 'Oldest First']

function MyComplaintsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [sortOrder, setSortOrder] = useState('Newest First')

  const counts = useMemo(() => {
    const tally = { Pending: 0, 'In Progress': 0, Resolved: 0 }
    citizenComplaints.forEach((complaint) => {
      tally[complaint.status] = (tally[complaint.status] || 0) + 1
    })
    return {
      total: citizenComplaints.length,
      ...tally,
    }
  }, [])

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase()
    return citizenComplaints
      .filter((complaint) => {
        const matchesSearch =
          !query ||
          complaint.title.toLowerCase().includes(query) ||
          complaint.id.toLowerCase().includes(query)
        const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter
        const matchesCategory = categoryFilter === 'All Categories' || complaint.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        if (a.reportedOn === b.reportedOn) {
          return sortOrder === 'Newest First' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)
        }
        return sortOrder === 'Newest First'
          ? b.reportedOn.localeCompare(a.reportedOn)
          : a.reportedOn.localeCompare(b.reportedOn)
      })
  }, [search, statusFilter, categoryFilter, sortOrder])

  const isFiltering = search !== '' || statusFilter !== 'All' || categoryFilter !== 'All Categories'

  const summaryCards = [
    { label: 'Total Complaints', value: counts.total, icon: <ClipboardList className="h-6 w-6" />, accent: 'primary' },
    { label: 'Pending', value: counts.Pending, icon: <FolderOpen className="h-6 w-6" />, accent: 'amber' },
    { label: 'In Progress', value: counts['In Progress'], icon: <LoaderCircle className="h-6 w-6" />, accent: 'blue' },
    { label: 'Resolved', value: counts.Resolved, icon: <CheckCircle2 className="h-6 w-6" />, accent: 'primary' },
  ]

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-ink sm:text-3xl">My Complaints</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Track your reported garbage complaints and monitor their progress.
          </p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Report New Garbage
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </section>

      <section
        aria-label="Search and filter complaints"
        className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm shadow-primary/5 sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-ink">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
          Search &amp; Filter
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="relative xl:col-span-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or complaint ID..."
              aria-label="Search complaints by title or ID"
              className="block h-full w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-gray-800 shadow-sm transition-colors outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={CATEGORY_OPTIONS} />
          <FilterSelect label="Sorting" value={sortOrder} onChange={setSortOrder} options={SORT_OPTIONS} />
        </div>
      </section>

      {filteredComplaints.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-primary/15 bg-white p-10 text-center shadow-sm shadow-primary/5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
            <Search className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-primary-ink">No complaints found</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {isFiltering
              ? 'No complaints match your current search or filters. Try adjusting them.'
              : 'You have not reported any garbage complaints yet.'}
          </p>
          {isFiltering && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatusFilter('All')
                setCategoryFilter('All Categories')
              }}
              className="mt-4 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light"
            >
              Clear Filters
            </button>
          )}
        </section>
      )}
    </div>
  )
}

export default MyComplaintsPage
