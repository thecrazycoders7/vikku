// Week 1: the buying decision. Written from the founder's 30-day series, expanded into full guides.
const date = '2026-11-17'
const category = 'Buying decisions'

export const WEEK1 = [
  {
    day: 1, slug: 'does-my-business-need-an-app', category, date,
    title: "Your business probably doesn't need an app",
    seoTitle: 'Does my business need a mobile app? An honest test',
    description: 'Got a ₹3 lakh app quote? Ask one question first. When an app makes sense for an Indian small business, and what to build instead.',
    summary: "Most small businesses don't need a mobile app. A fast website, a WhatsApp number that gets answered and a payment link that works will do more for less. Build an app only when customers use you every week and need something a browser can't do.",
    takeaways: [
      'Ask why a customer would install the app and open it again next month. If there is no honest answer, don\'t build it.',
      'A fast website, answered WhatsApp and a working payment link cover most needs, with no download.',
      'Apps earn their cost with frequent use: fast reordering, saved preferences, real loyalty rewards or phone features.',
      'An app also has ongoing costs: store accounts, updates for new phone versions, and someone to fix it.',
    ],
    body: `Someone has quoted you around three lakh rupees for a mobile app. Before you sign, answer one question honestly: **why would a customer download it?**

Not why you want one. Why would they install it, keep it on their phone and open it again next month? People already ignore most of the apps they have. They are not clearing space for a salon, a clinic or a local shop they visit a few times a year.

## The one-question test

Write down the answer to each of these. If you can't answer at least two with a real customer in mind, you don't need an app yet.

1. How often does a typical customer buy from you? Weekly is a good sign. A few times a year is not.
2. What would the app do that a website can't? Think offline use, push reminders the customer actually wants, the camera, or one-tap reordering.
3. What happens to a customer who never installs it? If they can still do everything, the app is optional for them too.
4. Who will update it when Android or iOS changes next year?

## What actually gets used instead

| Need | What works for most businesses | Rough cost to set up |
| --- | --- | --- |
| Be found and understood | A website that loads in about two seconds on a phone | Low, one-time |
| Answer questions | A WhatsApp Business number someone actually answers | Free app, or paid API for automation |
| Take payment | A UPI or payment-gateway link that works first time | Usually a per-transaction fee |
| Bookings | A booking page linked from your site and WhatsApp | Free to low monthly |

Together these usually cost a fraction of an app, and your customer installs nothing.

## When an app does make sense

An app is worth it when customers use you often and the app does something a browser genuinely can't:

- **Fast reordering**: groceries, milk, pharmacy refills, daily services.
- **Saved preferences** that change the experience every visit.
- **Loyalty that actually pays**: points customers redeem, not a stamp card nobody remembers.
- **Device features**: location tracking for deliveries, scanning, offline work for field staff.

If that's you, an app can pay for itself. If not, it becomes an expensive icon nobody taps.

## Costs people forget

An app is not a one-time purchase. Plan for:

- Developer accounts for the Play Store and App Store.
- Updates when new phone and operating system versions arrive, usually at least once a year.
- Fixes for bugs real users find, and someone responsible for them.
- Store review delays every time you publish a change.

A useful rule from our other guides: expect yearly upkeep of roughly 15 to 20 percent of the build cost. Read more in [the maintenance cost nobody quotes you](/blog/software-maintenance-cost).

> Start with the website, the WhatsApp number and the payment link. If customers start asking for an app, that demand is your green light.

Not sure what your idea should cost? Try the free [Project Estimator](/tools/project-estimator) before you talk to anyone.`,
    faqs: [
      { q: 'How much does a mobile app cost in India?', a: 'Simple apps can start from a few lakh rupees, and complex ones cost much more. The bigger question is the yearly upkeep, which is often 15 to 20 percent of the build cost.' },
      { q: 'Is a website enough for a small business?', a: 'For most small businesses, yes. A fast, clear website with WhatsApp and online payment covers enquiries, bookings and sales without asking customers to install anything.' },
      { q: 'When should a business build an app?', a: 'When customers buy often, such as weekly, and the app does something a browser cannot, like one-tap reordering, saved preferences, real loyalty rewards or device features.' },
    ],
    related: { label: 'Estimate what your idea should cost', to: '/tools/project-estimator' },
  },
  {
    day: 2, slug: 'ai-wont-fix-a-broken-process', category, date,
    title: "AI won't fix a broken process",
    seoTitle: "Why AI won't fix a broken business process",
    description: 'Automating a messy process only makes the mess faster. How to map your process first, the free fix most businesses find, and when to automate.',
    summary: "Automation copies whatever process you already have, including its problems. Before buying any AI or automation, write down how the work really happens today. Most fixes show up on paper and cost nothing, and then you automate the version that works.",
    takeaways: [
      'Software doesn\'t create order. It copies the order you already have, good or bad.',
      'Automating a broken intake form just collects bad data faster.',
      'Map the process as it really happens: who does what, in what order, and where it breaks.',
      'Fix ownership and gaps first, then automate. Automation is a multiplier.',
    ],
    body: `This is the most expensive mistake we see. A business has a messy process: enquiries arrive in four places, nobody is sure who follows up, and key information lives in one person's head. So they buy AI to fix it.

What actually happens is that the mess gets faster. Automate a broken intake form and you collect bad data at speed. Add AI to a follow-up process nobody owns, and now nobody owns it automatically.

## Why automation can't fix it

Software doesn't create order. It copies whatever order already exists. If your process has no owner, no clear steps and no single place for information, an automated version has the same gaps, just running faster and with less human judgment to catch mistakes.

## Map the process in one hour

Before you automate anything, write down how the work really happens today. Not how it should work, how it does.

| Question | What to write down |
| --- | --- |
| Where does it start? | Every place a request arrives: calls, WhatsApp, email, walk-ins, forms |
| Who touches it? | Each person, in order, and what they do |
| Where is it recorded? | Notebook, Excel, WhatsApp chat, someone's memory |
| Where does it stall? | The step where things wait, get lost or need chasing |
| Who owns the outcome? | One name. If you write "everyone", that's the problem |

## What the map usually shows

In most businesses, writing it down reveals the fix on its own:

- Requests arrive in too many places, so some are missed.
- Nobody owns follow-up, so it happens when someone remembers.
- The same information is typed in twice by different people.
- One step depends on a single person who is often busy or away.

These are decisions, not technology problems. Fixing them costs nothing.

## When to automate

Automate once the process works by hand and has an owner. Good signs:

1. The steps are the same every time.
2. The inputs are structured, like a form instead of free text.
3. Someone checks the results, at least at first.
4. You can measure the time it takes today, so you'll know if automation helped.

> Automation is a multiplier. Multiply a working process and you save hours. Multiply a mess and you get a bigger mess.

When you're ready, start small. Our guide to [the first three things to automate](/blog/first-things-to-automate) shows where most businesses get the quickest return.`,
    faqs: [
      { q: 'Should I fix my process before automating?', a: 'Yes. Automation copies your current process. Map how the work happens today, give each step an owner and remove duplicate steps, then automate the version that works.' },
      { q: 'How do I map a business process?', a: 'Write down where each request starts, who handles it in what order, where it is recorded, where it stalls and who owns the result. An hour on paper is usually enough.' },
      { q: 'What happens if you automate a bad process?', a: 'The same problems happen faster and at larger scale, such as collecting bad data or follow-ups that nobody owns, and they are harder to notice because fewer people look at each step.' },
    ],
    related: { label: 'See how we approach AI automation', to: '/ai-automation' },
  },
  {
    day: 3, slug: 'ai-automation-cost-india', category, date,
    title: 'What AI automation actually costs',
    seoTitle: 'How much does AI automation cost in India?',
    description: 'Straight price ranges for AI automation in India: single workflows, internal tools, running costs and maintenance, and what really pushes a quote up.',
    summary: "In our experience, a single automated workflow usually costs under ₹1 lakh, and an internal tool that replaces your spreadsheets usually costs ₹1 to 5 lakh. Integrations, not the AI, drive most of the price. Plan for running costs of roughly ₹5,000 to ₹20,000 a month, plus maintenance.",
    takeaways: [
      'A single workflow, like a lead form that routes, tags and follows up, is usually under ₹1 lakh.',
      'An internal tool replacing spreadsheets is usually ₹1 to 5 lakh, depending on how many user types it has.',
      'Voice, document processing or custom models cost more.',
      'If a quote has no running-cost line, it isn\'t finished.',
    ],
    body: `Almost nobody publishes pricing for automation work, so here are straight ranges from our own projects. Treat them as a starting point, not a quote.

## Typical price ranges

| What you're buying | Typical range | What it includes |
| --- | --- | --- |
| A single workflow | Under ₹1 lakh | For example, a lead form that routes, tags and follows up automatically |
| An internal tool | ₹1 to 5 lakh | Replaces spreadsheets with one app, priced by how many user types it has |
| Voice, documents or custom AI | Higher | AI phone agents, reading invoices or forms, or a model trained on your data |
| Running costs | About ₹5,000 to ₹20,000 a month | Hosting, AI usage, messaging and other services for most small systems |
| Maintenance | About 15 to 20% of build cost a year | Updates, fixes and small changes |

## What really pushes a quote up

It's rarely the AI. It's the **integrations**.

Every system you want connected, whether that's your accounting software, CRM, payment gateway or WhatsApp, brings its own edge cases, logins and failure points. When a vendor changes their API, something breaks and someone has to fix it. Three integrations can easily cost more than the feature they serve.

Other cost drivers:

- **Number of user types.** An app for one role is simple. Admin, staff, manager and customer views multiply the work.
- **Messy inputs.** Free-text messages, scanned documents and voice cost more than clean forms.
- **Accuracy requirements.** If a mistake is expensive, you need more testing and human checks.
- **Languages.** Telugu, Hindi and mixed-language support needs extra testing.

## How to read a quote

A complete automation quote should show:

1. The build cost, broken into parts.
2. Monthly running costs, with the main services named.
3. A yearly maintenance figure, or a maintenance plan.
4. What is not included.

> If a quote has no running-cost line, it isn't finished. Ask for one before you compare prices.

## Make the money go further

- Start with one workflow that removes the most repetitive work, then expand.
- Use plain rules where rules work. Many "AI" problems don't need AI at all. See [AI agent or automation](/blog/ai-agent-vs-automation).
- Clean your data first, because messy data makes every project longer. See [why your data is why AI isn't working](/blog/data-quality-ai).

Want a number for your own idea? The free [Project Estimator](/tools/project-estimator) and [Maintenance Calculator](/tools/maintenance) give you a range in a few minutes.`,
    faqs: [
      { q: 'How much does AI automation cost for a small business in India?', a: 'In our experience, a single workflow usually costs under ₹1 lakh, and an internal tool replacing spreadsheets usually costs ₹1 to 5 lakh. Voice, documents or custom models cost more.' },
      { q: 'What are the running costs of an automation system?', a: 'For most small systems, roughly ₹5,000 to ₹20,000 a month for hosting, AI usage and messaging, plus yearly maintenance of about 15 to 20 percent of the build cost.' },
      { q: 'Why are automation quotes so different?', a: 'Mostly because of integrations, the number of user types and how messy the inputs are. Ask every vendor the same questions so you compare the same scope.' },
    ],
    related: { label: 'Get a cost range for your project', to: '/tools/project-estimator' },
  },
  {
    day: 4, slug: 'unused-software-subscriptions', category, date,
    title: 'The software you pay for and never open',
    seoTitle: 'How to find and cancel unused software subscriptions',
    description: 'Most businesses pay for tools nobody uses. A 15-minute subscription audit to find them, a simple rule for cancelling, and a quarterly habit.',
    summary: "Many businesses pay for software nobody opens. In audits we run, we usually find three to six forgotten tools. List every recurring charge, write next to each one the name of someone who used it this week, and cancel the ones without a name.",
    takeaways: [
      'Forgotten subscriptions often add up to more than the project you postponed for being too expensive.',
      'The rule: if you can\'t name a person who opened it this week, cancel it.',
      'Check bank statements, card statements and app store subscriptions.',
      'Repeat the check once a quarter.',
    ],
    body: `Open your bank statement and look for recurring payments. In audits we run, most businesses find three to six tools they pay for and nobody opens.

Typical examples:

- A CRM bought for a sales plan that never happened.
- A design tool for an employee who left.
- Two project tools, because two teams each picked their own.
- An annual plan that renewed quietly after a free trial.

Individually they look small: ₹900 here, ₹2,000 there. Together they're often more than the project you've been postponing because it felt too expensive.

## The 15-minute audit

1. Pull the last three months of bank and card statements, plus app store and Google Play subscriptions.
2. List every recurring charge in a simple table.
3. Next to each, write the name of the person who opened it this week.
4. If you can't name anyone, cancel it or downgrade it.

| Tool | Monthly cost | Who used it this week? | Decision |
| --- | --- | --- | --- |
| Example CRM | ₹2,500 | Nobody | Cancel |
| Design tool | ₹1,200 | Priya | Keep |
| Second project tool | ₹900 | Nobody | Merge into the first |

## Where the money hides

- **Annual plans** that renew without a reminder.
- **Per-seat pricing** for people who left the company.
- **Duplicate tools** doing the same job in different teams.
- **Add-ons** bought for one project and never removed.
- **Free trials** that turned into paid plans.

## Before you cancel

- Export any data you might need later.
- Check if another tool depends on it, such as a form that feeds the CRM.
- Note the renewal date, so you can cancel before the next charge.

## Make it a habit

The software isn't the problem. The problem is that nobody decided to stop. Subscriptions are designed to be easy to start and easy to forget.

> Put a quarterly 15-minute reminder in your calendar. The money you save can fund your next real project.

Saved money and want to put it to work? Read [the first three things to automate](/blog/first-things-to-automate), or check what any new tool will cost to run with our free [Maintenance Calculator](/tools/maintenance).`,
    faqs: [
      { q: 'How do I find unused software subscriptions?', a: 'List every recurring charge from your bank, card and app store statements, then write the name of someone who used each tool this week. Tools without a name are candidates to cancel.' },
      { q: 'How often should a business review its subscriptions?', a: 'Once a quarter. It takes about 15 minutes and catches annual renewals, unused seats and duplicate tools before they keep charging.' },
      { q: 'What should I do before cancelling a tool?', a: 'Export any data you need, check whether another system depends on it, and cancel before the next renewal date.' },
    ],
    related: { label: 'Estimate monthly software running costs', to: '/tools/maintenance' },
  },
  {
    day: 5, slug: 'custom-software-vs-off-the-shelf', category, date,
    title: 'Custom or off-the-shelf: how to decide',
    seoTitle: 'Custom software vs off-the-shelf: how to decide',
    description: 'One question settles custom vs ready-made software, and it isn\'t about features. Build your edge, buy the rest, with examples for small businesses.',
    summary: "Build custom software only for the part of your business that is genuinely different and is the reason customers choose you. Buy ready-made products for everything standard, like billing, payroll and accounting. The strongest setup is usually a mix of both.",
    takeaways: [
      'Don\'t decide on features. Any product looks incomplete if you list enough features.',
      'Ask: is this process different from competitors, and is that difference why customers choose us?',
      'If yes, it\'s worth owning. If no, buy a product.',
      'Most businesses do best with ready-made tools plus one custom piece.',
    ],
    body: `Custom software or a ready-made product? Most people decide by comparing features. That's the wrong test, because any product looks incomplete if you list enough features.

## The one question that settles it

> Is the way you do this genuinely different from everyone else in your industry, and is that difference why customers choose you?

- **If yes**, that part is worth building. It's your edge.
- **If no**, buy a product and move on.

Billing is billing. Payroll is payroll. Nobody chooses you because your invoice numbering is unusual. But the thing you genuinely do differently, like how you route a job, how you price or how you look after a repeat customer, is worth owning.

## Quick comparison

| | Off-the-shelf | Custom |
| --- | --- | --- |
| Upfront cost | Low, usually a subscription | Higher, a one-time build |
| Time to start | Days | Weeks to months |
| Fits your process | You adapt to it | It adapts to you |
| Ongoing cost | Monthly fees, often per user | Maintenance, often 15 to 20% of build cost a year |
| Ownership | You rent it | You own it, if the contract says so |
| Best for | Standard work: accounts, payroll, email | Your edge: the work that wins customers |

## Examples

- **A staffing agency** buys accounting and payroll software, but builds its own timesheet and placement system, because how it matches people to jobs is the business. That's what we built for [Jobly Solutions](/work/jobly-solutions).
- **A clinic** buys a standard billing tool, but adds a custom booking assistant that fits how its doctors actually run queues.
- **A retailer** uses a standard store platform, and builds one custom piece for wholesale pricing rules nobody else supports.

## The mixed setup

The strongest setup for most businesses isn't one or the other. It's a ready-made product for everything standard, connected to one custom piece for the thing that makes you money.

Before you build, check two things:

1. Can a product be configured to do it? Many can, with settings or add-ons.
2. Will you own the code, accounts and data? Read [who actually owns your code](/blog/who-owns-your-code).

Unsure which stack fits? The free [Tech Stack Recommender](/tools/stack-recommender) suggests options based on what you're building.`,
    faqs: [
      { q: 'When should a business build custom software?', a: 'When the process is genuinely different from competitors and that difference is why customers choose you. For standard work like billing or payroll, buy a product.' },
      { q: 'Is custom software more expensive than SaaS?', a: 'It costs more upfront, but you avoid per-user fees and can shape it to your process. Plan for yearly maintenance of about 15 to 20 percent of the build cost.' },
      { q: 'Can I combine custom and off-the-shelf software?', a: 'Yes, and it is usually the best setup: ready-made tools for standard work, connected to one custom piece for the work that wins customers.' },
    ],
    related: { label: 'Get a tech stack recommendation', to: '/tools/stack-recommender' },
  },
  {
    day: 6, slug: 'why-website-gets-no-leads', category, date,
    title: 'Why your website brings no leads',
    seoTitle: 'Why your website gets visitors but no enquiries',
    description: 'Visitors but no enquiries? It\'s usually not SEO. Check speed, the first screen and how many taps it takes to reach you, with a 10-minute test.',
    summary: "If your website gets visitors but no enquiries, the cause is usually not SEO. It's usually one of three things: the site is slow on phones, the first screen doesn't say what you do and for whom, or it takes too many taps to contact you. Fix those before you buy more traffic.",
    takeaways: [
      'Time your site on a phone. If it takes more than about three seconds, many visitors have already left.',
      'The first screen should say what you do and who it\'s for. A stranger should get it in five seconds.',
      'Count the taps to reach a human. More than two loses people who were ready.',
      'Fix speed, clarity and contact before paying for ads or SEO.',
    ],
    body: `Your website gets visitors but no enquiries, and everyone tells you it's an SEO problem. Usually it isn't. Your website isn't broken. It just never asked for anything.

## The 10-minute test

Do this on your own phone, using mobile data rather than office Wi-Fi.

| Check | Good | Needs work |
| --- | --- | --- |
| Speed | Main content shows in about 2 to 3 seconds | Blank or loading for longer |
| First screen | Says what you do, for whom and where | "Welcome to our website" or a slideshow |
| Contact | A human is one or two taps away | Contact page, then a form, then a wait |
| Trust | Real work, real clients, real address | Stock photos and no proof |

## 1. Speed

Open your site and time it. Google's Core Web Vitals guidance treats around 2.5 seconds for the main content as good. Common causes of slow sites:

- Huge uncompressed images, especially from phones or stock sites.
- Too many plugins, chat widgets and tracking scripts.
- Cheap shared hosting far from your customers.

## 2. The first screen

Read your homepage's first screen as a stranger. Within five seconds, can they tell:

1. What you do?
2. Who it's for?
3. Where you work, if that matters?
4. What to do next?

A clear line like "Physiotherapy clinic in Kukatpally, open till 9 pm. Book a visit" beats any clever slogan.

## 3. The path to a human

Count the taps from landing to talking to someone. More than two, and you're losing people who were ready to buy. Easy wins:

- A visible call button and a WhatsApp button on every page.
- A short form with three fields, not ten.
- A booking link if you sell appointments.
- A reply promise, like "We reply within an hour, 9 am to 7 pm".

## Then think about traffic

Most sites fail on these three things, not on keywords. Fix them and the same traffic converts better. Spend money on traffic first, and you're paying to send more people to a page that already loses them.

> Fast, clear and easy to contact. Fix those three, then buy traffic.

Want to know if AI assistants like ChatGPT can find and understand your site too? Run the free [AI Visibility Score](/tools/ai-visibility-score). To see what lost enquiries cost you, try the [Business Impact calculator](/tools/business-impact).`,
    faqs: [
      { q: 'Why does my website get traffic but no leads?', a: 'Usually because it is slow on phones, the first screen does not say what you do and for whom, or contacting you takes too many steps. Fix those before investing in SEO or ads.' },
      { q: 'How fast should a business website load?', a: 'The main content should appear in about two to three seconds on a phone. Google treats around 2.5 seconds for the largest content as good.' },
      { q: 'How can I get more enquiries from my website?', a: 'Make the first screen say what you do and for whom, add call and WhatsApp buttons on every page, shorten forms to a few fields, and show real proof of your work.' },
    ],
    related: { label: 'Check your AI Visibility Score', to: '/tools/ai-visibility-score' },
  },
  {
    day: 7, slug: 'website-cost-india', category, date,
    title: 'The ₹50,000 website and the ₹5,000 one',
    seoTitle: 'Website cost in India: ₹5,000 vs ₹50,000, the difference',
    description: 'Why one website costs ten times another, when a cheap template is fine, and the three things an expensive site must include to be worth it.',
    summary: "A ₹5,000 website is usually a template with your text in it, and that's fine if you just need to exist online and be contactable. A ₹50,000 website should buy three extra things: content written for your customers, structure that search engines and AI assistants can read, and something that does a job, like booking or quoting. If it doesn't, you're paying for a nicer template.",
    takeaways: [
      'A cheap template site is genuinely fine for many small businesses.',
      'An expensive site should include custom content, a search-friendly structure and a working feature.',
      'Ask any agency which of those three its price covers.',
      'Check who owns the domain and hosting before you pay.',
    ],
    body: `Why does one website cost ₹5,000 and another ₹50,000? Mostly it isn't the design.

## The ₹5,000 website

The cheap one is usually a template with your text and logo in it. That's genuinely fine for a business that needs to exist online and be contactable. Don't let anyone shame you out of it.

It works when:

- Customers mostly find you through referrals or Google Maps.
- You need a phone number, address, timings and a few photos online.
- You don't need bookings, payments or quotes on the site.

## What the ₹50,000 website should buy

| What you're paying for | What it means | Ask the agency |
| --- | --- | --- |
| Content | Pages written for the customer you want, not generic copy | Who writes the content, and from what research? |
| Structure | Pages, headings and data that search engines and AI assistants can read | Will each service have its own page and structured data? |
| Something that works | A booking flow, quote calculator, payment step or lead form that feeds your system | What does the site do for me while I sleep? |

If a ₹50,000 quote doesn't include those, you're paying for a nicer template.

## Questions before you pay

1. Will the domain and hosting be registered in my name?
2. Can I edit text and photos myself?
3. How fast will it load on a phone?
4. What happens after launch: who fixes things, and at what cost?
5. Which of the three things above does this price cover?

The answers tell you whether it's a real investment or just a bigger invoice.

## Hidden costs to ask about

- Domain renewal every year.
- Hosting, which is sometimes free for a year and then charged.
- Paid plugins or themes that need yearly licences.
- Changes after launch, which some agencies charge per edit.

> The price difference should be explained by what the site does for your business, not by how it looks.

To see what a site with booking or quotes should cost, try the free [Project Estimator](/tools/project-estimator). To check whether AI assistants can read your current site, run the [AI Visibility Score](/tools/ai-visibility-score).`,
    faqs: [
      { q: 'How much does a website cost in India?', a: 'Template sites can cost a few thousand rupees, and custom sites with written content, search-friendly structure and features like booking or payments cost tens of thousands or more.' },
      { q: 'Is a cheap website bad for my business?', a: 'Not necessarily. A template site is fine if you mainly need to be found and contacted. Pay more only when the site needs to win customers through content or do a job like booking.' },
      { q: 'What should a professional website include?', a: 'Content written for your customers, a structure search engines and AI assistants can read, a fast mobile experience and at least one working feature such as booking, quotes or payment.' },
    ],
    related: { label: 'Estimate what your website should cost', to: '/tools/project-estimator' },
  },
]
