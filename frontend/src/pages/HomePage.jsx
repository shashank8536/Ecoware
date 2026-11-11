import { Link } from 'react-router-dom'

const features = [
  {
    icon: '🗑️',
    title: 'Smart Bin Reporting',
    description:
      'Residents report overflowing or damaged bins in seconds with photo evidence and location.',
  },
  {
    icon: '🚛',
    title: 'Optimized Collection',
    description:
      'Sanitation workers get AI-guided pickup routes so no bin is missed and no fuel is wasted.',
  },
  {
    icon: '🤖',
    title: 'AI Waste Insights',
    description:
      'Powered by Gemini AI — classify waste types and get community-level cleanliness insights.',
  },
  {
    icon: '🏆',
    title: 'Community Rewards',
    description:
      'Earn points for every verified report and redeem them, making neighborhoods proud to be clean.',
  },
]

function HomePage() {
  return (
    <div>
      {/* Hero Section — full-viewport background image below the 61px navbar */}
      <section className="relative flex h-[calc(100vh-61px)] w-full flex-col justify-center overflow-hidden">
        <img
          src="/images/ecoware-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center sm:object-[center_35%] [filter:saturate(1.35)_contrast(1.12)_brightness(1.04)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-white/10" />
        <div
          aria-hidden="true"
          className="absolute inset-0 [background:radial-gradient(ellipse_58%_48%_at_50%_44%,rgba(220,252,231,0.6),rgba(220,252,231,0)_72%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-sm font-medium text-primary-dark shadow-sm">
            🌍 Building cleaner, smarter communities
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-primary-ink [text-shadow:0_1px_1px_rgba(255,255,255,0.65),0_0_22px_rgba(255,255,255,0.45)] sm:text-5xl lg:text-6xl">
            Smart Garbage Collection for a{' '}
            <span className="text-primary">Greener Tomorrow</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-[#174B35] [text-shadow:0_1px_2px_rgba(255,255,255,0.85),0_0_16px_rgba(255,255,255,0.6)] sm:text-lg">
            EcoWare connects residents, sanitation workers, and authorities on one
            platform — report waste, optimize pickups, and track community impact
            together.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              to="/"
              className="w-full rounded-xl border border-primary/30 bg-white px-8 py-3.5 text-base font-semibold text-primary-dark transition hover:bg-primary-light sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-ink sm:text-4xl">
            Why Choose EcoWare?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Everything your community needs to manage waste efficiently — in one
            simple platform.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-2xl">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-primary-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / CTA Section */}
      <section className="bg-primary-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to make your community cleaner?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-light">
            Join EcoWare today and be part of the change — one report, one pickup,
            one neighborhood at a time.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary-dark shadow-lg transition hover:bg-primary-light"
          >
            Join Your Community
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
