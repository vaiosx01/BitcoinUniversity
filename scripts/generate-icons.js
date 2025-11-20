/**
 * Script para generar iconos PWA desde un logo base
 * Requiere: sharp (pnpm add -D sharp)
 * 
 * Uso: node scripts/generate-icons.js
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputFile = path.join(__dirname, '../public/logo.svg')
const outputDir = path.join(__dirname, '../public/icons')

// Crear directorio de iconos si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function generateIcons() {
  console.log('🎨 Generando iconos PWA...')
  
  for (const size of sizes) {
    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 10, g: 14, b: 39, alpha: 1 }, // bg-btcu-dark
        })
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
      
      console.log(`✅ Generado: icon-${size}x${size}.png`)
    } catch (error) {
      console.error(`❌ Error generando icon-${size}x${size}.png:`, error.message)
    }
  }
  
  console.log('✨ Iconos generados exitosamente!')
}

generateIcons().catch(console.error)

