import { useId, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  User,
  X,
} from 'lucide-react'
import SelectField from '../../components/forms/SelectField'
import { GENDER_OPTIONS, initialStaffProfile } from '../../data/staffProfileData'
import { validators } from '../../utils/validation'

const STORAGE_KEY = 'ecoware_staff_profile_v1'
const MAX_AVATAR_SIZE_MB = 2

const loadProfile = () => {
  if (typeof window === 'undefined') return initialStaffProfile
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...initialStaffProfile, ...parsed }
    }
  } catch (err) {
    console.warn('Failed to parse staff profile from localStorage', err)
  }
  return initialStaffProfile
}

function StaffProfilePage() {
  const [profile, setProfile] = useState(loadProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordDraft, setPasswordDraft] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [passwordErrors, setPasswordErrors] = useState({})

  // Feedback toast
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  // Derived initials
  const initials = useMemo(() => {
    if (!profile.fullName) return 'ST'
    return profile.fullName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [profile.fullName])

  // Profile Photo Upload & Remove
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Profile photo must be a JPG, PNG, or WEBP file.', 'error')
      return
    }

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      showToast(`Profile photo must be smaller than ${MAX_AVATAR_SIZE_MB}MB.`, 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64Data = reader.result
      const updated = { ...profile, avatar: base64Data }
      setProfile(updated)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn('Failed to save avatar to localStorage', err)
      }
      showToast('Profile photo updated successfully!')
    }
    reader.onerror = () => {
      showToast('Error reading image file.', 'error')
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    const updated = { ...profile, avatar: '' }
    setProfile(updated)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.warn('Failed to remove avatar from localStorage', err)
    }
    showToast('Profile photo removed. Initial avatar restored.')
  }

  // Edit Mode
  const startEditing = () => {
    setFormErrors({})
    setDraft({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      dob: profile.dob,
      gender: profile.gender,
      houseStreet: profile.houseStreet,
      city: profile.city,
      state: profile.state,
      pinCode: profile.pinCode,
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraft(null)
    setFormErrors({})
    setIsEditing(false)
  }

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateDraft = () => {
    const errors = {}

    // Name
    const nameErr = validators.name(draft.fullName || '')
    if (nameErr) errors.fullName = nameErr

    // Email
    const emailErr = validators.email(draft.email || '')
    if (emailErr) errors.email = emailErr

    // Phone
    const phoneErr = validators.phone(draft.phone || '')
    if (phoneErr) errors.phone = phoneErr

    // DOB
    if (!draft.dob) {
      errors.dob = 'Date of birth is required'
    }

    // Address
    if (!draft.houseStreet?.trim()) {
      errors.houseStreet = 'House / street address is required'
    }
    if (!draft.city?.trim()) {
      errors.city = 'City is required'
    }
    if (!draft.state?.trim()) {
      errors.state = 'State is required'
    }
    const pinErr = validators.pinCode(draft.pinCode || '')
    if (pinErr) errors.pinCode = pinErr

    return errors
  }

  const saveProfile = () => {
    const errors = validateDraft()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      showToast('Please fix the errors before saving.', 'error')
      return
    }

    const todayDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const updated = {
      ...profile,
      ...draft,
      lastUpdated: todayDate,
    }

    setProfile(updated)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.warn('Failed to save profile to localStorage', err)
    }

    setIsEditing(false)
    setDraft(null)
    showToast('Personal information updated and saved successfully!')
  }

  // Password Handling
  const handlePasswordChange = (e) => {
    e.preventDefault()
    const errors = {}

    if (!passwordDraft.current) {
      errors.current = 'Current password is required'
    }

    const nextErr = validators.password(passwordDraft.next || '')
    if (nextErr) {
      errors.next = nextErr
    } else if (passwordDraft.next.length < 8) {
      errors.next = 'Password must be at least 8 characters'
    }

    if (!passwordDraft.confirm) {
      errors.confirm = 'Please confirm your new password'
    } else if (passwordDraft.next !== passwordDraft.confirm) {
      errors.confirm = 'New passwords do not match'
    }

    setPasswordErrors(errors)

    if (Object.keys(errors).length > 0) {
      showToast('Please resolve the password errors.', 'error')
      return
    }

    // Success prototype simulation
    setPasswordDraft({ current: '', next: '', confirm: '' })
    setIsChangingPassword(false)
    showToast('Prototype Demo: Password verified and updated for this session.')
  }

  const fullNameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const dobId = useId()
  const streetId = useId()
  const cityId = useId()
  const stateId = useId()
  const pinCodeId = useId()

  const currentPwId = useId()
  const nextPwId = useId()
  const confirmPwId = useId()

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      {/* Toast Alert */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-primary-ink'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-200" aria-hidden="true" />
          ) : (
            <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Profile Header / Hero Card */}
      <header className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar container */}
            <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  className="h-full w-full rounded-2xl border-2 border-primary/20 object-cover shadow-sm"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-3xl font-bold text-white shadow-sm"
                  aria-label={`Initials ${initials}`}
                >
                  {initials}
                </div>
              )}

              {/* Upload trigger overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md transition-transform hover:scale-110 hover:bg-primary-dark"
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-0.5 text-xs font-bold text-primary-dark">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {profile.status}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                  ID: {profile.staffId}
                </span>
                <span className="rounded-full border border-primary/20 bg-primary-light/40 px-2.5 py-0.5 text-xs font-medium text-primary-ink">
                  {profile.ward}
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold text-primary-ink sm:text-3xl">
                {profile.fullName}
              </h1>
              <p className="mt-0.5 text-sm font-medium text-gray-600 sm:text-base">
                {profile.designation} · {profile.department}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {profile.email}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {profile.avatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-red-600"
                title="Remove custom photo"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove Photo
              </button>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid: Personal Info + Work Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Personal Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* 2. Personal Information Card */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                  <User className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-primary-ink">Personal Information</h2>
                  <p className="text-xs text-gray-500">
                    Contact details and personal identification records.
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline"
                >
                  Edit Information
                </button>
              )}
            </div>

            {isEditing && draft ? (
              /* Editable Form */
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={fullNameId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      Full Name *
                    </label>
                    <input
                      id={fullNameId}
                      type="text"
                      value={draft.fullName}
                      onChange={(e) => handleDraftChange('fullName', e.target.value)}
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                        formErrors.fullName
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={emailId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      Email Address *
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      value={draft.email}
                      onChange={(e) => handleDraftChange('email', e.target.value)}
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                        formErrors.email
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="name@ecoware.gov.in"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={phoneId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      Phone Number *
                    </label>
                    <input
                      id={phoneId}
                      type="tel"
                      value={draft.phone}
                      onChange={(e) => handleDraftChange('phone', e.target.value)}
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                        formErrors.phone
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={dobId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      Date of Birth *
                    </label>
                    <input
                      id={dobId}
                      type="date"
                      value={draft.dob}
                      onChange={(e) => handleDraftChange('dob', e.target.value)}
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                        formErrors.dob
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                    {formErrors.dob && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.dob}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={draft.gender}
                    onChange={(e) => handleDraftChange('gender', e.target.value)}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                  />

                  <div>
                    <label
                      htmlFor={pinCodeId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      PIN Code *
                    </label>
                    <input
                      id={pinCodeId}
                      type="text"
                      maxLength={6}
                      value={draft.pinCode}
                      onChange={(e) => handleDraftChange('pinCode', e.target.value)}
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                        formErrors.pinCode
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="6-digit PIN code"
                    />
                    {formErrors.pinCode && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.pinCode}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label
                      htmlFor={streetId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      House / Street Address *
                    </label>
                    <input
                      id={streetId}
                      type="text"
                      value={draft.houseStreet}
                      onChange={(e) => handleDraftChange('houseStreet', e.target.value)}
                      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                        formErrors.houseStreet
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="House/Quarter number, street or area"
                    />
                    {formErrors.houseStreet && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.houseStreet}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={cityId}
                        className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                      >
                        City *
                      </label>
                      <input
                        id={cityId}
                        type="text"
                        value={draft.city}
                        onChange={(e) => handleDraftChange('city', e.target.value)}
                        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                          formErrors.city
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                        }`}
                        placeholder="City"
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={stateId}
                        className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                      >
                        State *
                      </label>
                      <input
                        id={stateId}
                        type="text"
                        value={draft.state}
                        onChange={(e) => handleDraftChange('state', e.target.value)}
                        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                          formErrors.state
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                        }`}
                        placeholder="State"
                      />
                      {formErrors.state && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.state}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
                  <dt className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">{profile.fullName}</dd>
                </div>

                <div className="rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
                  <dt className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Email Address
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{profile.email}</dd>
                </div>

                <div className="rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
                  <dt className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Phone Number
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{profile.phone}</dd>
                </div>

                <div className="rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
                  <dt className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Date of Birth
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{profile.dob}</dd>
                </div>

                <div className="rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
                  <dt className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Gender
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{profile.gender}</dd>
                </div>

                <div className="rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
                  <dt className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    PIN Code
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{profile.pinCode}</dd>
                </div>

                <div className="sm:col-span-2 rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
                  <dt className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Residential Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-800">
                    {profile.houseStreet}, {profile.city}, {profile.state} – {profile.pinCode}
                  </dd>
                </div>
              </dl>
            )}
          </section>

          {/* 6. Change Password (Frontend Prototype) */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-primary-ink">Account Security</h2>
                  <p className="text-xs text-gray-500">
                    Manage password authentication and security credentials.
                  </p>
                </div>
              </div>

              {!isChangingPassword ? (
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="rounded-lg border border-primary/30 px-3.5 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary-light transition-colors"
                >
                  Change Password
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordDraft({ current: '', next: '', confirm: '' })
                    setPasswordErrors({})
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-800 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Prototype Notice:</strong> Password updates are simulated for frontend testing and are not transmitted to a live authentication server.
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Current Password */}
                  <div>
                    <label
                      htmlFor={currentPwId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        id={currentPwId}
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordDraft.current}
                        onChange={(e) =>
                          setPasswordDraft((prev) => ({ ...prev, current: e.target.value }))
                        }
                        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                          passwordErrors.current
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.current && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.current}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor={nextPwId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        id={nextPwId}
                        type={showPassword.next ? 'text' : 'password'}
                        value={passwordDraft.next}
                        onChange={(e) =>
                          setPasswordDraft((prev) => ({ ...prev, next: e.target.value }))
                        }
                        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                          passwordErrors.next
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                        }`}
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => ({ ...prev, next: !prev.next }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.next && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.next}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor={confirmPwId}
                      className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-700 uppercase"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id={confirmPwId}
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordDraft.confirm}
                        onChange={(e) =>
                          setPasswordDraft((prev) => ({ ...prev, confirm: e.target.value }))
                        }
                        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:ring-2 ${
                          passwordErrors.confirm
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                        }`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirm && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.confirm}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordDraft({ current: '', next: '', confirm: '' })
                      setPasswordErrors({})
                    }}
                    className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gray-50/70 p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-primary-dark">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Password is secure</p>
                    <p className="text-xs text-gray-500">
                      Last updated 60 days ago · Municipal password policy active
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary-light transition-colors self-start sm:self-auto"
                >
                  Change Password
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column (1 Col): Work Information & Account Stats */}
        <div className="space-y-6">
          {/* 3. Work Information (Read-only) */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-primary-ink">Work Information</h2>
                <p className="text-xs text-gray-500">Municipal employment assignment details.</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-amber-50/80 p-2.5 text-xs text-amber-900 border border-amber-200/60 flex items-start gap-1.5">
              <Lock className="h-3.5 w-3.5 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
              <span>
                Work assignments are officially administered by the Ward Sanitation Office and are read-only.
              </span>
            </div>

            <dl className="mt-4 space-y-3 divide-y divide-gray-100 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Employee ID</dt>
                <dd className="font-bold text-primary-ink">{profile.staffId}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Designation</dt>
                <dd className="font-semibold text-gray-900">{profile.designation}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Department</dt>
                <dd className="font-semibold text-gray-900 text-right">{profile.department}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Assigned Ward</dt>
                <dd className="font-bold text-primary-dark">{profile.ward}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Joining Date</dt>
                <dd className="font-semibold text-gray-800">{profile.joiningDate}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Employment Status</dt>
                <dd className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {profile.employmentStatus}
                </dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Shift Timings</dt>
                <dd className="font-semibold text-gray-800 text-right">{profile.shiftTimings}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Assigned Vehicle</dt>
                <dd className="font-semibold text-gray-800 text-right">{profile.assignedVehicle}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Depot Base</dt>
                <dd className="font-semibold text-gray-800 text-right">{profile.depotBase}</dd>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <dt className="font-medium text-gray-500">Field Supervisor</dt>
                <dd className="font-semibold text-gray-800 text-right">{profile.supervisor}</dd>
              </div>
            </dl>
          </section>

          {/* 7. Account Information Card */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-primary-ink">Account Information</h2>
                <p className="text-xs text-gray-500">System registration and activity audit.</p>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Account Created</dt>
                <dd className="font-semibold text-gray-800">{profile.accountCreated}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Last Profile Update</dt>
                <dd className="font-semibold text-primary">{profile.lastUpdated}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Role Authority</dt>
                <dd className="font-semibold text-gray-800">Field Staff L2</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Portal Access</dt>
                <dd className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Staff Portal Active
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}

export default StaffProfilePage
