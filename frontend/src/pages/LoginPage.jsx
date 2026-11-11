import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthHeader from '../components/forms/AuthHeader'
import EmailIcon from '../components/forms/EmailIcon'
import InputField from '../components/forms/InputField'
import SubmitButton from '../components/forms/SubmitButton'
import { validators } from '../utils/validation'

const initialValues = { email: '', password: '' }

function LoginPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setErrors((prev) => ({ ...prev, [name]: validators[name](value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {
      email: validators.email(values.email),
      password: validators.password(values.password),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    setIsSubmitting(true)
    // TODO: replace with real backend authentication in a later step
    console.log('Login submitted:', values)
    setTimeout(() => setIsSubmitting(false), 800)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-primary-light/60 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <AuthHeader title="Welcome back" subtitle="Log in to your EcoWare account" />

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <InputField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<EmailIcon />}
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-primary"
                  defaultChecked
                />
                Remember me
              </label>
              <button
                type="button"
                className="font-medium text-primary transition-colors hover:text-primary-dark"
              >
                Forgot password?
              </button>
            </div>

            <SubmitButton isSubmitting={isSubmitting}>Log In</SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
