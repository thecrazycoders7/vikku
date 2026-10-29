// Run: node api/_quote.test.mjs
import assert from 'node:assert/strict'
import { TOKEN_RE, publicQuote, respondError } from './_quote.js'

const doc = { id: 'secret', lead_id: 'x', client_id: 'y', crm_project_id: 'z', share_token: 't', number: 'VQ-2026-0001', title: 'Bot', currency: 'INR',
  items: [{ description: 'Build', qty: '2', rate: '1000', internal: 1 }], tax_percent: '18', discount: '0', total: '2360', status: 'sent', notes: 'n', terms: 't' }
const q = publicQuote(doc, { name: 'Asha', company: 'Rao', email: 'hidden@x.in' })
assert.equal(q.total, 2360)
assert.deepEqual(q.items, [{ description: 'Build', qty: 2, rate: 1000 }])
assert.deepEqual(q.party, { name: 'Asha', company: 'Rao' })
for (const k of ['id', 'lead_id', 'client_id', 'crm_project_id', 'share_token']) assert.ok(!(k in q), k)
assert.equal(publicQuote({ ...doc, status: 'draft' }), null)
assert.equal(publicQuote(null), null)

assert.ok(TOKEN_RE.test('11111111-1111-1111-1111-111111111111'))
assert.ok(!TOKEN_RE.test("1' or 1=1"))

assert.equal(respondError({ code: 'P0002', message: 'quote not found' })[0], 404)
assert.equal(respondError({ message: 'quote expired' })[0], 409)
assert.equal(respondError({ message: 'quote not open' })[0], 409)
assert.equal(respondError({ message: 'name required' })[0], 400)
assert.equal(respondError(new Error('boom'))[0], 500)
console.log('api/_quote: all checks passed')
