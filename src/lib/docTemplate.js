// Turns a document template into blocks that both the admin editor (CrmDocEditor.jsx) and the PDF
// (docTemplatePdf.js) draw, so the page on screen and the file always match. Tested by docTemplate.test.mjs.
// [NAME] is a blank. "A / B" offers choices. A table row starting with a blank can repeat ("Add row").

// These mean something different each time they appear, so every use gets its own value. So do table
// labels such as [Answer] or [Name]; only a whole-capitals blank like [CLIENT] is shared across the page.
const EACH_OWN = new Set(['N', 'Nth', 'AMOUNT', 'DATE', 'REGION', 'RANGE'])
const ownValue = (name) => EACH_OWN.has(name) || /[a-z]/.test(name)
export const PREFILLED = new Set(['30', '7', '90', '2026-27', '001', '998314', '1'])
const FIELD = /(\[[^\]\s][^\]]*\]|☐)/

// Stored once in the admin and filled into every document. Not kept in the code.
export const COMPANY_FIELDS = [
  { key: 'LEGAL FORM', label: 'Legal form', hint: 'Proprietorship, LLP or Pvt Ltd' },
  { key: 'REGISTERED ADDRESS', label: 'Registered address', hint: 'As on your registration' },
  { key: 'VIKKU PAN', label: 'PAN' },
  { key: 'VIKKU GSTIN', label: 'GSTIN', hint: 'Leave empty if not registered' },
  { key: 'ACCOUNT NAME', label: 'Bank account name' },
  { key: 'ACCOUNT NUMBER', label: 'Bank account number' },
  { key: 'IFSC', label: 'IFSC' },
  { key: 'UPI ID', label: 'UPI ID' },
]

export function parseTemplate(body) {
  const seen = {}
  const key = (name, own) => {
    seen[name] = (seen[name] ?? -1) + 1
    return own || ownValue(name) ? `${name}#${seen[name]}` : name
  }
  const inline = (text, own = false) => {
    const out = []
    text.split('**').forEach((chunk, i) => {
      for (const piece of chunk.split(FIELD)) {
        if (!piece) continue
        if (piece === '☐') out.push({ box: key('check', true) })
        else if (FIELD.test(piece)) { const hint = piece.slice(1, -1); out.push({ field: key(hint, own), hint, bold: i % 2 === 1 }) }
        else out.push({ text: piece, bold: i % 2 === 1 })
      }
    })
    return out
  }
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  const lines = body.split('\n')
  const blocks = []
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trimEnd()
    let m
    if (!l) continue
    if (l === '===PAGE===') blocks.push({ type: 'page' })
    else if (l.startsWith('### ')) blocks.push({ type: 'heading', text: l.slice(4) })
    else if (l.startsWith('|')) {
      const table = { type: 'table', header: cells(l).map(c => c.replace(/\*\*/g, '')), rows: [] }
      for (i++; i < lines.length && lines[i].startsWith('|'); i++) {
        const raw = cells(lines[i])
        if (raw.every(c => /^:?-+:?$/.test(c))) continue
        const repeats = raw.length > 1 && raw[0].startsWith('[') && !raw.some(c => c.includes(':'))
        table.rows.push({ line: i, repeats, cells: raw.map(c => inline(c, repeats)) })
      }
      i--
      blocks.push(table)
    } else if (l.startsWith('- [ ] ')) blocks.push({ type: 'check', box: key('check', true), segments: inline(l.slice(6)) })
    else if (l.startsWith('- ')) blocks.push({ type: 'item', marker: '•', segments: inline(l.slice(2)) })
    else if ((m = l.match(/^(\d+)\. (.*)/))) blocks.push({ type: 'item', marker: `${m[1]}.`, segments: inline(m[2]) })
    else blocks.push({ type: 'para', segments: inline(l.replace(/^> /, '')) })
  }
  return blocks
}

const segmentsOf = (blocks) => blocks.flatMap(b => b.type === 'table' ? b.rows.flatMap(r => r.cells.flat()) : (b.segments || []))

// Every distinct blank in a document, for "N blanks left" and to fill in defaults.
export const fieldsOf = (blocks) => [...new Map(segmentsOf(blocks).filter(s => s.field).map(s => [s.field, s])).values()]

export function defaultValues(blocks, company = {}) {
  const today = new Date()
  const iso = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const values = {}
  for (const f of fieldsOf(blocks)) {
    if (PREFILLED.has(f.hint)) values[f.field] = f.hint
    else if (company[f.field]) values[f.field] = company[f.field]
    else if (f.field === 'DATE#0') values[f.field] = iso(today)
    else if (f.field === 'DATE + 15 DAYS') values[f.field] = iso(new Date(today.getTime() + 15 * 864e5))
  }
  return values
}

// Client details for the blanks that ask for them. Contractor and staff documents skip this.
export function clientValues(client) {
  const legal = client.company || client.name
  const values = { CLIENT: legal, 'CLIENT LEGAL NAME': legal, 'OTHER PARTY': legal, 'CLIENT NAME': client.name }
  if (client.address) values.ADDRESS = client.address
  if (client.gst_number) values.GSTIN = client.gst_number
  return values
}

// Column widths, shared so the table on screen and in the PDF have the same shape.
export function columnWeights(table, fields = {}) {
  if (table.header.length === 2 && ['Answer', 'Details', 'Value'].includes(table.header[1])) return [32, 68]
  const size = (cell) => Math.max(0, ...cell.map(s => (s.text || fields[s.field] || s.hint || '').length))
  return table.header.map((h, i) => Math.max(Math.min(Math.max(h.length, ...table.rows.map(r => size(r.cells[i] || []))), 42), 9))
}

export const choicesOf = (hint) => hint.includes(' / ') ? hint.split(' / ').map(o => o.trim()) : null

// Adds a blank copy of a repeating row. Later uses of the same blank move down one so nothing they hold is lost.
export function addRow(body, row, fields) {
  const lines = body.split('\n')
  lines.splice(row.line + 1, 0, lines[row.line])
  const next = { ...fields }
  for (const { field, hint } of row.cells.flat().filter(s => s.field)) {
    const [name, at] = field.split('#')
    let top = Number(at)
    while (`${name}#${top + 1}` in next) top++
    for (let n = top; n > Number(at); n--) next[`${name}#${n + 1}`] = next[`${name}#${n}`]
    if (PREFILLED.has(hint)) next[`${name}#${Number(at) + 1}`] = hint
    else delete next[`${name}#${Number(at) + 1}`]
  }
  return { body: lines.join('\n'), fields: next }
}
