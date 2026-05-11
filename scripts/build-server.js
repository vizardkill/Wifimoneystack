import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const writeOut = (message) => {
  process.stdout.write(`${message}\n`)
}

const writeErr = (message) => {
  process.stderr.write(`${message}\n`)
}

function resolveWithExtensions(basePath) {
  const extensions = ['.ts', '.js', '.tsx', '.jsx']

  // Si existe y es un archivo, retornarlo directamente
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath
  }

  // Intentar agregar extensiones al path
  for (const ext of extensions) {
    const pathWithExt = basePath + ext
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt
    }
  }

  // Si es un directorio, buscar index.ts/js dentro
  for (const ext of extensions) {
    const indexPath = path.join(basePath, 'index' + ext)
    if (fs.existsSync(indexPath)) {
      return indexPath
    }
  }

  return basePath
}

const aliasPlugin = {
  name: 'alias-resolver',
  setup(build) {
    build.onResolve({ filter: /^@server\// }, (args) => {
      const relativePath = args.path.replace('@server/', '')
      const basePath = path.resolve(__dirname, '..', 'server', relativePath)
      return {
        path: resolveWithExtensions(basePath)
      }
    })

    build.onResolve({ filter: /^@\// }, (args) => {
      const relativePath = args.path.replace('@/', '')
      const basePath = path.resolve(__dirname, '..', 'app', relativePath)
      return {
        path: resolveWithExtensions(basePath)
      }
    })

    build.onResolve({ filter: /^@lib\// }, (args) => {
      const relativePath = args.path.replace('@lib/', '')
      const basePath = path.resolve(__dirname, '..', 'app', 'lib', relativePath)
      return {
        path: resolveWithExtensions(basePath)
      }
    })

    build.onResolve({ filter: /^@types$/ }, () => {
      return {
        path: path.resolve(__dirname, '..', 'app', 'lib', 'types', 'index.ts')
      }
    })

    build.onResolve({ filter: /^@functions\// }, (args) => {
      const relativePath = args.path.replace('@functions/', '')
      const basePath = path.resolve(__dirname, '..', 'app', 'lib', 'functions', relativePath)
      return {
        path: resolveWithExtensions(basePath)
      }
    })
  }
}

const env = process.argv[2] || 'local'
const isProd = env === 'prod'
writeOut(`🏗️ Construyendo el servidor para el entorno: ${env}`)

const buildConfig = {
  entryPoints: ['./server/server.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'build/server',
  packages: 'external',
  plugins: [aliasPlugin],
  target: 'node18',
  minify: isProd,
  sourcemap: 'linked', // Siempre generar sourcemaps externos para debugging
  mainFields: ['module', 'main'],
  conditions: ['import'],
  resolveExtensions: ['.ts', '.js', '.tsx', '.jsx'],
  define: {
    'process.env.NODE_ENV': `"${isProd ? 'production' : 'development'}"`
  },
  external: ['@prisma/client', '@prisma/adapter-pg', '@prisma/client-runtime-utils', 'prisma', 'pg', '@remix-run/*', 'build/server/*', './build/server/*'],
  logLevel: 'info',
  ignoreAnnotations: true,
  treeShaking: isProd,
  metafile: true,
  drop: isProd ? ['console', 'debugger'] : [],
  legalComments: isProd ? 'none' : 'inline'
}

try {
  const startTime = Date.now()

  writeOut('\n📋 Configuración:')
  writeOut(`   Entry: ${buildConfig.entryPoints[0]}`)
  writeOut(`   Output: ${buildConfig.outdir}/`)
  writeOut(`   Minify: ${isProd ? 'Sí' : 'No'}`)
  writeOut('   Sourcemaps: Sí (externos)')
  writeOut(`   Tree Shaking: ${isProd ? 'Sí' : 'No'}`)
  writeOut(`   Drop console/debugger: ${isProd ? 'Sí' : 'No'}`)

  const result = await esbuild.build(buildConfig)
  const buildTime = Date.now() - startTime

  // Análisis del bundle
  if (result.metafile) {
    const outputs = Object.entries(result.metafile.outputs)
    const mainOutput = outputs.find(([f]) => f.endsWith('server.js'))

    // Listar todos los archivos procesados
    if (mainOutput) {
      const allInputs = Object.keys(mainOutput[1].inputs)
      const serverFiles = allInputs.filter((f) => f.startsWith('server/'))
      const appFiles = allInputs.filter((f) => f.startsWith('app/'))
      const buildFiles = allInputs.filter((f) => f.startsWith('build/'))

      writeOut('\n📂 Archivos procesados:')
      writeOut(`   📁 server/ (${serverFiles.length} archivos)`)
      serverFiles.forEach((f) => writeOut(`      └─ ${f}`))

      if (appFiles.length > 0) {
        writeOut(`   📁 app/ (${appFiles.length} archivos)`)
        appFiles.forEach((f) => writeOut(`      └─ ${f}`))
      }

      if (buildFiles.length > 0) {
        writeOut(`   📁 build/ (${buildFiles.length} archivos)`)
        buildFiles.forEach((f) => writeOut(`      └─ ${f}`))
      }
    }

    let totalSize = 0
    writeOut('\n📦 Output:')
    for (const [file, info] of outputs) {
      if (!file.endsWith('.map')) {
        totalSize += info.bytes
        writeOut(`   ${file}: ${(info.bytes / 1024).toFixed(2)} KB`)
      }
    }

    // Top módulos por tamaño
    if (mainOutput) {
      const inputs = Object.entries(mainOutput[1].inputs)
        .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput)
        .slice(0, 10)

      writeOut('\n🔍 Top 10 por tamaño:')
      for (const [mod, info] of inputs) {
        const kb = (info.bytesInOutput / 1024).toFixed(2)
        writeOut(`   ${kb.padStart(7)} KB ─ ${mod}`)
      }
    }

    writeOut(`\n📊 Total: ${(totalSize / 1024).toFixed(2)} KB | ⏱️ ${buildTime}ms`)
  }

  const sourceDataPath = path.resolve(__dirname, '..', 'server', 'api', 'geographic', 'infrastructure', 'data')
  const targetDataPath = path.resolve(__dirname, '..', 'build', 'server', 'api', 'geographic', 'infrastructure', 'data')

  if (fs.existsSync(sourceDataPath)) {
    fs.mkdirSync(targetDataPath, { recursive: true })

    const files = fs.readdirSync(sourceDataPath)
    files.forEach((file) => {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(sourceDataPath, file), path.join(targetDataPath, file))
      }
    })
  }
  writeOut('\n✅ Build completado')
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  writeErr(`❌ Error en la compilación del servidor: ${errorMessage}`)
  process.exit(1)
}
