import { useRef, useState } from 'react'
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Clock,
  KeyRound,
  Pencil,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import FormSection from '../../components/forms/FormSection'
import InputField from '../../components/forms/InputField'
import SelectField from '../../components/forms/SelectField'
import SubmitButton from '../../components/forms/SubmitButton'
import { citizenProfile } from '../../data/citizenMockData'
import { validators } from '../../utils/validation'

const MAX_AVATAR_SIZE_MB = 2
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']

const editButtonClasses =
  'flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light'
const cancelEditButtonClasses =
  'flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50'
const readOnlyValueClasses = 'text-sm text-gray-800'

function ProfilePage() {
  const [profile, setProfile] = useState(citizenProfile)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [personalDraft, setPersonalDraft] = useState(null)
  const [personalErrors, setPersonalErrors] = useState({})
  const [addressDraft, setAddressDraft] = useState(null)
  const [addressErrors, setAddressErrors] = useState({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordDraft, setPasswordDraft] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const avatarInputRef = useRef(null)

  const showToast = (message) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 5000)
  }

  const initials = profile.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Profile photo must be JPG, PNG or WEBP')
      return
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      showToast(`Profile photo must be under ${MAX_AVATAR_SIZE_MB}MB`)
      return
    }
    // Frontend-only mock: local preview via object URL, never uploaded.
    if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    setAvatarUrl(URL.createObjectURL(file))
    showToast('Profile photo updated (local preview only)')
  }

  const buildDraftHandler = (draft, setDraft, errors, setErrors) => {
    const handleChange = (e) => {
      const { name, value } = e.target
      setDraft({ ...draft, [name]: value })
      if (errors[name]) setErrors({ ...errors, [name]: '' })
    }
    const handleBlur = (e) => {
      const { name, value } = e.target
      const validator = validators[name]
      if (!validator) return
      const message = validator(value)
      setErrors({ ...errors, [name]: message })
    }
    return { handleChange, handleBlur }
  }

  const startPersonalEdit = () => {
    setPersonalErrors({})
    setPersonalDraft({ fullName: profile.fullName, mobile: profile.mobile, gender: profile.gender })
  }

  const personal = personalDraft
    ? buildDraftHandler(personalDraft, setPersonalDraft, personalErrors, setPersonalErrors)
    : null

  const savePersonal = () => {
    const newErrors = {
      fullName: validators.name(personalDraft.fullName),
      mobile: validators.phone(personalDraft.mobile),
      gender: '',
    }
    setPersonalErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) {
      showToast('Please fix the highlighted fields before saving')
      return
    }
    // TODO: replace with real profile update API in a later milestone
    console.log('Profile updated (mock):', personalDraft)
    setProfile((prev) => ({ ...prev, ...personalDraft }))
    setPersonalDraft(null)
    showToast('Personal information saved successfully')
  }

  const startAddressEdit = () => {
    setAddressErrors({})
    setAddressDraft({
      houseStreet: profile.houseStreet,
      locality: profile.locality,
      city: profile.city,
      state: profile.state,
      pinCode: profile.pinCode,
    })
  }

  const address = addressDraft
    ? buildDraftHandler(addressDraft, setAddressDraft, addressErrors, setAddressErrors)
    : null

  const saveAddress = () => {
    const newErrors = {
      houseStreet: validators.streetAddress(addressDraft.houseStreet),
      locality: validators.place(addressDraft.locality),
      city: validators.place(addressDraft.city),
      state: validators.place(addressDraft.state),
      pinCode: validators.pinCode(addressDraft.pinCode),
    }
    setAddressErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) {
      showToast('Please fix the highlighted fields before saving')
      return
    }
    // TODO: replace with real address update API in a later milestone
    console.log('Address updated (mock):', addressDraft)
    setProfile((prev) => ({ ...prev, ...addressDraft }))
    setAddressDraft(null)
    showToast('Address information saved successfully')
  }

  const passwordFieldMeta = {
    current: { label: 'Current Password', autoComplete: 'current-password', placeholder: 'Enter your current password' },
    next: { label: 'New Password', autoComplete: 'new-password', placeholder: 'Min. 8 characters with a number' },
    confirm: { label: 'Confirm New Password', autoComplete: 'new-password', placeholder: 'Re-enter your new password' },
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordDraft((prev) => ({ ...prev, [name]: value }))
    if (passwordErrors[name]) setPasswordErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handlePasswordBlur = (e) => {
    const { name, value } = e.target
    let message = ''
    if (name === 'current') message = value ? '' : 'Enter your current password'
    if (name === 'next') message = validators.password(value)
    if (name === 'confirm') message = validators.confirmPassword(value, passwordDraft.next)
    setPasswordErrors((prev) => ({ ...prev, [name]: message }))
  }

  const updatePassword = () => {
    const newErrors = {
      current: passwordDraft.current ? '' : 'Enter your current password',
      next: validators.password(passwordDraft.next),
      confirm: validators.confirmPassword(passwordDraft.confirm, passwordDraft.next),
    }
    setPasswordErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) {
      showToast('Please fix the highlighted password fields')
      return
    }
    // TODO: replace with real password update API in a later milestone.
    // The draft is cleared immediately and never kept in frontend state.
    console.log('Password update requested (mock — nothing stored)')
    setPasswordDraft({ current: '', next: '', confirm: '' })
    setPasswordErrors({})
    setIsChangingPassword(false)
    showToast('Password updated successfully (demo)')
  }

  const cancelPasswordChange = () => {
    setPasswordDraft({ current: '', next: '', confirm: '' })
    setPasswordErrors({})
    setIsChangingPassword(false)
  }

  const accountDetails = [
    { label: 'Citizen ID', value: profile.citizenId },
    { label: 'Account Created', value: new Date(profile.registeredOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Last Login', value: profile.lastLogin },
    { label: 'Email Verification', value: 'Verified' },
    { label: 'Account Type', value: 'Citizen' },
  ]

  return (
    <div className="min-h-full bg-primary-light/30">
      <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <section className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm shadow-primary/5 sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-primary-light ring-4 ring-primary/15">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`${profile.fullName} profile`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary-dark">{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors hover:bg-primary-dark"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="sr-only"
                aria-label="Upload profile photo"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-primary-ink sm:text-3xl">{profile.fullName}</h1>
              <p className="mt-1 truncate text-sm text-gray-600">{profile.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-lg bg-primary-light/70 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-primary-dark">
                  {profile.citizenId}
                </span>
                {profile.emailVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark ring-1 ring-primary/20">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Email Verified
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={startPersonalEdit}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark sm:ml-auto"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit Profile
            </button>
          </div>
        </section>

        <FormSection
          icon={<User className="h-5 w-5" aria-hidden="true" />}
          title="Personal Information"
          description="Your identity details used across the citizen portal"
          action={
            personalDraft ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setPersonalDraft(null)} className={cancelEditButtonClasses}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Cancel
                </button>
                <button type="button" onClick={savePersonal} className={editButtonClasses}>
                  <Save className="h-3.5 w-3.5" aria-hidden="true" /> Save
                </button>
              </div>
            ) : (
              <button type="button" onClick={startPersonalEdit} className={editButtonClasses}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
              </button>
            )
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Full Name</p>
              {personalDraft ? (
                <div className="mt-1.5">
                  <InputField
                    label=""
                    name="fullName"
                    type="text"
                    value={personalDraft.fullName}
                    onChange={personal.handleChange}
                    onBlur={personal.handleBlur}
                    error={personalErrors.fullName}
                    autoComplete="name"
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.fullName}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Email Address</p>
              <p className="mt-1 flex items-center gap-2">
                <span className={readOnlyValueClasses}>{profile.email}</span>
                {profile.emailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-dark uppercase">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Verified
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Verification managed by the municipality — not editable here.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Mobile Number</p>
              {personalDraft ? (
                <div className="mt-1.5">
                  <InputField
                    label=""
                    name="mobile"
                    type="tel"
                    value={personalDraft.mobile}
                    onChange={personal.handleChange}
                    onBlur={personal.handleBlur}
                    error={personalErrors.mobile}
                    placeholder="98765 43210"
                    autoComplete="tel"
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.mobile}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Gender <span className="text-gray-400">(optional)</span></p>
              {personalDraft ? (
                <div className="mt-1.5">
                  <SelectField
                    label=""
                    name="gender"
                    value={personalDraft.gender || ''}
                    onChange={
                      (e) => setPersonalDraft({ ...personalDraft, gender: e.target.value })
                    }
                    placeholder="Select gender"
                    options={genderOptions}
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.gender || 'Not specified'}</p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          title="Address Information"
          description="Where your collection and complaint services apply"
          action={
            addressDraft ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddressDraft(null)} className={cancelEditButtonClasses}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Cancel
                </button>
                <button type="button" onClick={saveAddress} className={editButtonClasses}>
                  <Save className="h-3.5 w-3.5" aria-hidden="true" /> Save
                </button>
              </div>
            ) : (
              <button type="button" onClick={startAddressEdit} className={editButtonClasses}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
              </button>
            )
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-700">House / Street Address</p>
              {addressDraft ? (
                <div className="mt-1.5">
                  <InputField
                    label=""
                    name="houseStreet"
                    type="text"
                    value={addressDraft.houseStreet}
                    onChange={address.handleChange}
                    onBlur={address.handleBlur}
                    error={addressErrors.houseStreet}
                    autoComplete="street-address"
                    placeholder="House / flat no., street name"
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.houseStreet}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Locality / Area</p>
              {addressDraft ? (
                <div className="mt-1.5">
                  <InputField
                    label=""
                    name="locality"
                    type="text"
                    value={addressDraft.locality}
                    onChange={address.handleChange}
                    onBlur={address.handleBlur}
                    error={addressErrors.locality}
                    placeholder="e.g. Lotus Avenue"
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.locality}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">PIN Code</p>
              {addressDraft ? (
                <div className="mt-1.5">
                  <InputField
                    label=""
                    name="pinCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={addressDraft.pinCode}
                    onChange={address.handleChange}
                    onBlur={address.handleBlur}
                    error={addressErrors.pinCode}
                    placeholder="6-digit PIN"
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.pinCode}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">City</p>
              {addressDraft ? (
                <div className="mt-1.5">
                  <InputField
                    label=""
                    name="city"
                    type="text"
                    value={addressDraft.city}
                    onChange={address.handleChange}
                    onBlur={address.handleBlur}
                    error={addressErrors.city}
                    placeholder="City name"
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.city}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">State</p>
              {addressDraft ? (
                <div className="mt-1.5">
                  <InputField
                    label=""
                    name="state"
                    type="text"
                    value={addressDraft.state}
                    onChange={address.handleChange}
                    onBlur={address.handleBlur}
                    error={addressErrors.state}
                    placeholder="State name"
                  />
                </div>
              ) : (
                <p className={`mt-1 ${readOnlyValueClasses}`}>{profile.state}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-700">Ward Number</p>
              <p className="mt-1 flex items-center gap-3">
                <span className={`inline-flex rounded-lg bg-primary-light/60 px-3 py-1.5 text-sm font-semibold text-primary-dark ${readOnlyValueClasses}`}>
                  {profile.ward}
                </span>
                <span className="text-xs text-gray-400">Assigned by the municipality — read-only for citizens.</span>
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
          title="Account Security"
          description="Keep your account protected with a strong password"
          action={
            isChangingPassword ? (
              <button type="button" onClick={cancelPasswordChange} className={cancelEditButtonClasses}>
                <X className="h-3.5 w-3.5" aria-hidden="true" /> Cancel
              </button>
            ) : (
              <button type="button" onClick={() => setIsChangingPassword(true)} className={editButtonClasses}>
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" /> Change Password
              </button>
            )
          }
        >
          {isChangingPassword ? (
            <div className="space-y-5">
              <p className="rounded-xl border border-primary/15 bg-primary-light/40 p-4 text-xs text-gray-600">
                🔒 For your security, your existing password is never shown or stored in the browser.
                Use at least 8 characters including a letter and a number.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label={passwordFieldMeta.current.label}
                  name="current"
                  type="password"
                  value={passwordDraft.current}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  error={passwordErrors.current}
                  placeholder={passwordFieldMeta.current.placeholder}
                  autoComplete="current-password"
                />
                <InputField
                  label={passwordFieldMeta.next.label}
                  name="next"
                  type="password"
                  value={passwordDraft.next}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  error={passwordErrors.next}
                  placeholder={passwordFieldMeta.next.placeholder}
                  autoComplete="new-password"
                />
                <InputField
                  label={passwordFieldMeta.confirm.label}
                  name="confirm"
                  type="password"
                  value={passwordDraft.confirm}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  error={passwordErrors.confirm}
                  placeholder={passwordFieldMeta.confirm.placeholder}
                  autoComplete="new-password"
                />
              </div>
              <div className="sm:w-52">
                <SubmitButton isSubmitting={false} onClick={updatePassword}>
                  Update Password
                </SubmitButton>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Your password was configured when your citizen account was created. We recommend
              updating it regularly and never sharing it with anyone.
            </p>
          )}
        </FormSection>

        <FormSection
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          title="Account Information"
          description="Read-only details maintained by the municipal system"
        >
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accountDetails.map((detail) => (
              <div key={detail.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition-colors hover:bg-primary-light/40">
                <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{detail.label}</dt>
                <dd className="mt-1.5 text-sm font-semibold text-primary-ink">{detail.value}</dd>
              </div>
            ))}
          </dl>
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Session details refresh automatically when you log in to the portal.
          </p>
        </FormSection>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-primary-ink px-4 py-3 text-sm font-medium text-white shadow-lg sm:right-6 sm:bottom-6"
        >
          <span aria-hidden="true">{toast.includes('fix') || toast.includes('must') ? '⚠️' : '✅'}</span>
          {toast}
        </div>
      )}
    </div>
  )
}

export default ProfilePage
