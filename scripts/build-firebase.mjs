import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const result = spawnSync(process.execPath, [vite, 'build', '--base=/'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_API_BASE_URL: 'https://carsystem-demo.pages.dev',
  },
})

if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
