import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Integration tests run Payload server-side against a local D1 (wrangler platform proxy).
    environment: 'node',
    testTimeout: 60_000,
    hookTimeout: 120_000,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // One local D1 database: test files take turns, or SQLite reports "database is locked".
    fileParallelism: false,
  },
})
