// Run: node src/lib/pdfText.test.mjs
import assert from 'node:assert/strict'
import { pdfSafe } from './pdfText.js'

assert.equal(pdfSafe('₹1,50,000 - ₹2,00,000'), 'INR 1,50,000 - INR 2,00,000')
assert.equal(pdfSafe('₹ 500'), 'INR 500')
assert.equal(pdfSafe('6–8 weeks · €200 — “ok” £5 $9'), '6–8 weeks · €200 — “ok” £5 $9')   // all in the font
assert.equal(pdfSafe('Save time → more leads ✅🚀'), 'Save time -> more leads ')
assert.equal(pdfSafe('Café résumé naïve'), 'Café résumé naïve')                       // Latin-1 accents kept
assert.equal(pdfSafe('हिंदी text'), ' text')
assert.equal(pdfSafe(null), '')
assert.equal(pdfSafe(42), '42')
console.log('pdfText: all checks passed')
