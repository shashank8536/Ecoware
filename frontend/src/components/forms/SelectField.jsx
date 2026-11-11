import { useId } from 'react'

function SelectField({ label, name, value, onChange, onBlur, error, placeholder, options }) {
  const id = useId()

  const classes = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-200 focus:border-primary focus:ring-primary/20'

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm transition-colors outline-none focus:ring-2 ${classes} ${value ? '' : 'text-gray-400'}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="text-gray-800">
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <span aria-hidden="true">&#9888;</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default SelectField
