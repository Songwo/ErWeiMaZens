// Test script for QR generation
import { generateQRCode } from './src/lib/qrGenerators'

async function testQRGeneration() {
  const text = 'https://example.com'
  const svg = await generateQRCode(text, {
    width: 200,
    margin: 10,
    color: { dark: '#000000', light: '#ffffff' }
  })

  console.log('Generated QR SVG:')
  console.log(svg)

  // Save to a file for testing
  const fs = require('fs')
  fs.writeFileSync('test-qr.svg', svg)
  console.log('QR code saved as test-qr.svg')
}

testQRGeneration().catch(console.error)