const fs = require('fs').promises
const path = require('path')
const convert = require('heic-convert')

const BONES_DIR = path.join(__dirname, '..', 'public', 'bones')

async function convertHeicToJpg() {
  const files = await fs.readdir(BONES_DIR)
  const heicFiles = files.filter((f) => f.toLowerCase().endsWith('.heic'))

  if (heicFiles.length === 0) {
    console.log('Nenhum arquivo HEIC encontrado em public/bones/')
    return
  }

  console.log(`Convertendo ${heicFiles.length} arquivo(s) HEIC para JPG...`)

  for (const file of heicFiles) {
    const inputPath = path.join(BONES_DIR, file)
    const baseName = file.replace(/\.heic$/i, '')
    const outputPath = path.join(BONES_DIR, `${baseName}.jpg`)

    try {
      const inputBuffer = await fs.readFile(inputPath)
      const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 0.9,
      })

      await fs.writeFile(outputPath, outputBuffer)
      console.log(`  ✓ ${file} → ${baseName}.jpg`)
    } catch (err) {
      console.error(`  ✗ Erro ao converter ${file}:`, err.message)
    }
  }

  console.log('Conversão concluída!')
}

convertHeicToJpg()
