import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import usePageMeta from '../hooks/usePageMeta'

const SECTIONS = [
  {
    title: '1. Overview',
    body: `This Refund & Cancellation Policy applies to paid plans and services purchased from Vikku Labs (vikku.in), including Vikku PM plans. Payments are processed securely via Razorpay.`,
  },
  {
    title: '2. Free Tools & Free Tier',
    body: `Our AI tools and the free tier of Vikku PM are provided at no cost and require no payment, so no refunds apply to them.`,
  },
  {
    title: '3. Plan Refunds',
    body: `If you buy a paid plan and are not satisfied, you may request a refund within 7 days of your first payment, provided the service has not been substantially used. After that, payments are not refundable, including payments made to keep a plan going.`,
  },
  {
    title: '4. Custom Project & Agency Work',
    body: `Custom software / agency engagements are governed by the specific proposal or contract signed for that project (including milestones and payment terms). Amounts tied to completed milestones or work already delivered are non-refundable. Please refer to your signed agreement.`,
  },
  {
    title: '5. Cancellations',
    body: `Paid plans are one-time payments and do not renew, so there is nothing to cancel. You keep access until the end of the period you paid for. If you have an older auto-renewing subscription, you can cancel it at any time from your account or by emailing us. Cancelling stops future billing but does not refund the current period unless you qualify under Section 3.`,
  },
  {
    title: '6. How to Request a Refund',
    body: `Email connect@vikku.in with the subject line "Refund Request", the email associated with your account, and your payment/subscription ID. We aim to respond within 3 business days. Approved refunds are issued to the original payment method via Razorpay and may take 5–10 business days to appear.`,
  },
  {
    title: '7. Contact',
    body: `Questions about billing or refunds? Email connect@vikku.in.`,
  },
]

export default function RefundPolicy() {
  usePageMeta({
    title:       'Refund & Cancellation Policy - Vikku Labs',
    description: 'Vikku Labs refund and cancellation terms for subscriptions and services.',
    url:         'https://vikku.in/refunds',
  })
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-10">
          <ArrowLeft size={15} /> Back to Home
        </Link>
        <div className="mb-10">
          <h1 className="font-display font-extrabold text-4xl text-white mb-3">Refund &amp; Cancellation Policy</h1>
          <p className="text-white/40 text-sm">Last updated: November 2026</p>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-10">
          We want you to be happy with Vikku Labs. This policy explains when and how refunds and cancellations work.
        </p>
        <div className="space-y-8">
          {SECTIONS.map(({ title, body }) => (
            <div key={title} className="glass rounded-2xl p-6">
              <h2 className="font-display font-semibold text-white text-base mb-3">{title}</h2>
              <p className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
