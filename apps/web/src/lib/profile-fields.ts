import type { UpdateUserInput } from '@/lib/user'

// Fields a user may set through the profile routes. Everything else in the
// request body is dropped.
//
// This is an allowlist rather than a denylist because `await request.json()`
// is `any` at runtime: the UpdateUserInput type constrains the call site, not
// the payload, so without this every column on User is client-writable.
//
// `password` is deliberately absent. updateUser does not hash, so a password
// arriving here would be stored in plaintext and bypass the dedicated route
// that does hash it.
export const PROFILE_FIELDS = [
  'name',
  'avatar',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'zipCode',
  'country',
  'phoneNumber',
] as const satisfies readonly (keyof UpdateUserInput)[]

export function pickProfileFields(body: unknown): UpdateUserInput {
  if (typeof body !== 'object' || body === null) return {}

  const source = body as Record<string, unknown>
  const picked: Record<string, unknown> = {}

  // Only strings are accepted, so clearing a field means sending an empty
  // string rather than null. A null would be dropped silently.
  for (const field of PROFILE_FIELDS) {
    const value = source[field]
    if (typeof value === 'string') picked[field] = value
  }

  return picked as UpdateUserInput
}
