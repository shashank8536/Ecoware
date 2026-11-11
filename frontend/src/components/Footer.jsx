function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-primary-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
        <p className="text-sm text-primary-light">
          🌿 <span className="font-semibold">EcoWare</span> — Smart Community-Based
          Garbage Collection &amp; Management
        </p>
        <p className="text-xs text-gray-300">
          © {new Date().getFullYear()} EcoWare. Built for a cleaner tomorrow.
        </p>
      </div>
    </footer>
  )
}

export default Footer
