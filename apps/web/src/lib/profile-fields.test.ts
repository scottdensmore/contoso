import { describe, it, expect } from 'vitest'
import { pickProfileFields, PROFILE_FIELDS } from './profile-fields'

describe('pickProfileFields', () => {
  it('keeps allowlisted profile fields', () => {
    expect(
      pickProfileFields({ name: 'Ada', city: 'London', phoneNumber: '123' }),
    ).toEqual({ name: 'Ada', city: 'London', phoneNumber: '123' })
  })

  it('drops password, so it cannot reach an update that does not hash', () => {
    expect(pickProfileFields({ name: 'Ada', password: 'plaintext' })).toEqual({
      name: 'Ada',
    })
  })

  it('drops columns the profile forms never send', () => {
    expect(
      pickProfileFields({ name: 'Ada', email: 'x@y.z', membership: 'gold', age: 30 }),
    ).toEqual({ name: 'Ada' })
  })

  it('keeps empty strings, which is how a field is cleared', () => {
    expect(pickProfileFields({ addressLine2: '' })).toEqual({ addressLine2: '' })
  })

  it('drops non-string values rather than forwarding them', () => {
    expect(
      pickProfileFields({ name: { toString: () => 'x' }, city: ['a'], state: 42, country: null }),
    ).toEqual({})
  })

  it('returns nothing for a non-object body', () => {
    for (const body of [null, undefined, 'string', 42, []]) {
      expect(pickProfileFields(body)).toEqual({})
    }
  })

  // The function reads a fixed field list rather than enumerating the caller's
  // keys, so injected prototype keys are never consulted. These pin that.
  it('ignores __proto__ injection and does not pollute Object.prototype', () => {
    const malicious = JSON.parse('{"name":"Ada","__proto__":{"password":"pwned"}}')
    expect(pickProfileFields(malicious)).toEqual({ name: 'Ada' })
    expect(({} as Record<string, unknown>).password).toBeUndefined()
  })

  it('ignores constructor.prototype injection', () => {
    const malicious = JSON.parse('{"constructor":{"prototype":{"password":"pwned"}}}')
    expect(pickProfileFields(malicious)).toEqual({})
    expect(({} as Record<string, unknown>).password).toBeUndefined()
  })

  it('does not match on differently cased keys', () => {
    expect(pickProfileFields({ Password: 'x', NAME: 'y', City: 'z' })).toEqual({})
  })

  it('never allowlists a credential field', () => {
    // Guards the allowlist itself: re-adding password here would otherwise
    // reopen the plaintext-write path without any test failing.
    for (const forbidden of ['password', 'email', 'id']) {
      expect(PROFILE_FIELDS).not.toContain(forbidden)
    }
  })
})
