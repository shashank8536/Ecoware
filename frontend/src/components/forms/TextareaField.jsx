import { useId } from 'react'

function TextareaField({ label, name, value, onChange, onBlur, error, placeholder, rows = 4, maxLength }) {
  const id = useId()

  const classes = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-200 focus:border-primary focus:ring-primary/20'

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {maxLength && (
          <span
            className={`text-xs ${value.length >= maxLength ? 'font-semibold text-red-600' : 'text-gray-400'}`}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`block w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-colors outline-none focus:ring-2 ${classes}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <span aria-hidden="true">&#9888;</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default TextareaField
