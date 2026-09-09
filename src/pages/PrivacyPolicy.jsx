import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import usePageMeta from '../hooks/usePageMeta'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly to us when you:

• Create an account: email address and password.
• Use our Project Management (PM) tool: project names, task details, milestones, file attachments, comments, and time-tracking logs you create.
• Purchase a subscription: payment is processed by Razorpay. We do not store card numbers or CVV; we only receive a payment confirmation and subscription ID from Razorpay.
• Contact us: name, email, and the contents of your message.
• Subscribe to our newsletter: email address.

We also automatically collect technical data when you use our website: IP address, browser type, operating system, pages visited, and referring URLs. This is collected via Google Analytics and Microsoft Clarity for analytics purposes.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use the information we collect to:

• Provide, maintain, and improve our services.
• Process transactions and send related information, including purchase confirmations.
• Send technical notices, updates, security alerts, and support messages.
• Respond to your comments, questions, and requests.
• Monitor and analyze trends, usage, and activity on our platform.
• Detect, investigate, and prevent fraudulent transactions and other illegal activities.
• Send you marketing communications (only if you have opted in or subscribed).`,
  },
  {
    title: '3. Data Storage and Security',
    body: `Your data is stored on Supabase (PostgreSQL), hosted on AWS infrastructure with servers in the Asia-Pacific region. All data is encrypted at rest and in transit using TLS 1.2+.

We implement access controls, row-level security (RLS) policies, and regular security reviews. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.

We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where retention is required by law.`,
  },
  {
    title: '4. Data Sharing',
    body: `We do not sell, trade, or rent your personal information to third parties. We share data only with:

• Service Providers: Supabase (database), Vercel (hosting), Razorpay (payments), OpenAI (AI features - only the content of your tool queries, never personal account data), Google Analytics, and Microsoft Clarity.
• Legal Requirements: If required by law, court order, or government authority.
• Business Transfers: In connection with a merger, acquisition, or sale of assets (you will be notified).

Client project data (tasks, milestones, comments) shared via client portal links is accessible only to the specific link recipient.`,
  },
  {
    title: '5. Your Rights',
    body: `Under applicable Indian law (the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023) and globally applicable principles, you have the right to:

• Access the personal data we hold about you.
• Correct inaccurate or incomplete personal data.
• Request deletion of your personal data.
• Withdraw consent for marketing communications at any time.
• Data portability: request a copy of your data in a machine-readable format.

To exercise any of these rights, email us at connect@vikku.in with the subject line "Privacy Request".`,
  },
  {
    title: '6. Cookies',
    body: `We use essential cookies to keep you logged in. We also use analytics cookies (Google Analytics, Microsoft Clarity) to understand how visitors use our site. You can disable cookies in your browser settings, but some features may not work correctly.`,
  },
  {
    title: '7. Third-Party Links',
    body: `Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to read their privacy policies.`,
  },
  {
    title: '8. Children\'s Privacy',
    body: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, contact us and we will delete it promptly.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or emailing you. The "Last updated" date at the top of this page reflects the most recent revision.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have any questions about this Privacy Policy or our privacy practices, please contact us:

Vikku
Email: connect@vikku.in
Website: https://vikku.in`,
  },
]

export default function PrivacyPolicy() {
  usePageMeta({
    title:       'Privacy Policy - Vikku',
    description: 'How Vikku collects, uses, stores, and protects your personal data.',
    url:         'https://vikku.in/privacy',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-10"
        >
          <ArrowLeft size={15} /> Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="font-display font-extrabold text-4xl text-white mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: June 2025</p>
        </div>

        <p className="text-white/60 text-sm leading-relaxed mb-10">
          Vikku ("we", "us", or "our") operates vikku.in. This Privacy Policy explains how we collect,
          use, and protect your personal information when you use our website and services. By using
          our services, you agree to the collection and use of information in accordance with this policy.
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
