// Run: node api/_signup.test.mjs
import assert from 'node:assert/strict'
import { checkSignup } from './_signup.js'

assert.deepEqual(checkSignup({ email: ' Asha@RaoClinics.in ', elapsedMs: 6000 }), { ok: true, email: 'asha@raoclinics.in' })
assert.deepEqual(checkSignup({ email: 'a@b.co' }), { ok: true, email: 'a@b.co' })                 // older clients send no timing
assert.equal(checkSignup({ email: 'real@gmail.com', website: 'http://spam' }).silent, true)      // trap field
assert.equal(checkSignup({ email: 'real@gmail.com', elapsedMs: 300 }).silent, true)              // too fast
assert.match(checkSignup({ email: 'bc7821138' }).error, /valid email/)
assert.match(checkSignup({ email: 'x@y' }).error, /valid email/)
assert.match(checkSignup({ email: 'a b@c.com' }).error, /valid email/)
assert.match(checkSignup({ email: 'z@mailinator.com', elapsedMs: 5000 }).error, /temporary/)
assert.match(checkSignup({ email: 'z@eu.mailinator.com' }).error, /temporary/)
assert.equal(checkSignup({ email: 'z@notmailinator.com' }).ok, true)                             // only exact domains / subdomains
console.log('api/_signup: all checks passed')
