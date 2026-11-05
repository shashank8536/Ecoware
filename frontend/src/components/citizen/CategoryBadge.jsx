import { categoryStyles } from '../../utils/categoryStyles'

function CategoryBadge({ category, className = '' }) {
  const styles = categoryStyles[category] || categoryStyles['No Collection']
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${styles.chip} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      {category}
    </span>
  )
}

export default CategoryBadge
