import { useState } from 'react'
import { Clock, ChevronRight, X, CheckCircle, AlertCircle, Circle } from 'lucide-react'

const initialApplications = {
  applied: [
    { id: 1, company: 'Google', role: 'Software Engineer', ctc: '45 LPA', appliedOn: '18 Mar 2026', fit: 92 },
    { id: 2, company: 'Razorpay', role: 'Backend Engineer', ctc: '22 LPA', appliedOn: '17 Mar 2026', fit: 74 },
  ],
  shortlisted: [
    { id: 3, company: 'Microsoft', role: 'SDE-1', ctc: '40 LPA', appliedOn: '15 Mar 2026', fit: 88, round: 'Aptitude test on 22 Mar' },
  ],
  interview: [
    { id: 4, company: 'Infosys', role: 'Systems Engineer', ctc: '8 LPA', appliedOn: '10 Mar 2026', fit: 95, round: 'HR round on 23 Mar' },
  ],
  offer: [
    { id: 5, company: 'TCS', role: 'Software Engineer', ctc: '7 LPA', appliedOn: '1 Mar 2026', fit: 97, ctcFinal: '7 LPA' },
  ],
  rejected: [
    { id: 6, company: 'Flipkart', role: 'SDE-1', ctc: '28 LPA', appliedOn: '5 Mar 2026', fit: 78 },
  ],
}

const columns = [
  { key: 'applied',     label: 'Applied',     color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-700',   count: true },
  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-amber-500',  light: 'bg-amber-50 text-amber-700', count: true },
  { key: 'interview',   label: 'Interview',   color: 'bg-purple-500', light: 'bg-purple-50 text-purple-700', count: true },
  { key: 'offer',       label: 'Offer',       color: 'bg-green-500',  light: 'bg-green-50 text-green-700', count: true },
  { key: 'rejected',    label: 'Rejected',    color: 'bg-red-400',    light: 'bg-red-50 text-red-600',     count: true },
]

const statusIcon = {
  applied:     <Circle size={14} className="text-blue-500" />,
  shortlisted: <AlertCircle size={14} className="text-amber-500" />,
  interview:   <Clock size={14} className="text-purple-500" />,
  offer:       <CheckCircle size={14} className="text-green-500" />,
  rejected:    <X size={14} className="text-red-400" />,
}

export default function Applications() {
  const [apps, setApps] = useState(initialApplications)
  const [selected, setSelected] = useState(null)

  const total = Object.values(apps).flat().length
  const offers = apps.offer.length
  const interviews = apps.interview.length

  return (
    <div className="p-8 h-screen overflow-hidden flex flex-col">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My applications</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} total · {interviews} in interview · {offers} offer{offers !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-semibold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">Applied</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-semibold text-purple-600">{interviews}</p>
            <p className="text-xs text-gray-500">Interviews</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-semibold text-green-600">{offers}</p>
            <p className="text-xs text-gray-500">Offers</p>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.key} className="w-72 flex-shrink-0 flex flex-col">

            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold text-gray-900">{col.label}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.light}`}>
                {apps[col.key].length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {apps[col.key].map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelected({ ...app, status: col.key })}
                  className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-sm hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-semibold text-gray-700 text-sm">
                        {app.company[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.company}</p>
                        <p className="text-xs text-gray-500">{app.role}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> {app.appliedOn}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.light}`}>
                      {app.fit}% fit
                    </span>
                  </div>

                  {app.round && (
                    <div className="mt-2.5 bg-amber-50 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-amber-700 font-medium">{app.round}</p>
                    </div>
                  )}

                  {col.key === 'offer' && (
                    <div className="mt-2.5 bg-green-50 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-green-700 font-medium">Offer: {app.ctcFinal}</p>
                    </div>
                  )}
                </div>
              ))}

              {apps[col.key].length === 0 && (
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center">
                  <p className="text-xs text-gray-400">No applications here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-700 text-lg">
                  {selected.company[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selected.role}</h3>
                  <p className="text-sm text-gray-500">{selected.company}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: 'Status', value: <span className="flex items-center gap-1.5">{statusIcon[selected.status]} <span className="capitalize">{selected.status}</span></span> },
                { label: 'CTC', value: selected.ctc },
                { label: 'Applied on', value: selected.appliedOn },
                { label: 'Fit score', value: `${selected.fit}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>

            {selected.round && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4">
                <p className="text-sm text-amber-700 font-medium">Upcoming: {selected.round}</p>
              </div>
            )}

            {selected.status === 'offer' && (
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-all">
                  Accept offer
                </button>
                <button className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
                  Decline
                </button>
              </div>
            )}

            {selected.status === 'interview' && (
              <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-all">
                Prepare for interview
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}