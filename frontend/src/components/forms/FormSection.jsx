function FormSection({ icon, title, description, action, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm shadow-primary/5">
      <header className="flex items-center gap-3 border-b border-primary/10 bg-primary-light/50 px-6 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-primary/15">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold text-primary-ink">{title}</h2>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </header>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  )
}

export default FormSection
