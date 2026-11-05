function SubmitButton({ children, isSubmitting = false, onClick, type = 'submit' }) {
  return (
    <button
      type={onClick ? 'button' : type}
      onClick={onClick}
      disabled={isSubmitting}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  )
}

export default SubmitButton
