import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import 'vitest'

// Vitest 5 no longer inherits jest.Matchers. Keep the existing DOM matcher
// implementation and expose its signatures through Vitest's public interface.
declare module 'vitest' {
  interface Matchers<R, T> extends TestingLibraryMatchers<T, R> {}
}
