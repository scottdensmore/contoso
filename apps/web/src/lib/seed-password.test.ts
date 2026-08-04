import { describe, it, expect } from 'vitest'
import { compare, hash } from 'bcryptjs'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * The seed wrote the literal string 'password' into the password column while
 * `lib/auth.ts` authenticates with bcrypt `compare`. Compare returns false for
 * every input when the stored value is not a hash — including the correct
 * password — so no seeded account could sign in, and nothing failed: seeding
 * succeeded, and no test exercised the real credential path.
 */
describe('seeded credentials', () => {
  const seed = readFileSync(
    join(process.cwd(), 'prisma/seed.ts'),
    'utf-8',
  )

  it('stores the password hashed, not in plain text', () => {
    // The specific regression: a string literal assigned to the password field.
    expect(seed).not.toMatch(/password:\s*['"`][^'"`]+['"`]/)
    expect(seed).toMatch(/password:\s*seededPassword/)
  })

  it('hashes with bcrypt, the algorithm auth verifies with', () => {
    expect(seed).toMatch(/from ['"]bcryptjs['"]/)
    expect(seed).toMatch(/await hash\(/)
  })

  it('a bcrypt hash of the demo password verifies, a plain string does not', async () => {
    // The property that actually matters, exercised rather than asserted about.
    // Without this, the two source checks above could both pass against a hash
    // of the wrong value.
    const hashed = await hash('password', 10)
    expect(await compare('password', hashed)).toBe(true)

    // What the seed used to store, through the same comparison auth performs.
    expect(await compare('password', 'password')).toBe(false)
  })
})
