import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import usePageMeta from '../hooks/usePageMeta'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Vikku (vikku.in), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, do not use our services.

These Terms constitute a legally binding agreement between you and Vikku ("we", "us", or "our"), a company registered in India.`,
  },
  {
    title: '2. Description of Services',
    body: `Vikku provides:

• A Project Management (PM) SaaS tool for managing tasks, milestones, team collaboration, and client communication.
• Free AI-powered tools including a Cost Estimator, ROI Calculator, Timeline Calculator, and Tech Recommender.
• A client portal for sharing project progress with clients.
• Software development and consulting services (subject to separate service agreements).

We reserve the right to modify, suspend, or discontinue any service at any time with reasonable notice.`,
  },
  {
    title: '3. User Accounts',
    body: `To use our PM tool and other authenticated features, you must create an account. You agree to:

• Provide accurate and complete information.
• Keep your password secure and confidential.
• Notify us immediately of any unauthorised use of your account.
• Be responsible for all activity that occurs under your account.

You must be at least 18 years old to create an account. We reserve the right to terminate accounts that violate these Terms.`,
  },
  {
    title: '4. Subscriptions and Payments',
    body: `Certain features require a paid subscription (Pro or Team plan). By subscribing:

• You authorise us to charge your payment method via Razorpay at the then-current subscription price.
• Subscriptions are billed monthly and automatically renew unless cancelled.
• Prices are in Indian Rupees (INR) and inclusive of applicable taxes.
• We do not offer refunds for partial subscription periods. If you cancel, you retain access until the end of your current billing period.
• We reserve the right to change pricing with 30 days' notice. Continued use after the effective date constitutes acceptance.

Free plan limitations: Free accounts may create up to 3 active projects and have limited access to Pro features.`,
  },
  {
    title: '5. Acceptable Use',
    body: `You agree not to:

• Use our services for any unlawful purpose or in violation of any regulations.
• Upload or transmit malware, viruses, or harmful code.
• Attempt to gain unauthorised access to our systems or other users' accounts.
• Use our AI tools to generate content that is fraudulent, harmful, or misleading.
• Reverse engineer, decompile, or disassemble any part of our software.
• Use automated tools (bots, scrapers) to access our services without permission.
• Resell or sublicense our services without written permission.

Violation of these terms may result in immediate account termination without refund.`,
  },
  {
    title: '6. Your Content',
    body: `You retain ownership of all data, content, and information you upload or create within our services ("Your Content"). By using our services, you grant us a limited, non-exclusive licence to host, store, and display Your Content solely to provide the service to you.

You are responsible for ensuring Your Content does not infringe on any third-party rights. We do not claim ownership of Your Content and will not share it with third parties except as described in our Privacy Policy.

If you delete your account, we will delete Your Content within 30 days.`,
  },
  {
    title: '7. Intellectual Property',
    body: `All content on vikku.in - including the design, logos, software, text, graphics, and code - is the property of Vikku or its licensors and is protected under Indian and international intellectual property law.

You may not copy, reproduce, distribute, or create derivative works from our content without express written permission.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, Vikku shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:

• Your use of or inability to use our services.
• Any unauthorised access to or alteration of your data.
• Errors or interruptions in our services.
• Any third-party conduct on our platform.

Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid us in the 3 months preceding the claim.

Our AI-generated outputs (cost estimates, ROI projections, tech recommendations) are for informational purposes only and do not constitute professional advice.`,
  },
  {
    title: '9. Disclaimer of Warranties',
    body: `Our services are provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

We do not warrant that our services will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    title: '10. Indemnification',
    body: `You agree to indemnify and hold harmless Vikku, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from your use of our services, Your Content, or your violation of these Terms.`,
  },
  {
    title: '11. Termination',
    body: `We may suspend or terminate your account and access to our services at any time for any reason, including violation of these Terms, with or without notice.

You may terminate your account at any time by contacting us at connect@vikku.in. Upon termination, your right to use the services ceases immediately.`,
  },
  {
    title: '12. Governing Law and Disputes',
    body: `These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.

We encourage you to contact us first at connect@vikku.in to resolve any disputes informally before pursuing legal action.`,
  },
  {
    title: '13. Changes to These Terms',
    body: `We reserve the right to update these Terms at any time. We will notify you of material changes by posting a notice on our website or emailing registered users. Continued use of our services after the effective date of any changes constitutes acceptance of the new Terms.`,
  },
  {
    title: '14. Contact',
    body: `If you have any questions about these Terms, please contact us:

Vikku
Email: connect@vikku.in
Website: https://vikku.in`,
  },
]

export default function TermsOfService() {
  usePageMeta({
    title:       'Terms of Service - Vikku',
    description: 'The terms governing your use of Vikku\'s website, PM tool, and services.',
    url:         'https://vikku.in/terms',
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
          <h1 className="font-display font-extrabold text-4xl text-white mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last updated: June 2025</p>
        </div>

        <p className="text-white/60 text-sm leading-relaxed mb-10">
          Please read these Terms of Service carefully before using Vikku. These Terms govern your
          access to and use of our website, products, and services. By creating an account or using
          our services, you confirm that you have read, understood, and agree to be bound by these Terms.
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
