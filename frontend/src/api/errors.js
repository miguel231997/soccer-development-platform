export function extractError(err, fallback = 'Something went wrong. Please try again.') {
  const body = err?.response?.data
  if (body?.data && typeof body.data === 'object') {
    const fieldErrors = Object.values(body.data).filter(Boolean)
    if (fieldErrors.length > 0) return fieldErrors[0]
  }
  return body?.message || fallback
}
