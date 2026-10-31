import assert from 'node:assert/strict'
import { DOC_TEMPLATES } from '../data/docTemplates.js'
import { createRequire } from 'node:module'
import { addRow, choicesOf, clientValues, defaultValues, fieldsOf, parseTemplate } from './docTemplate.js'
import { templatePdf } from './docTemplatePdf.js'

const { jsPDF } = createRequire(import.meta.url)('jspdf')

assert.equal(DOC_TEMPLATES.length, 15)

const blocks = parseTemplate(`**[PROJECT NAME]** for [CLIENT], [N] weeks and [N] months
### Scope
- [ ] Tick me
| Item | Amount |
| --- | --- |
| [ITEM] | ₹[AMOUNT] |
| Total | ₹[AMOUNT] |`)
const keys = fieldsOf(blocks).map(f => f.field)
assert.deepEqual(keys, ['PROJECT NAME', 'CLIENT', 'N#0', 'N#1', 'ITEM#0', 'AMOUNT#0', 'AMOUNT#1'])
assert.equal(blocks.find(b => b.type === 'check').box, 'check#0')
const table = blocks.find(b => b.type === 'table')
assert.equal(table.rows[0].repeats, true)
assert.equal(table.rows[1].repeats, false)

const labels = parseTemplate(`| Question | Answer |\n| --- | --- |\n| One | [Answer] |\n| Two | [Answer] |`)
assert.deepEqual(fieldsOf(labels).map(f => f.field), ['Answer#0', 'Answer#1'])

// A new row must not take the total's value.
const body = `| Item | Amount |
| --- | --- |
| [ITEM] | ₹[AMOUNT] |
| Total | ₹[AMOUNT] |`
const row = parseTemplate(body)[0].rows[0]
const { body: longer, fields: moved } = addRow(body, row, { 'ITEM#0': 'Design', 'AMOUNT#0': '100', 'AMOUNT#1': '100' })
const again = parseTemplate(longer)[0]
assert.equal(again.rows.length, 3)
assert.equal(moved['AMOUNT#2'], '100')
assert.equal(moved['AMOUNT#1'], undefined)
assert.equal(again.rows[2].cells[1].find(s => s.field).field, 'AMOUNT#2')

assert.deepEqual(choicesOf('YES / NO'), ['YES', 'NO'])
assert.equal(choicesOf('AMOUNT'), null)
assert.equal(clientValues({ name: 'Asha', company: 'Acme Ltd' })['CLIENT LEGAL NAME'], 'Acme Ltd')

const msa = parseTemplate(DOC_TEMPLATES.find(t => t.id === 'master-services-agreement').body)
const filled = defaultValues(msa, { 'LEGAL FORM': 'LLP' })
assert.equal(filled['LEGAL FORM'], 'LLP')
assert.equal(filled['30'], '30')
assert.ok(filled['DATE#0'])

// What is typed must reach the PDF, including a repeated row and the total below it.
const invoiceBody = `Hello [CLIENT]
| Item | Qty | Amount |
| --- | --- | --- |
| [ITEM] | [1] | ₹[AMOUNT] |
| Total | | ₹[AMOUNT] |`
const invRow = parseTemplate(invoiceBody)[1].rows[0]
const grown = addRow(invoiceBody, invRow, { CLIENT: 'Acme', 'ITEM#0': 'Design', '1#0': '1', 'AMOUNT#0': '100', 'AMOUNT#1': '950' })
assert.equal(grown.fields['1#1'], '1')
const printed = templatePdf(jsPDF, { heading: 'Invoice', body: grown.body, fields: { ...grown.fields, 'ITEM#1': 'Build', 'AMOUNT#1': '850' } }, null).output()
for (const word of ['Acme', 'Design', 'Build', '100', '850', '950']) assert.ok(printed.includes(`(${word})`), `${word} missing from the PDF`)

// Every template parses and no blank is left behind as raw text.
for (const t of DOC_TEMPLATES) {
  const text = parseTemplate(t.body).flatMap(b => b.type === 'table' ? b.rows.flatMap(r => r.cells.flat()) : (b.segments || []))
  assert.ok(!text.some(s => s.text?.includes('\\')), t.id)
}
console.log('docTemplate: all checks passed')
