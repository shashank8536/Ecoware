import { useState } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_IMAGES = 5
const MAX_FILE_SIZE_MB = 5

function ImageUploader({ images, onAdd, onRemove, error }) {
  const [isDragging, setIsDragging] = useState(false)

  const selectImages = (fileList) => {
    const files = Array.from(fileList || [])
    const accepted = []
    let rejectionNote = ''

    for (const file of files) {
      if (images.length + accepted.length >= MAX_IMAGES) {
        rejectionNote = `You can upload up to ${MAX_IMAGES} images`
        break
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        rejectionNote = `${file.name} is not a supported format`
        continue
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejectionNote = `${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit`
        continue
      }
      accepted.push(file)
    }

    onAdd(accepted, rejectionNote)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    selectImages(e.dataTransfer.files)
  }

  const getDropZoneClasses = () => {
    if (isDragging) return 'border-primary bg-primary-light ring-4 ring-primary/20'
    if (error) return 'border-red-400 bg-red-50/40'
    return 'border-primary/40 bg-primary-light/30 hover:border-primary hover:bg-primary-light/50'
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Evidence Photos</label>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            images.length >= MAX_IMAGES
              ? 'bg-red-100 text-red-700'
              : 'bg-primary-light text-primary-dark'
          }`}
        >
          {images.length}/{MAX_IMAGES} images
        </span>
      </div>

      {images.length < MAX_IMAGES && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${getDropZoneClasses()}`}
          >
            <input
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(',')}
              onChange={(e) => {
                selectImages(e.target.files)
                e.target.value = ''
              }}
              className="sr-only"
              aria-label="Upload complaint images"
            />
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-primary/10 transition-colors ${
                isDragging ? 'bg-primary text-white' : ''
              }`}
            >
              {isDragging ? '📥' : '📤'}
            </span>
            <span className="mt-3 text-sm font-semibold text-gray-800">
              {isDragging ? 'Drop your photos here' : 'Drag & drop photos here, or click to browse'}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              JPG, JPEG, PNG or WEBP · max {MAX_FILE_SIZE_MB}MB each · up to {MAX_IMAGES} photos
            </span>
          </label>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-600" role="alert">
          <span aria-hidden="true">&#9888;</span>
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.id}
              className="group relative overflow-hidden rounded-xl border border-primary/10 shadow-sm"
            >
              <img
                src={image.previewUrl}
                alt={`Complaint photo of ${image.name}`}
                className="h-32 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(image.id)}
                aria-label={`Remove ${image.name}`}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm text-red-600 shadow-sm backdrop-blur transition-colors hover:bg-white"
              >
                ✕
              </button>
              <p className="absolute right-0 bottom-0 left-0 truncate bg-gradient-to-t from-gray-900/75 to-transparent px-2 py-1 text-[11px] text-white">
                {image.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ImageUploader
