import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormSection from '../../components/forms/FormSection'
import ImageUploader from '../../components/forms/ImageUploader'
import InputField from '../../components/forms/InputField'
import SelectField from '../../components/forms/SelectField'
import SubmitButton from '../../components/forms/SubmitButton'
import TextareaField from '../../components/forms/TextareaField'
import { validators } from '../../utils/validation'

const MAX_DESCRIPTION_LENGTH = 500
let imageCounter = 0
const nextImageId = () => `img-${Date.now()}-${++imageCounter}`

const wasteCategories = [
  'Overflowing Garbage',
  'Illegal Dumping',
  'Missed Garbage Collection',
  'Open Garbage Burning',
  'Construction Waste',
  'Drainage Waste',
  'Other',
]

const wardOptions = Array.from({ length: 12 }, (_, index) => `Ward ${index + 1}`)

const initialValues = {
  title: '',
  category: '',
  description: '',
  area: '',
  ward: '',
  address: '',
  landmark: '',
  confirmAccuracy: false,
}

function ReportGarbagePage() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [images, setImages] = useState([])
  const [imageError, setImageError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRef, setSubmittedRef] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const previewUrls = useRef([])
  useEffect(() => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = (message) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 5000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    const { name, value, checked } = e.target
    const validator = validators[name]
    if (!validator) return
    const message =
      typeof checked === 'boolean' ? validator(checked) : validator(value)
    setErrors((prev) => ({ ...prev, [name]: message }))
  }

  const addImages = (acceptedFiles, rejectionNote) => {
    const newImages = acceptedFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      previewUrls.current.push(previewUrl)
      return { id: nextImageId(), name: file.name, previewUrl }
    })
    setImages((prev) => [...prev, ...newImages])
    setImageError(rejectionNote || '')
  }

  const removeImage = (id) => {
    setImages((prev) => {
      const removed = prev.find((image) => image.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl)
        previewUrls.current = previewUrls.current.filter((url) => url !== removed.previewUrl)
      }
      return prev.filter((image) => image.id !== id)
    })
    if (imageError) setImageError('')
  }

  const useCurrentLocation = () => {
    if (isDetecting) return
    setIsDetecting(true)

    // Frontend-only mock: shows detected coordinates locally, no map API,
    // no network requests and the location is never persisted anywhere.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setSelectedLocation({
            label: 'Current location detected',
            coords: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
          })
          setIsDetecting(false)
          showToast('Location added to your complaint')
        },
        () => {
          setSelectedLocation({ label: 'Approximate location set', coords: '12.97159, 77.59456' })
          setIsDetecting(false)
          showToast('Location permission denied — set an approximate location instead')
        },
        { timeout: 8000 },
      )
    } else {
      setTimeout(() => {
        setSelectedLocation({ label: 'Sample location set', coords: '12.97159, 77.59456' })
        setIsDetecting(false)
        showToast('Geolocation unavailable — sample location added')
      }, 800)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {
      title: validators.complaintTitle(values.title),
      category: validators.category(values.category),
      description: validators.description(values.description),
      area: validators.area(values.area),
      ward: validators.ward(values.ward),
      address: validators.address(values.address),
      confirmAccuracy: validators.confirmAccuracy(values.confirmAccuracy),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) {
      showToast('Please fix the highlighted fields before submitting')
      return
    }

    setIsSubmitting(true)
    // TODO: replace with real complaint submission API in a later milestone
    console.log('Complaint submitted (mock):', { ...values, images: images.map((img) => img.name), selectedLocation })
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmittedRef('ECW-1043')
      showToast('Complaint submitted successfully (demo)')
      window.scrollTo(0, 0)
    }, 1200)
  }

  const handleCancel = () => {
    setValues(initialValues)
    setErrors({})
    navigate('/citizen')
  }

  const reportAnother = () => {
    setValues(initialValues)
    setErrors({})
    setImages([])
    setSelectedLocation(null)
    setSubmittedRef('')
  }

  if (submittedRef) {
    return (
      <div className="flex min-h-full items-center justify-center bg-primary-light/30 p-4 sm:p-6 lg:p-8">
        <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border border-primary/15 bg-white p-8 text-center shadow-lg shadow-primary/10">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-3xl ring-4 ring-primary/10">
            ✅
          </span>
          <h1 className="mt-4 text-2xl font-bold text-primary-ink">Complaint Submitted!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your garbage complaint has been created successfully.
          </p>
          <div className="mt-6 w-full rounded-xl border border-primary/20 bg-primary-light/60 p-4">
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Complaint Reference ID
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-dark">{submittedRef}</p>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            This is a demo reference ID for the frontend prototype — the complaint is not yet registered
            with the municipality and will only be stored once the backend is connected.
          </p>
          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reportAnother}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
            >
              Report Another Issue
            </button>
            <button
              type="button"
              onClick={() => navigate('/citizen')}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-primary-light/30">
      <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <header className="flex items-start gap-4 sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl text-white shadow-lg shadow-primary/30">
            ♻️
          </span>
          <div>
            <h1 className="text-2xl font-bold text-primary-ink sm:text-3xl">Report Garbage</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Help keep your community clean by reporting garbage-related issues in your area.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl space-y-6">
          <FormSection icon="📋" title="Complaint Information" description="Describe the issue clearly so sanitation teams can act fast">
            <InputField
              label="Complaint Title"
              name="title"
              type="text"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.title}
              placeholder="e.g. Garbage overflowing near residential area"
            />

            <SelectField
              label="Waste Category"
              name="category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.category}
              placeholder="Select waste category"
              options={wasteCategories}
            />

            <TextareaField
              label="Complaint Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.description}
              placeholder="Describe the garbage issue and provide additional details..."
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={5}
            />
          </FormSection>

          <FormSection icon="📍" title="Location Details" description="Where should our collection team look for the issue?">
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Area / Locality"
                name="area"
                type="text"
                value={values.area}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.area}
                placeholder="Enter your locality or area name"
              />

              <SelectField
                label="Ward Number"
                name="ward"
                value={values.ward}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.ward}
                placeholder="Select your ward"
                options={wardOptions}
              />
            </div>

            <TextareaField
              label="Complete Address"
              name="address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              placeholder="House / street / nearby reference of the garbage issue..."
              rows={3}
            />

            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-700">
                Location Selection <span className="text-gray-400">(optional)</span>
              </p>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={isDetecting}
                className="flex items-center gap-2 rounded-lg border border-primary bg-primary-light/60 px-4 py-2.5 text-sm font-medium text-primary-dark transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDetecting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                ) : (
                  <span aria-hidden="true">📍</span>
                )}
                {isDetecting ? 'Detecting your location...' : 'Use My Current Location'}
              </button>

              {selectedLocation && (
                <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary-light/60 p-4">
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="text-lg">
                      📌
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-primary-dark">{selectedLocation.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Coordinates: {selectedLocation.coords}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation(null)
                      showToast('Selected location removed')
                    }}
                    aria-label="Remove selected location"
                    className="rounded-full p-1.5 text-red-600 transition-colors hover:bg-white"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection icon="📷" title="Upload Evidence" description="Clear photos help us verify and prioritise your complaint">
            <ImageUploader
              images={images}
              onAdd={addImages}
              onRemove={removeImage}
              error={imageError}
            />
          </FormSection>

          <FormSection icon="ℹ️" title="Additional Information" description="Optional details that can speed up resolution">
            <InputField
              label="Landmark (optional)"
              name="landmark"
              type="text"
              value={values.landmark}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.landmark}
              placeholder="e.g. Near Green Park school gate"
              autoComplete="off"
            />

            <div
              className={`rounded-xl border p-4 transition-colors ${
                errors.confirmAccuracy
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-primary/15 bg-primary-light/40'
              }`}
            >
              <label htmlFor="confirmAccuracy" className="flex cursor-pointer items-start gap-3">
                <input
                  id="confirmAccuracy"
                  name="confirmAccuracy"
                  type="checkbox"
                  checked={values.confirmAccuracy}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.confirmAccuracy)}
                  aria-describedby={errors.confirmAccuracy ? 'confirmAccuracy-error' : undefined}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary"
                />
                <span className="text-sm text-gray-700">
                  I confirm that the information and details provided in this complaint are accurate to
                  the best of my knowledge.
                </span>
              </label>
              {errors.confirmAccuracy && (
                <p id="confirmAccuracy-error" role="alert" className="mt-2 ml-7 text-xs text-red-600">
                  <span aria-hidden="true">&#9888;</span> {errors.confirmAccuracy}
                </p>
              )}
              <p className="mt-3 ml-7 text-xs text-gray-500">
                🔒 Privacy note: the details you submit will only be shared with the relevant municipal
                authority to resolve this complaint.
              </p>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 rounded-2xl border border-primary/15 bg-white px-6 py-5 shadow-sm shadow-primary/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 sm:max-w-sm">
              Your report will be reviewed by the municipal sanitation team — you can track its status
              under <span className="font-medium text-primary-dark">My Complaints</span>.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-primary/30 bg-white px-6 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light"
              >
                Cancel
              </button>
              <div className="sm:w-52">
                <SubmitButton isSubmitting={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </SubmitButton>
              </div>
            </div>
          </div>
        </form>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-primary-ink px-4 py-3 text-sm font-medium text-white shadow-lg sm:right-6 sm:bottom-6"
        >
          <span aria-hidden="true">{toast.includes('fix') ? '⚠️' : '✅'}</span>
          {toast}
        </div>
      )}
    </div>
  )
}

export default ReportGarbagePage
