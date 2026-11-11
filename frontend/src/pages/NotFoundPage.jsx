import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-6xl">🌱</span>
      <h1 className="mt-6 text-4xl font-extrabold text-primary-ink">404</h1>
      <p className="mt-2 text-lg text-gray-600">
        This page is lost — let's keep EcoWare clean and find our way back.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-dark"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFoundPage
