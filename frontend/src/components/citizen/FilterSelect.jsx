function FilterSelect({ label, value, onChange, options }) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="block w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pr-9 pl-3.5 text-sm font-medium text-gray-700 shadow-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon />
    </div>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default FilterSelect
