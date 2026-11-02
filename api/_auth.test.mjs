import assert from 'node:assert/strict'
import { callerOf } from './_auth.js'

const seen = []
const admin = { auth: { getUser: async (t) => { seen.push(t); return t === 'good' ? { data: { user: { id: 'u1' } } } : { data: { user: null }, error: new Error('bad') } } } }
const req = (authorization) => ({ headers: authorization ? { authorization } : {} })

assert.equal(await callerOf(req(), admin), null)
assert.equal(await callerOf(req('Bearer '), admin), null)
assert.equal(seen.length, 0, 'an empty token must not reach Supabase')
assert.equal(await callerOf(req('Bearer nope'), admin), null)
assert.deepEqual(await callerOf(req('Bearer good'), admin), { id: 'u1' })
console.log('api/_auth: all checks passed')
