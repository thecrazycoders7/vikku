import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkOrderPayment, checkSubscription, safeEqual, hmac } from './_billing.js'

const now = 1_800_000_000
const order = { id: 'order_1', notes: { user_id: 'u1', plan: 'team', billing_cycle: 'monthly' } }
const payment = { order_id: 'order_1', status: 'captured', amount: 99900, created_at: now - 60 }

test('order: a fresh, full payment by the buyer grants the plan from the order', () => {
  assert.deepEqual(checkOrderPayment({ userId: 'u1', order, payment, nowS: now }), { ok: true, plan: 'team', cycle: 'monthly' })
})

test('order: refused for another account, a short payment, another order, a failed or an old payment', () => {
  for (const args of [
    { userId: 'u2', order, payment },
    { userId: 'u1', order, payment: { ...payment, amount: 29900 } },
    { userId: 'u1', order, payment: { ...payment, order_id: 'order_2' } },
    { userId: 'u1', order, payment: { ...payment, status: 'failed' } },
    { userId: 'u1', order, payment: { ...payment, created_at: now - 2 * 86400 } },
    { userId: 'u1', order: { ...order, notes: {} }, payment },
  ]) assert.equal(checkOrderPayment({ ...args, nowS: now }).ok, false)
})

test('subscription: plan comes from notes and must match the Razorpay plan id', () => {
  const env = { RAZORPAY_PLAN_PRO_MONTHLY: 'plan_pro', RAZORPAY_PLAN_TEAM_MONTHLY: 'plan_team' }
  const sub = { plan_id: 'plan_pro', status: 'active', notes: { user_id: 'u1', plan: 'pro', billing_cycle: 'monthly' } }
  assert.deepEqual(checkSubscription({ userId: 'u1', sub, env }), { ok: true, plan: 'pro', cycle: 'monthly' })
  assert.equal(checkSubscription({ userId: 'u2', sub, env }).ok, false)
  assert.equal(checkSubscription({ userId: 'u1', sub: { ...sub, notes: { ...sub.notes, plan: 'team' } }, env }).ok, false) // Pro paid, Team claimed
  assert.equal(checkSubscription({ userId: 'u1', sub: { ...sub, status: 'cancelled' }, env }).ok, false)
})

test('safeEqual', () => {
  const sig = hmac('s', 'a|b')
  assert.equal(safeEqual(sig, hmac('s', 'a|b')), true)
  assert.equal(safeEqual(sig, hmac('s', 'a|c')), false)
  assert.equal(safeEqual(sig, undefined), false)
})
