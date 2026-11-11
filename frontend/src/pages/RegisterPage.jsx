import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthHeader from '../components/forms/AuthHeader'
import EmailIcon from '../components/forms/EmailIcon'
import InputField from '../components/forms/InputField'
import SubmitButton from '../components/forms/SubmitButton'
import { validators } from '../utils/validation'

const initialValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

function RegisterPage() {
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
    const message = validators[name](value, values.password)
    setErrors((prev) => ({ ...prev, [name]: message }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {
      name: validators.name(values.name),
      email: validators.email(values.email),
      phone: validators.phone(values.phone),
      password: validators.password(values.password),
      confirmPassword: validators.confirmPassword(values.confirmPassword, values.password),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    setIsSubmitting(true)
    // TODO: replace with real backend registration in a later step
    console.log('Registration submitted:', values)
    setTimeout(() => setIsSubmitting(false), 800)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-primary-light/60 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <AuthHeader
            title="Create your account"
            subtitle="Join thousands of citizens recycling smarter"
          />

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <InputField
              label="Full Name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              placeholder="John Doe"
              autoComplete="name"
            />

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
              label="Phone Number"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              placeholder="98765 43210"
              autoComplete="tel"
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              placeholder="Min. 8 characters with a number"
              autoComplete="new-password"
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />

            <SubmitButton isSubmitting={isSubmitting}>Create Account</SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
