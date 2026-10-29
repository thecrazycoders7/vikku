// jsPDF's built-in fonts (Helvetica) only have the Windows-1252 characters, so ₹, arrows, emoji or
// non-Latin text (which can come from AI summaries or what someone types) print as garbage.
// pdfSafe swaps the common ones for plain text and drops the rest; ₹ becomes "INR".
// Used by the free-tool PDFs (pdfGenerator.js) and quotations (quotePdf.js). Tested by pdfText.test.mjs.
const WIN1252_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'
const SWAPS = { '→': '->', '←': '<-', '⇒': '=>', '≈': '~', '≤': '<=', '≥': '>=', '−': '-', '✓': '', '✔': '', '✗': 'x', '★': '*' }

export function pdfSafe(text) {
  return String(text ?? '')
    .replace(/₹\s*/g, 'INR ')
    .replace(/[^\u0000-ÿ]/gu, (c) => (c in SWAPS ? SWAPS[c] : WIN1252_EXTRA.includes(c) ? c : ''))
    .replace(/ {2,}/g, ' ')
}
