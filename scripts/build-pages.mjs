import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const demoRoot = path.join(root, 'demo-dist')
const functionsRoot = path.join(root, 'functions')
const assets = {}

function addDirectory(directory, prefix = '') {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    const key = path.posix.join(prefix, entry.name)
    if (entry.isDirectory()) addDirectory(file, key)
    else assets[key] = fs.readFileSync(file).toString('base64')
  }
}

addDirectory(demoRoot)
assets['_seed.html'] = fs.readFileSync(path.join(root, 'server', 'demo-seed.html')).toString('base64')

const catalog = JSON.parse(fs.readFileSync(path.join(root, 'server', 'catalog.json'), 'utf8'))
fs.writeFileSync(
  path.join(functionsRoot, 'runtime-data.generated.js'),
  `export const catalog = ${JSON.stringify(catalog)}\n`,
)

fs.writeFileSync(
  path.join(functionsRoot, 'private-demo-assets.generated.js'),
  `export const privateDemoAssets = ${JSON.stringify(assets)}\n`,
)

fs.writeFileSync(
  path.join(root, 'dist', '_routes.json'),
  JSON.stringify({ version: 1, include: ['/api/*', '/demo', '/demo/*'], exclude: [] }, null, 2),
)

console.log(`Cloudflare Pages listo: ${Object.keys(assets).length} archivos privados preparados.`)
