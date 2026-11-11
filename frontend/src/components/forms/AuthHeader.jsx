import { Link } from 'react-router-dom'

function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center">
      <Link to="/" className="inline-flex items-center gap-2" aria-label="EcoWare home">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xl text-white">
          🌿
        </span>
        <span className="text-2xl font-bold text-primary-ink">
          Eco<span className="text-primary">Ware</span>
        </span>
      </Link>
      <h1 className="mt-6 text-2xl font-bold text-primary-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

export default AuthHeader
