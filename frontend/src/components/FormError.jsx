export default function FormError({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  )
}
