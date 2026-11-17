// Week 3: operations and money. Written from the founder's 30-day series, expanded into full guides.
const date = '2026-11-17'
const category = 'Operations and money'

export const WEEK3 = [
  {
    day: 15, slug: 'running-business-on-whatsapp', category, date,
    title: 'The hidden cost of running on WhatsApp',
    seoTitle: 'The hidden cost of running your business on WhatsApp',
    description: 'WhatsApp is fast and free until someone leaves. Why it fails as a filing cabinet, and how to keep it as your front door without losing records.',
    summary: "WhatsApp works well as your business's front door, but badly as its filing cabinet. Messages aren't searchable months later, ownership is unclear in groups, and customer history leaves with staff phones. Keep WhatsApp for conversations, and write enquiries, orders and promises into one searchable system the same day.",
    takeaways: [
      'Running on WhatsApp is fine for a while, because it\'s fast and everyone uses it.',
      'It fails at search, ownership and staff changes.',
      'Don\'t rip it out. Customers like it.',
      'Keep it as the front door, and record what matters somewhere searchable the same day.',
    ],
    body: `Your business runs on WhatsApp and, for a while, that's fine. It's fast, everyone already uses it, and it costs nothing. Here's where it quietly starts costing you.

## Where WhatsApp breaks

| Problem | What it looks like |
| --- | --- |
| Nothing is searchable later | A customer says "you promised me this price", and you scroll through a year of messages |
| Nothing is owned | A message in a group of eight means eight people assume someone else is handling it |
| History lives on phones | A staff member leaves, and the customer history walks out with them |
| No status | You can't see which enquiries are new, waiting or done |
| No numbers | You can't count enquiries, reply times or what turned into business |

## The fix is not what you expect

Don't rip out WhatsApp. Customers like it, and they'll keep messaging you there anyway.

Keep it as the **front door**, and stop treating it as the **filing cabinet**. Enquiries, orders and promises get written into something searchable the same day.

## How to do it

1. **One business number**, not staff personal numbers. WhatsApp Business is free and supports labels and quick replies.
2. **One place for records**: a CRM, a shared sheet with rules, or a simple app.
3. **One owner per enquiry**, written next to it.
4. **A daily habit**: before the end of the day, every new enquiry, order and promise is recorded.
5. **Automation, later**: once the habit works, the WhatsApp Business Platform can log messages and send confirmations automatically.

## What to record

- Name, phone number and what they asked for.
- Price or terms you agreed.
- Next step and due date.
- Who owns it.

> Keep the convenience. Stop losing the record.

This was exactly the problem at [Jobly Solutions](/work/jobly-solutions), where operations moved out of WhatsApp groups and Excel into one platform. If your records live in spreadsheets too, read [Excel is not a system](/blog/excel-is-not-a-system).`,
    faqs: [
      { q: 'Is it OK to run a business on WhatsApp?', a: 'As a communication channel, yes. As your record system, no: messages are hard to search, ownership is unclear in groups, and history leaves with staff phones.' },
      { q: 'How do I keep WhatsApp but stay organised?', a: 'Use one business number, record every enquiry, order and promise in one searchable place the same day, and give each enquiry a named owner.' },
      { q: 'Can WhatsApp be connected to a CRM?', a: 'Yes. The WhatsApp Business Platform can log conversations and send confirmations into a CRM or custom system, ideally after the manual habit works.' },
    ],
    related: { label: 'Read the Jobly Solutions case study', to: '/work/jobly-solutions' },
  },
  {
    day: 16, slug: 'excel-is-not-a-system', category, date,
    title: 'Excel is not a system',
    seoTitle: 'When your business has outgrown Excel: 5 warning signs',
    description: 'Excel is brilliant until it becomes a risk. Five signs your business has outgrown spreadsheets, and what to move to without jumping straight to AI.',
    summary: "Excel stops being a tool and becomes a risk when several people edit the same file, copies create different versions, files are named final-v3-updated-new, or only one person understands the formulas. The fix isn't AI. It's one place where data lives, with access rules and history. Keep Excel for thinking, not remembering.",
    takeaways: [
      'Most businesses outgrow Excel later than consultants claim.',
      'The danger point is when more than one person edits the same file.',
      'Two copies means two truths.',
      'Move the shared records to one system, and keep Excel for analysis.',
    ],
    body: `We're not here to tell you to stop using Excel. Excel is brilliant, and most businesses outgrow it far later than consultants claim. But there's a specific moment when it stops being a tool and starts being a risk.

## Five warning signs

| Sign | What it means |
| --- | --- |
| More than one person edits the same file | Changes overwrite each other |
| Someone emails a copy | Now there are two truths |
| Files named final-v3-updated-new | Nobody knows which one is current |
| Only one person understands the formulas | And they're on leave |
| You can't tell who changed what | No history, no accountability |

At that point you're not running a spreadsheet. You're running a system with no rules, no permissions and no history.

## The upgrade is not AI

It's simpler and cheaper than most owners expect:

- **One place where the data lives**, not files passed around.
- **Sensible access**, so staff see and edit only what they need.
- **History**, so you know who changed what and when.
- **Two people can work at once** without overwriting each other.

That can be a ready-made tool for standard work, or a simple custom app if your process is unusual. See [custom or off-the-shelf](/blog/custom-software-vs-off-the-shelf).

## How to move without disruption

1. List the spreadsheets people share, and what each one is for.
2. Start with the one that causes the most mistakes.
3. Clean it first: remove duplicates and agree column meanings. See [why your data is why AI isn't working](/blog/data-quality-ai).
4. Move it, and keep the old file read-only for a month.
5. Keep using Excel for reports and analysis by exporting from the new system.

> Keep Excel for thinking. Stop using it for remembering.

Want to know what a simple internal tool would cost? Try the free [Project Estimator](/tools/project-estimator).`,
    faqs: [
      { q: 'When should a business stop using Excel?', a: 'When several people edit the same file, copies create conflicting versions, only one person understands the formulas, or you cannot see who changed what.' },
      { q: 'What should replace spreadsheets in a small business?', a: 'One shared system where data lives with access rules and history, either a ready-made tool for standard work or a simple custom app for unusual processes.' },
      { q: 'Should I still use Excel after moving to a system?', a: 'Yes, for analysis and reports. Export data from the system into Excel, but keep the shared records in one place.' },
    ],
    related: { label: 'Estimate the cost of an internal tool', to: '/tools/project-estimator' },
  },
  {
    day: 17, slug: 'first-things-to-automate', category, date,
    title: 'The first three things to automate',
    seoTitle: 'What to automate first in a small business: 3 safe wins',
    description: 'If you automate one thing this year, make it one of these three: what customers wait for, what your team retypes, and what you find out too late.',
    summary: "Automate these first, in order: whatever customers wait for during business hours, like confirmations and reminders; whatever your team retypes from one screen to another; and whatever you find out about too late, like missed payments or stuck orders. Leave judgment, customer-sensitive and irreversible work for much later.",
    takeaways: [
      'Customer waiting: confirmations, quote acknowledgements and appointment reminders.',
      'Retyping: any time a person copies information from one screen to another.',
      'Late discovery: unpaid invoices, stuck orders and unanswered reviews.',
      'Leave judgment, sensitive and irreversible work for later, if ever.',
    ],
    body: `If you automate one thing this year, make it one of these three, in this order.

## 1. Whatever a customer waits for

A confirmation, a quote acknowledgement, an appointment reminder. These are low risk, customers notice immediately, and nobody is upset if a confirmation arrives instantly.

**Examples:**

- "We've received your enquiry and will reply by 4 pm."
- Booking confirmation with date, time and location.
- Reminder the day before an appointment.

## 2. Whatever your team retypes

Any moment where a person copies information from one screen into another is pure waste, and it's the most reliable thing software does.

**Examples:**

- Copying website enquiries into a CRM or sheet.
- Re-entering orders from WhatsApp into billing.
- Typing invoice details into accounting.

## 3. Whatever you find out too late

The payment that never came. The order sitting untouched for four days. The review nobody replied to. A system that tells you on day one instead of day ten is often worth more than one that saves labour.

**Examples:**

- Alert when an invoice is 7 days overdue.
- Alert when an enquiry has had no reply for 4 hours.
- Weekly list of orders that haven't moved.

## Quick planner

| Task | Type | Risk if wrong | Start? |
| --- | --- | --- | --- |
| Booking reminders | Customer waiting | Low | Yes |
| Enquiry to CRM | Retyping | Low | Yes |
| Overdue payment alerts | Late discovery | Low | Yes |
| Refund decisions | Judgment | High | No |
| Complaint replies | Customer-sensitive | High | No |

## Notice what isn't on the list

Anything requiring judgment, anything customer-sensitive, anything irreversible. Those come much later, if ever. See [three things you should never automate](/blog/what-not-to-automate).

> Start where mistakes are cheap and the benefit is obvious. Then build from there.

Want to see what these could save you? Try the free [Business Impact calculator](/tools/business-impact), or read how we approach [AI automation](/ai-automation).`,
    faqs: [
      { q: 'What should a small business automate first?', a: 'Things customers wait for, like confirmations and reminders, information your team retypes between systems, and alerts for problems found too late, like overdue payments.' },
      { q: 'What should not be automated first?', a: 'Anything that needs judgment, is customer-sensitive or cannot be undone, such as refunds, complaints and cancellations.' },
      { q: 'How do I know automation is worth it?', a: 'Measure the time a task takes today and how often it happens. Low-risk, frequent tasks usually pay back fastest.' },
    ],
    related: { label: 'See the business impact of automation', to: '/tools/business-impact' },
  },
  {
    day: 18, slug: 'what-not-to-automate', category, date,
    title: 'Three things you should never automate',
    seoTitle: 'What not to automate in your business: 3 things to keep human',
    description: 'Some things should stay slow and human: the apology, the exception and anything irreversible. Why, and how to automate around them instead.',
    summary: "Keep a person on three things no matter how good the technology gets: apologies to customers you let down, exceptions for regulars, and anything that can't be undone, like large refunds, cancellations, legal, medical or money decisions. Automate frequency, keep humans for consequence.",
    takeaways: [
      'An automated apology makes things worse, because the speed shows nobody cared.',
      'Exceptions build loyalty because a person chose to make one.',
      'Irreversible actions need a human, because mistakes can\'t be taken back.',
      'Automate frequency. Keep humans for consequence.',
    ],
    body: `Some things should stay slow and human, no matter how good the technology gets.

## 1. The apology

When you've genuinely let a customer down, an automated message makes it worse. The speed proves nobody cared enough to type it.

**Automate around it:** let software alert you to the problem quickly, like a late delivery or a bad review. Let a person write the apology.

## 2. The exception

The regular who wants something slightly outside your rules. Exceptions are where loyalty is built, and the entire value is that a person chose to make one. Automate it and you've turned a relationship into a policy.

**Automate around it:** show staff the customer's history, so they can decide quickly and well.

## 3. Anything that can't be undone

Refunds above a threshold, cancellations, anything legal or medical, anything that moves real money. Not because the machine gets it wrong often, but because when it does, there's no taking it back.

**Automate around it:** let software prepare the action, like drafting the refund or filling the form, and require a person to approve it.

## The pattern

| Automate | Keep human |
| --- | --- |
| Frequent, low-stakes tasks | Rare, high-stakes decisions |
| Confirmations and reminders | Apologies |
| Standard rules | Exceptions for loyal customers |
| Preparing a refund | Approving a large refund |
| Flagging a complaint | Responding to it |

> Automate frequency. Keep humans for consequence.

Businesses that get this backwards become efficient and unlikeable at the same time. For the other side of the list, read [the first three things to automate](/blog/first-things-to-automate), and [what AI still cannot do](/blog/what-ai-cannot-do).`,
    faqs: [
      { q: 'What business tasks should never be automated?', a: 'Apologies to customers you let down, exceptions for loyal customers, and irreversible decisions like large refunds, cancellations, and legal, medical or money matters.' },
      { q: 'How can automation help with high-stakes decisions?', a: 'By preparing them, such as drafting a refund or gathering customer history, while a person makes and approves the final decision.' },
      { q: 'Why not automate customer apologies?', a: 'Because an instant automated apology signals that nobody cared. Use automation to spot problems quickly, and let a person write the apology.' },
    ],
    related: { label: 'See how we design human handovers', to: '/ai-agents' },
  },
  {
    day: 19, slug: 'how-long-software-takes', category, date,
    title: 'How long software actually takes',
    seoTitle: 'How long does custom software take to build? A realistic rule',
    description: 'They said six weeks, it\'s month four. Where software timelines really go, and a simple rule: take the build estimate and add half again.',
    summary: "A software build estimate isn't the project timeline. Waiting for content and logins, a revision round after you see it working, and testing with real users all add time. A realistic rule: take the build estimate and add half again, so six weeks of build is a nine or ten week project.",
    takeaways: [
      'The build might be six weeks. The project usually isn\'t.',
      'Waiting for your content, logins and decisions adds weeks.',
      'The revision round after you see it working is valuable, and rarely in the estimate.',
      'Add half again to any build estimate.',
    ],
    body: `You were told six weeks and you're in month four. This is so common it's practically the default. Here's what actually happens.

## Where the time goes

| Phase | Usually in the estimate? | Typical extra time |
| --- | --- | --- |
| Build | Yes | None |
| Waiting for your content, logins and access | Rarely | One to two weeks |
| The round after you see it working | Rarely | One to three weeks |
| Testing with real people | Sometimes | One to two weeks |
| Fixes from testing and launch prep | Sometimes | About a week |

The build was six weeks. The project wasn't.

## The round nobody counts

You see it working and realise what you actually wanted. That round isn't a failure. It's the most valuable part of the project, and it's almost never in the estimate.

## Testing with real people

Real users always use it wrong in ways nobody predicted. That's normal, and it takes time to fix.

## A realistic rule

> Take the build estimate and add half again for everything around it. Six weeks of build is a nine or ten week project.

| Build estimate | Realistic project |
| --- | --- |
| 4 weeks | About 6 weeks |
| 6 weeks | About 9 to 10 weeks |
| 12 weeks | About 18 weeks |

## How to stay on schedule

1. Prepare your content, logos, logins and test data before kickoff.
2. Name one person who can approve things quickly.
3. Plan a review round from the start.
4. Book time with real users for testing.
5. Agree what counts as a change. See [why software projects go over budget](/blog/software-projects-over-budget).

A partner who quotes the real number isn't slower than the one who quotes six weeks. They're just telling you now instead of in month four. Get a realistic range with the free [Timeline Calculator](/tools/timeline).`,
    faqs: [
      { q: 'How long does it take to build custom software?', a: 'It depends on scope, but a useful rule is to add half again to the build estimate for content, reviews and testing. Six weeks of build is often a nine or ten week project.' },
      { q: 'Why do software projects take longer than estimated?', a: 'Estimates usually cover only the build. Waiting for content and access, the revision round after seeing it work, and real-user testing add weeks.' },
      { q: 'How can I keep my software project on time?', a: 'Prepare content and access before kickoff, name one quick decision-maker, plan a review round, and agree upfront what counts as a change.' },
    ],
    related: { label: 'Get a realistic project timeline', to: '/tools/timeline' },
  },
  {
    day: 20, slug: 'software-projects-over-budget', category, date,
    title: 'Why software projects go over budget',
    seoTitle: 'Why software projects go over budget, and how to prevent it',
    description: 'Overruns rarely come from slow developers. Three real causes, scope creep, waiting on decisions and integrations, and the three conversations that prevent them.',
    summary: "Software projects rarely go over budget because developers were slow. Three things usually cause it: small \"can we also just\" changes that add up, time spent waiting on your decisions, and integrations with other companies' systems that take longer than planned. Agree what counts as a change, name one decision-maker, and ask which integrations are outside your partner's control.",
    takeaways: [
      'Ten small "can we also just" requests can silently become a second project.',
      'A developer blocked for three days still costs three days.',
      'Third-party integrations are the most common surprise.',
      'Three conversations upfront prevent most overruns.',
    ],
    body: `Software projects rarely go over budget because the developers were slow. Three things cause most overruns.

## 1. Scope you added without noticing

Every "can we also just" in a call is a change. Ten small ones silently become a second project. Good partners log them and tell you the cost. Weak ones absorb them, then rush the parts you actually cared about.

## 2. Decisions waiting on you

A developer blocked for three days still costs three days. Most overruns aren't building time. They're waiting time: waiting for approvals, content, logins or answers.

## 3. Integrations

The other company's system that was supposed to connect in two days took three weeks, because their documentation was wrong or their test account didn't work. Payment gateways, government portals, accounting software and older systems are common culprits.

## The three conversations that prevent most overruns

| Conversation | Agree on |
| --- | --- |
| What counts as a change? | How changes are logged, priced and approved before work starts |
| Who decides? | One person who can approve quickly, with a target reply time |
| Which integrations are outside your control? | A buffer, and what happens if a third party is slow |

## A simple change log

| Date | Request | Effort | Cost | Approved? |
| --- | --- | --- | --- | --- |
| 3 Mar | Add WhatsApp alerts | 2 days | ₹12,000 | Yes |
| 8 Mar | Extra report | 1 day | ₹6,000 | Later |

Seeing changes written down keeps both sides honest, and stops a project quietly doubling.

## Other good habits

- Keep a short list of "phase 2" ideas instead of adding them now.
- Review progress weekly with a working demo.
- Ask for a buffer for integrations in the quote.

> Most overruns are prevented in the first week, not fixed in the last.

For timelines, read [how long software actually takes](/blog/how-long-software-takes). For a realistic starting budget, try the free [Project Estimator](/tools/project-estimator).`,
    faqs: [
      { q: 'Why do software projects go over budget?', a: 'Mostly because of small scope changes that add up, time spent waiting on client decisions, and third-party integrations that take longer than planned.' },
      { q: 'How do I prevent scope creep in a software project?', a: 'Agree upfront how changes are logged, priced and approved, keep a change log, and move new ideas to a phase 2 list.' },
      { q: 'Should a software quote include a buffer?', a: 'Yes, especially for integrations with third-party systems, which are outside your developer\'s control and often take longer than expected.' },
    ],
    related: { label: 'Estimate a realistic budget', to: '/tools/project-estimator' },
  },
  {
    day: 21, slug: 'software-maintenance-cost', category, date,
    title: 'The maintenance cost nobody quotes you',
    seoTitle: 'Software maintenance cost: what to budget every year',
    description: 'Software isn\'t a purchase, it\'s a pet. What maintenance covers, why 15 to 20% of build cost a year is a fair budget, and what to ask before you sign.',
    summary: "Software needs ongoing care: hosting, updates when platforms change, fixes for problems real users find, and changes as your business evolves. A reasonable yearly budget is 15 to 20 percent of the build cost, so a ₹5 lakh system costs roughly ₹75,000 a year to keep alive. Ask for it in writing before you sign.",
    takeaways: [
      'Hosting is small, but never zero.',
      'Platforms change, and something that worked last year can stop working.',
      'Budget about 15 to 20 percent of the build cost each year.',
      'Anyone who says maintenance is zero is inexperienced or planning to disappear.',
    ],
    body: `Here's what most quotes leave out. Software isn't a purchase. It's a pet. It needs feeding.

## What maintenance covers

| Item | Why it's needed |
| --- | --- |
| Hosting and services | Small, but never zero: servers, database, email, storage |
| Updates | Phones, browsers and the services you connect to change, and things stop working |
| Fixes | Real users find what testing didn't |
| Security | Patches, renewed certificates and dependency updates |
| Changes | Your business won't work the same way in eighteen months |

## How much to budget

A reasonable yearly figure is **15 to 20 percent of what the build cost**.

| Build cost | Yearly maintenance (15 to 20%) |
| --- | --- |
| ₹1 lakh | ₹15,000 to ₹20,000 |
| ₹5 lakh | ₹75,000 to ₹1 lakh |
| ₹10 lakh | ₹1.5 to 2 lakh |

That's not a scam. That's the honest number. Anyone who tells you zero is either inexperienced or planning to disappear.

## Common maintenance plans

- **Pay as you go:** an hourly rate for fixes and changes. Good for stable, simple systems.
- **Monthly plan:** a fixed fee covering monitoring, updates and a set number of hours.
- **Dedicated support:** a person or team on call, for business-critical systems.

## Questions to ask before you sign

1. What is the yearly maintenance cost, in writing?
2. What does it include, and what costs extra?
3. How fast will critical problems be fixed?
4. Who has access to the code, hosting and accounts if you leave? See [who actually owns your code](/blog/who-owns-your-code).

> A partner who has thought about year two is telling you they intend to be there for it.

Estimate your own numbers with the free [Maintenance Calculator](/tools/maintenance).`,
    faqs: [
      { q: 'How much does software maintenance cost per year?', a: 'A reasonable budget is 15 to 20 percent of the original build cost each year. For a ₹5 lakh system, that is roughly ₹75,000 to ₹1 lakh.' },
      { q: 'What does software maintenance include?', a: 'Hosting and services, updates when platforms change, fixes for bugs users find, security updates, and small changes as the business evolves.' },
      { q: 'Do I need a maintenance plan for my website or app?', a: 'Yes. Without one, things break as phones, browsers and connected services change. Agree the cost and response times in writing before you sign.' },
    ],
    related: { label: 'Calculate your maintenance cost', to: '/tools/maintenance' },
  },
]
