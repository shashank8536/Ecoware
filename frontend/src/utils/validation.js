export const validators = {
  complaintTitle: (value) => {
    const v = value.trim()
    if (!v) return 'Complaint title is required'
    if (v.length < 5) return 'Give a short meaningful title (min. 5 characters)'
    return ''
  },

  category: (value) => {
    if (!value) return 'Please select a waste category'
    return ''
  },

  feedbackSubject: (value) => {
    const v = value.trim()
    if (!v) return 'Subject is required'
    if (v.length < 5) return 'Give a short meaningful subject (min. 5 characters)'
    return ''
  },

  description: (value) => {
    const v = value.trim()
    if (!v) return 'Description is required'
    if (v.length < 20) return 'Add a few more details (min. 20 characters)'
    return ''
  },

  area: (value) => {
    const v = value.trim()
    if (!v) return 'Area / locality is required'
    if (v.length < 3) return 'Enter a valid area name'
    return ''
  },

  ward: (value) => {
    if (!value) return 'Please select your ward number'
    return ''
  },

  address: (value) => {
    const v = value.trim()
    if (!v) return 'Complete address is required'
    if (v.length < 10) return 'Enter the full address of the issue'
    return ''
  },

  confirmAccuracy: (checked) => {
    if (!checked) return 'Please confirm the information is accurate before submitting'
    return ''
  },

  pinCode: (value) => {
    const v = value.trim()
    if (!v) return 'PIN code is required'
    if (!/^\d{6}$/.test(v)) return 'Enter a valid 6-digit PIN code'
    return ''
  },

  streetAddress: (value) => {
    const v = value.trim()
    if (!v) return 'House / street address is required'
    if (v.length < 5) return 'Enter the complete address'
    return ''
  },

  place: (value) => {
    const v = value.trim()
    if (!v) return 'This field is required'
    if (v.length < 2) return 'Enter a valid value'
    return ''
  },

  name: (value) => {
    const v = value.trim()
    if (!v) return 'Name is required'
    if (v.length < 2) return 'Name must be at least 2 characters'
    if (!/^[a-zA-Z][a-zA-Z\s.]*$/.test(v)) return "Name can't contain numbers or special characters"
    return ''
  },

  email: (value) => {
    const v = value.trim()
    if (!v) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)) return 'Enter a valid email address'
    return ''
  },

  phone: (value) => {
    const v = value.trim()
    if (!v) return 'Phone number is required'
    const digits = v.replace(/[^\d]/g, '')
    if (!/^\+?\d{7,15}$/.test(v.replace(/[\s-]/g, ''))) return 'Enter a valid phone number'
    if (digits.length < 10) return 'Phone number must be at least 10 digits'
    return ''
  },

  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/[a-zA-Z]/.test(value)) return 'Password must contain a letter'
    if (!/\d/.test(value)) return 'Password must contain a number'
    return ''
  },

  confirmPassword: (value, password) => {
    if (!value) return 'Please confirm your password'
    if (value !== password) return "Passwords don't match"
    return ''
  },
}
