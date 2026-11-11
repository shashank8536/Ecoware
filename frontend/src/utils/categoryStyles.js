export const categoryStyles = {
  'Household Waste': {
    dot: 'bg-primary',
    chip: 'bg-primary-light text-primary-dark ring-1 ring-primary/20',
  },
  'Dry / Plastic Waste': {
    dot: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-800 ring-1 ring-blue-500/20',
  },
  'Wet Waste': {
    dot: 'bg-teal-500',
    chip: 'bg-teal-100 text-teal-800 ring-1 ring-teal-500/20',
  },
  'Construction Waste': {
    dot: 'bg-orange-500',
    chip: 'bg-orange-100 text-orange-800 ring-1 ring-orange-500/20',
  },
  'No Collection': {
    dot: 'bg-gray-300',
    chip: 'bg-gray-100 text-gray-600 ring-1 ring-gray-400/20',
  },
}

const onDarkDotColors = {
  'Household Waste': 'bg-emerald-300',
  'Dry / Plastic Waste': 'bg-blue-300',
  'Wet Waste': 'bg-teal-300',
  'Construction Waste': 'bg-orange-300',
}

export const getDotColor = (category, { onDark = false } = {}) =>
  (onDark ? onDarkDotColors : categoryStyles)[category]?.dot ||
  (onDark ? 'bg-gray-300' : categoryStyles['No Collection'].dot)
