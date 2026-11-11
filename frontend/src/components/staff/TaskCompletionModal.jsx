import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CheckCircle2, RefreshCw, Trash2, X } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_MB = 5

function TaskCompletionModal({ task, isOpen, onClose, onComplete }) {
  const [remarks, setRemarks] = useState('')
  const [image, setImage] = useState(null) // { file, previewUrl, name, dataUrl }
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const closeButtonRef = useRef(null)

  const handleClose = useCallback(() => {
    setRemarks('')
    setImage(null)
    setError('')
    setIsSubmitting(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  if (!isOpen || !task) return null

  const handleFileSelect = (files) => {
    setError('')
    const file = files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file format. Please upload a JPEG, PNG, or WEBP image.')
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImage({
        file,
        name: file.name,
        previewUrl: e.target.result,
        dataUrl: e.target.result,
      })
    }
    reader.onerror = () => {
      setError('Could not process the selected image. Please try another file.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImage(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation: Require proof photo
    if (!image) {
      setError('A proof photo is required before completing this task.')
      return
    }

    setIsSubmitting(true)

    // Simulate completion submission
    setTimeout(() => {
      onComplete({
        taskId: task.id,
        remarks: remarks.trim(),
        proofPhoto: image.dataUrl,
        proofPhotoName: image.name,
        completedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      })
      setIsSubmitting(false)
      onClose()
    }, 350)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close completion modal"
        className="absolute inset-0 bg-gray-900/40"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Complete Collection Task
            </span>
            <h2 id="completion-title" className="mt-2 text-xl font-bold text-primary-ink">
              {task.id} – {task.name}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Location: <span className="font-medium text-gray-700">{task.location}</span> · Waste:{' '}
              <span className="font-medium text-gray-700">{task.wasteType}</span>
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Proof Photo Upload Section (Required) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold tracking-wider text-gray-700 uppercase">
                Proof Photo <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-gray-500">
                {image ? '1 photo selected' : 'Required'}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={(e) => {
                handleFileSelect(e.target.files)
                e.target.value = ''
              }}
              className="sr-only"
              aria-label="Upload collection proof photo"
            />

            {!image ? (
              <div
                onClick={handleTriggerFileInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleTriggerFileInput()
                  }
                }}
                role="button"
                tabIndex={0}
                className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary-light/20 p-5 text-center transition-colors hover:border-primary hover:bg-primary-light/35"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-primary/20">
                  <Camera className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <span className="mt-2 text-xs font-semibold text-primary-ink">
                  Click to select proof photo from your device
                </span>
                <span className="mt-0.5 text-[11px] text-gray-500">Supported: JPG, PNG, WEBP (Max 5MB)</span>
              </div>
            ) : (
              <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-black">
                  <img
                    src={image.previewUrl}
                    alt="Collection proof preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[200px] font-medium text-gray-700">{image.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerFileInput}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 font-semibold text-primary hover:bg-primary-light/50"
                    >
                      <RefreshCw className="h-3 w-3" aria-hidden="true" />
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Completion Remarks Field */}
          <div>
            <label
              htmlFor="completion-remarks"
              className="block text-xs font-semibold tracking-wider text-gray-700 uppercase"
            >
              Completion Remarks / Notes
            </label>
            <textarea
              id="completion-remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared 2 overflowing bins, swept loose litter around the depot, and secured bin lids."
              className="mt-1.5 block w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Saving...' : 'Confirm & Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskCompletionModal