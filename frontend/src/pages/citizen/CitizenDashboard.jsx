import { Link } from 'react-router-dom'
import StatusBadge from '../../components/dashboard/StatusBadge'
import SummaryCard from '../../components/dashboard/SummaryCard'
import { complaintSummary, recentComplaints } from '../../data/citizenMockData'

function CitizenDashboard() {
  const cards = [
    { label: 'Total Complaints', value: complaintSummary.total, icon: '📋' },
    { label: 'Pending Complaints', value: complaintSummary.pending, icon: '⏳' },
    { label: 'Resolved Complaints', value: complaintSummary.resolved, icon: '✅' },
  ]

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <section className="rounded-2xl bg-primary-ink p-6 text-white sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, Citizen</h1>
        <p className="mt-2 text-sm text-primary-light sm:text-base">
          Here's a quick summary of your waste reports and community activity.
        </p>
      </section>

      <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-lg font-bold text-primary-ink">Recent Complaints</h2>
            <p className="mt-1 text-sm text-gray-500">Your latest garbage reports and their status.</p>
          </div>
          <Link
            to="/citizen/complaints"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-500 uppercase">
                <th className="py-3 pr-4 font-semibold">Complaint ID</th>
                <th className="py-3 pr-4 font-semibold">Issue</th>
                <th className="py-3 pr-4 font-semibold">Area</th>
                <th className="py-3 pr-4 font-semibold">Reported On</th>
                <th className="py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentComplaints.map((complaint) => (
                <tr key={complaint.id} className="text-gray-700">
                  <td className="py-3.5 pr-4 font-semibold text-primary-ink">{complaint.id}</td>
                  <td className="py-3.5 pr-4">{complaint.issue}</td>
                  <td className="py-3.5 pr-4">{complaint.area}</td>
                  <td className="py-3.5 pr-4 whitespace-nowrap">{complaint.reportedOn}</td>
                  <td className="py-3.5">
                    <StatusBadge status={complaint.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default CitizenDashboard
