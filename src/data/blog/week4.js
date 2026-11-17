// Week 4: partners and scale, plus the two closing perspective posts. Written from the founder's 30-day series.
const date = '2026-11-17'
const category = 'Partners and scale'

export const WEEK4 = [
  {
    day: 22, slug: 'how-to-brief-a-developer', category, date,
    title: 'How to brief a developer properly',
    seoTitle: 'How to brief a software developer: a 3-sentence template',
    description: 'Most projects fail at the brief, not the build. A three-sentence brief that gets better quotes, plus what to include and the red flag to watch for.',
    summary: "A good software brief isn't a feature list. Answer three things: who uses it and what they're doing just before they open it, what has to be true for it to be worth the money, and what happens today instead. Good developers will reply with better questions, which is the real signal.",
    takeaways: [
      '"I want a dashboard, login and reports" says nothing about whether it will work.',
      'Describe the user, the measurable goal and today\'s workaround.',
      'Better questions back from a developer is a good sign.',
      'Someone who quotes a feature list without asking why plans to build exactly that and leave.',
    ],
    body: `Most software projects fail at the brief, not the build. The usual brief is a list of features: "I want a dashboard, login and reports." That tells a developer what to build and nothing about whether it will work.

## The three-sentence brief

1. **Who uses this, and what are they doing in the 30 seconds before they open it?**
2. **What has to be true for this to be worth the money?** A number, like "we stop losing two hours a day retyping orders."
3. **What happens today instead?** The workaround: WhatsApp, Excel, a notebook, a person.

## Example

> Our 6 delivery staff open this when they reach a customer's door, to confirm the drop and collect payment. It's worth it if we stop losing about 10 orders a month to missed deliveries and cut end-of-day cash reconciliation from an hour to 10 minutes. Today they call the office, and someone writes it in a notebook.

That's enough for a good developer to ask the right questions.

## What else to include

| Section | Why it helps |
| --- | --- |
| Users and how many | Shapes roles, permissions and cost |
| Must-have vs nice-to-have | Lets them quote a phase 1 |
| Systems to connect | Integrations drive cost and risk |
| Languages and devices | Telugu, Hindi, Android, desktop and so on |
| Budget range and deadline | Avoids proposals you can't afford |
| Examples you like | Saves time on design |

## The signal to watch for

Give a developer those three sentences and you'll get better questions back. That's the real signal.

If somebody takes your feature list and immediately quotes a price without asking what you're trying to fix, that's not efficiency. That's someone who intends to build exactly what you said and leave. Read [red flags when hiring an agency](/blog/agency-red-flags).

Turn your brief into a first estimate with the free [Project Estimator](/tools/project-estimator), and a realistic schedule with the [Timeline Calculator](/tools/timeline).`,
    faqs: [
      { q: 'How do I write a brief for a software developer?', a: 'Describe who uses it and what they are doing just before, the measurable result that makes it worth the money, and what happens today instead. Add users, must-haves, integrations, budget and deadline.' },
      { q: 'What should be in a software project brief?', a: 'The users, the problem and measurable goal, the current workaround, must-have versus nice-to-have features, systems to connect, languages and devices, budget range and deadline.' },
      { q: 'How do I know a developer understood my brief?', a: 'They ask questions about the problem and users before quoting. A price with no questions is a red flag.' },
    ],
    related: { label: 'Turn your brief into an estimate', to: '/tools/project-estimator' },
  },
  {
    day: 23, slug: 'agency-red-flags', category, date,
    title: 'Red flags when hiring an agency',
    seoTitle: 'Red flags when hiring a software or AI agency in India',
    description: 'An agency founder on the warning signs: agreeing to everything, quoting before questions, nothing still running, and one question that exposes them.',
    summary: "Walk away from agencies that agree to everything, quote a price before asking questions, can't show something they built that's still running with a client you can call, are vague about who does the work, or won't put maintenance in writing. Then ask what they wouldn't build for you: anyone who can't name something is selling, not advising.",
    takeaways: [
      'Every real project has trade-offs. Saying yes to everything means they haven\'t understood, or will charge later.',
      'A price in the first call is a guess.',
      'Ask for a live project and a client you can actually call.',
      'Ask directly who will do the work.',
    ],
    body: `We run an agency, so here are the signals to walk away from.

## The red flags

| Red flag | What it usually means |
| --- | --- |
| They agree to everything | They haven't understood, or plan to charge you for it later |
| They quote before they question | The price is a guess |
| Nothing they built is still running | Portfolios full of things that launched and died |
| Vague about who does the work | Your project may be passed to someone else |
| Won't put maintenance in writing | They don't plan to be there in year two |
| Pressure to sign quickly | The deal matters more than the fit |
| You won't own the code or accounts | You'll depend on them forever. See [who actually owns your code](/blog/who-owns-your-code) |

## The free test

Ask: **"What would you not build for me?"**

Anyone who can't name something, or talk you out of at least one idea, is selling, not advising.

## Green flags

- They ask about your business and users before talking about technology.
- They show live work and give you a client to call.
- They explain trade-offs and suggest a smaller phase 1.
- They put timelines, change rules and maintenance in writing.
- Your code, domain and accounts are in your name from day one.

## Questions to ask in the first call

1. Can I speak to a client whose project is live today?
2. Who exactly will work on my project?
3. What happens if a feature takes longer than planned?
4. What's not included in this price?
5. What would you not build for me, and why?

> Good agencies welcome hard questions. The ones who avoid them are telling you something.

Compare quotes fairly with [why the cheapest quote costs the most](/blog/cheapest-software-quote). You can see our own live work on [our work page](/work).`,
    faqs: [
      { q: 'What are red flags when hiring a software agency?', a: 'Agreeing to everything, quoting before asking questions, no live projects with contactable clients, vagueness about who does the work, and refusing to put maintenance in writing.' },
      { q: 'What questions should I ask a development agency?', a: 'Ask to speak to a client with a live project, who will do the work, what is not included, how changes are handled, and what they would not build for you.' },
      { q: 'How do I verify an agency\'s portfolio?', a: 'Ask for projects that are still running and a client you can call. Launched-and-abandoned projects tell you little about long-term quality.' },
    ],
    related: { label: 'See our live work', to: '/work' },
  },
  {
    day: 24, slug: 'cheapest-software-quote', category, date,
    title: 'Why the cheapest quote costs the most',
    seoTitle: 'Comparing software quotes: why the cheapest costs the most',
    description: 'The gap between quotes is usually what\'s missing, not skill. What cheap quotes leave out, and how to compare quotes fairly with the same questions.',
    summary: "When quotes range from ₹80,000 to ₹4.5 lakh, the cheap one is usually missing things rather than being efficient: testing, documentation, error handling and a proper handover. Send every vendor the same questions about failures, maintenance and exclusions. Prices converge once everyone quotes the same thing, and usually the cheap quote grows.",
    takeaways: [
      'Testing is usually the first thing cut from cheap quotes.',
      'No documentation means the next developer rebuilds instead of continuing.',
      'Cheap builds often work only when everything goes right.',
      'Ask all vendors the same questions, then compare.',
    ],
    body: `You have three quotes: ₹80,000, ₹2 lakh and ₹4.5 lakh. The instinct is that the expensive one is padded. Sometimes it is. More often, the cheap one is simply missing things.

## What cheap quotes usually leave out

| Missing piece | What it costs you later |
| --- | --- |
| Testing | Bugs your customers find for you |
| Documentation | The next developer rebuilds instead of continuing |
| Error handling | It works when everything goes right, and customers don't behave that way |
| Handover | You're permanently dependent on one person answering your calls |
| Security basics | Data leaks and rushed fixes |
| Maintenance | Surprise bills once it's live |

## How to compare properly

Send all three vendors the same questions:

1. What happens when this fails? A payment fails, a message doesn't send, a user enters something wrong.
2. Who can maintain it if you're unavailable?
3. What's not included in this price?
4. What testing will you do, and will I see it?
5. Will I own the code, domain and accounts?
6. What does maintenance cost per year?

The prices will converge once everyone is quoting the same thing, and usually the cheap quote grows.

## A fair comparison table

| | Vendor A | Vendor B | Vendor C |
| --- | --- | --- | --- |
| Price | ₹80,000 | ₹2 lakh | ₹4.5 lakh |
| Testing included? | | | |
| Documentation? | | | |
| Handover and ownership? | | | |
| Yearly maintenance | | | |
| What's excluded? | | | |

## When cheap is fine

A cheap quote can be right for a simple, low-risk project, like a basic website or a small internal tool, as long as you know what's missing and accept it.

> Cheap software is rarely cheaper. It's paid later, in a currency you didn't plan for.

Check a realistic range before talking to anyone with the free [Project Estimator](/tools/project-estimator), and budget upkeep with the [Maintenance Calculator](/tools/maintenance).`,
    faqs: [
      { q: 'Why are software development quotes so different?', a: 'Usually because cheaper quotes leave out testing, documentation, error handling, handover or maintenance. Compare quotes only after asking every vendor the same questions.' },
      { q: 'How do I compare software development quotes?', a: 'Ask each vendor what happens when things fail, who can maintain it, what is excluded, what testing is included, who owns the code and the yearly maintenance cost.' },
      { q: 'Is the cheapest software quote a bad choice?', a: 'Not always. For simple, low-risk projects it can be fine, as long as you know exactly what is missing and accept the risk.' },
    ],
    related: { label: 'Get an independent cost range', to: '/tools/project-estimator' },
  },
  {
    day: 25, slug: 'who-owns-your-code', category, date,
    title: 'Who actually owns your code?',
    seoTitle: 'Who owns your software code? A 4-point ownership check',
    description: 'If your developer vanished tomorrow, could you keep running? Check code, domain, hosting and access today, and why ownership must be in writing.',
    summary: "If your developer disappeared tomorrow, could your business carry on? Check four things today: the code is in an account you own, the domain and hosting are registered to you, your business owns its database and cloud accounts, and you could get full access quickly. In India, copyright in commissioned work generally needs a written assignment, so get it in the contract.",
    takeaways: [
      'Code should live in a repository your business owns, not on someone\'s laptop.',
      'Domain, hosting, database and cloud accounts should be in your business\'s name.',
      'Good partners set it up this way by default.',
      'Ownership should be assigned in writing in your contract.',
    ],
    body: `An uncomfortable question: if the person who built your system disappeared tomorrow, could your business carry on?

## The four-point check

| Check | Good answer | Warning sign |
| --- | --- | --- |
| Code | In a GitHub or GitLab account your business owns | "It's on my laptop" or only in their account |
| Domain and hosting | Registered to your business, with your email | Registered to the developer "for convenience" |
| Accounts | Your business owns the database, cloud and app store accounts | You're a guest on theirs |
| Access | You could get every login and file today | "I'll send it when the project is finished" |

Spend 30 minutes checking these now. It's worth more than any contract clause later.

## Why the contract matters

In India, under the Copyright Act, 1957, the author of a work is generally its first owner. Employees' work done in the course of employment usually belongs to the employer, but an outside developer or agency is different: ownership usually needs to be assigned to you in writing. A good contract states that the code and related work belong to you once paid for. This isn't legal advice, so ask a lawyer to check your contract.

## What to put in writing

- Ownership of the custom code passes to you on payment.
- Your business owns the domain, hosting and all service accounts.
- The developer hands over credentials and documentation at the end.
- Which pre-existing tools or libraries the developer keeps, and your licence to use them.

## This isn't about distrust

Good partners set it up this way by default, because it protects them too. There's no argument later about who owns what.

> The ones who resist are telling you the dependency is the business model.

This is how we work: in our contracts, ownership passes to the client on full payment, and accounts are created in the client's name. See [red flags when hiring an agency](/blog/agency-red-flags) for other things to check.`,
    faqs: [
      { q: 'Who owns the code when you hire a developer in India?', a: 'Generally the author owns copyright unless it is assigned in writing. For outside developers and agencies, make sure your contract assigns ownership of the custom code to your business. Ask a lawyer to check it.' },
      { q: 'Should my domain and hosting be in my name?', a: 'Yes. Register your domain, hosting, database and cloud accounts to your business, so you are never locked out if a developer leaves.' },
      { q: 'What should I get from a developer at handover?', a: 'Access to the code repository, all logins and accounts in your name, documentation, and a list of third-party services and licences used.' },
    ],
    related: { label: 'See how we work with clients', to: '/about' },
  },
  {
    day: 26, slug: 'scaling-to-multiple-locations', category, date,
    title: 'One outlet to five: what breaks first',
    seoTitle: 'Opening a second branch? What breaks first, and how to prepare',
    description: 'The second location is where informal systems die. What breaks in order, pricing, stock, training and visibility, and what to write down before you expand.',
    summary: "When a business opens its second location, the informal systems that worked at one site break in order: pricing, stock, staff knowledge and the owner's visibility. Write down everything that lives in your head before you duplicate, because you're about to duplicate the gaps too. The systems work starts now, not after branch two opens.",
    takeaways: [
      'One location runs on people knowing things. Two can\'t.',
      'Pricing breaks first: unrecorded discounts at one branch.',
      'Stock, staff training and your own visibility break next.',
      'Write it down before you duplicate.',
    ],
    body: `One location runs on people knowing things. You can see the whole operation, everyone hears the same instruction, and problems get solved by walking across the room.

Then you open the second. Here's what breaks, in order.

## What breaks, and how to prepare

| What breaks | What happens | Fix before you open |
| --- | --- | --- |
| Pricing | Someone gives a discount at one branch that nobody recorded | One price list in one system, with discount rules |
| Stock | Each place guesses instead of seeing the other | Shared stock records, or at least a daily count |
| Staff knowledge | Training by standing next to you doesn't reach the new branch | Written checklists and short training notes |
| Your visibility | You find out about problems days later | A short daily or weekly report from each branch |

## The mistake

Waiting for branch two to open before fixing this. Everything that lives in your head has to be written down before you duplicate, because you're about to duplicate the gaps too.

## A pre-expansion checklist

- [ ] One price list, with who can approve discounts.
- [ ] Opening and closing checklists.
- [ ] How to handle the five most common customer complaints.
- [ ] Stock counted and recorded the same way at every site.
- [ ] One place for orders and enquiries across branches.
- [ ] Four numbers each branch reports every week. See [the one report to read every Monday](/blog/weekly-business-report).

## Do you need software?

Not always at first. A written process and a shared sheet with rules can work for two locations. By three to five locations, most businesses need one system for orders, stock and reporting, which is exactly where [moving off Excel](/blog/excel-is-not-a-system) pays back.

> If you're planning a second location, the systems work starts now, not after.

Plan the build with the free [Project Estimator](/tools/project-estimator).`,
    faqs: [
      { q: 'What should I prepare before opening a second branch?', a: 'Write down pricing and discount rules, opening and closing checklists, complaint handling and stock processes, and set up weekly reporting from each branch.' },
      { q: 'What usually goes wrong when a business expands?', a: 'Pricing becomes inconsistent, stock gets out of sync, training does not reach new staff and the owner loses visibility of problems.' },
      { q: 'Do I need software to run multiple locations?', a: 'For two locations, written processes and shared records can work. By three to five, most businesses benefit from one system for orders, stock and reporting.' },
    ],
    related: { label: 'Estimate a multi-location system', to: '/tools/project-estimator' },
  },
  {
    day: 27, slug: 'weekly-business-report', category, date,
    title: 'The one report to read every Monday',
    seoTitle: 'The 4-number weekly report every business owner needs',
    description: 'You don\'t need a dashboard, you need four numbers: enquiries and reply speed, conversion, money owed over 30 days, and one number for your business.',
    summary: "Most owners need four numbers every Monday, not a dashboard: new enquiries and how many got a reply within a day, the percentage that turned into business, money owed for more than 30 days, and one operating number specific to you, like no-shows or repeat rate. If nobody can produce these in ten minutes, that's the real finding.",
    takeaways: [
      'Slow replies are where most money leaks.',
      'If conversion falls while enquiries rise, it isn\'t a marketing problem.',
      'Profitable businesses still fail when money owed piles up.',
      'Four numbers you read beat forty you ignore.',
    ],
    body: `Most owners either have no reporting, or a dashboard with forty numbers nobody reads. You need four, every Monday, on one screen.

## The four numbers

| Number | What it tells you | Warning sign |
| --- | --- | --- |
| 1. New enquiries last week, and how many got a reply within a day | Whether demand is being handled | Many enquiries, slow replies |
| 2. How many turned into business, as a percentage | Whether sales is working | Rising enquiries, falling conversion |
| 3. Money owed for more than 30 days | Cash risk | Growing every week |
| 4. One number specific to you | The health of your operation | Moving the wrong way |

### 1. Enquiries and reply speed

The second half matters most. Slow replies are where most money leaks, because people who wait often book someone else.

### 2. Conversion

If enquiries rise and conversion falls, your problem isn't marketing. It's follow-up, pricing or how you handle enquiries.

### 3. Money owed over 30 days

Growing businesses can go under while profitable, because cash is stuck with customers. Watch this every week.

### 4. Your one operating number

Pick one and watch it:

- **Clinics:** no-show rate.
- **Restaurants:** average bill.
- **Service businesses:** repeat customer rate.
- **Agencies:** projects late versus on time.

## Example Monday report

| Week | Enquiries | Replied in 1 day | Converted | Owed over 30 days | No-shows |
| --- | --- | --- | --- | --- | --- |
| This week | 42 | 35 (83%) | 11 (26%) | ₹1.8 lakh | 6% |
| Last week | 38 | 36 (95%) | 12 (32%) | ₹1.2 lakh | 5% |

Reading it: more enquiries, but slower replies and lower conversion, and money owed is climbing. That's where to act this week.

> If nobody can produce these four numbers in under ten minutes, that's the real finding.

If your data is scattered across WhatsApp and spreadsheets, start with [the hidden cost of running on WhatsApp](/blog/running-business-on-whatsapp). Getting these numbers automatically is often part of the [custom software](/ai-software-development) we build.`,
    faqs: [
      { q: 'What metrics should a small business track weekly?', a: 'New enquiries and how many got a reply within a day, the conversion percentage, money owed for more than 30 days, and one operating number specific to your business.' },
      { q: 'Do small businesses need a dashboard?', a: 'Not a big one. Four numbers reviewed every Monday usually tell you more than forty numbers on a dashboard nobody reads.' },
      { q: 'Why track money owed over 30 days?', a: 'Because a business can be profitable on paper and still run out of cash if customers pay late. Watching overdue money weekly catches it early.' },
    ],
    related: { label: 'See custom reporting and software', to: '/ai-software-development' },
  },
  {
    day: 28, slug: 'build-the-boring-thing-first', category, date,
    title: 'Build the boring thing first',
    seoTitle: 'Build the boring thing first: foundations before AI features',
    description: 'Everyone wants the exciting feature. The boring one makes the money. Why customer records and one order list come before AI assistants and apps.',
    summary: "Every project has an exciting feature, like an AI assistant or an app, and a boring one, like a proper customer record or getting every order into one place. Build the boring one first. The exciting feature usually depends on it, and it's the part that keeps paying.",
    takeaways: [
      'An AI assistant with no clean customer record has nothing to be smart about.',
      'Foundations rarely impress, but everything useful is built on them.',
      'With budget for one thing, build the foundation.',
      'The exciting feature will be cheaper and better a quarter later.',
    ],
    body: `Every project has an exciting feature and a boring one. The exciting one is the AI assistant, the app, the thing you describe to friends. The boring one is a proper record of customers, or getting every order into one place.

Everybody wants to start with the exciting part. It fails consistently, because the exciting feature usually depends on the boring one.

## Exciting features and what they depend on

| Exciting feature | Boring foundation it needs |
| --- | --- |
| AI assistant that answers customers | Accurate prices, policies and FAQs in one place |
| Personalised offers | A clean customer record with purchase history |
| Customer app | Reliable orders, stock and payments behind it |
| Smart dashboard | Data recorded the same way every day |
| Automated reminders | Correct phone numbers and appointment records |

## Why the boring thing wins

- **Everything is built on it.** Nobody says their customer database changed their life, but every useful thing afterwards depends on it.
- **It keeps paying.** Clean records save time every day, with or without AI.
- **It makes the exciting thing cheaper.** Less cleanup, fewer surprises, faster builds.
- **It teaches you what you need.** After a quarter of good data, you'll know whether you actually want the exciting feature.

## A practical order

1. One place for customers, with no duplicates.
2. One place for orders or bookings.
3. One weekly report from that data. See [the one report to read every Monday](/blog/weekly-business-report).
4. Then the exciting feature, built on solid ground.

> When you have budget for one thing, build the foundation and let the exciting feature wait a quarter. It will be cheaper then, and it will work better.

For why this matters so much for AI, read [your data is why AI isn't working](/blog/data-quality-ai).`,
    faqs: [
      { q: 'What should I build first in a software project?', a: 'The foundation, such as a clean customer record and one place for orders or bookings. Exciting features like AI assistants depend on it.' },
      { q: 'Why do AI features fail without good data?', a: 'Because AI answers from the information it has. If customer records, prices or orders are messy, the AI gives confident wrong answers.' },
      { q: 'Is it worth building a CRM before AI?', a: 'Usually yes. A clean customer record saves time on its own and makes any later AI project faster, cheaper and more accurate.' },
    ],
    related: { label: 'Read about AI integration done right', to: '/ai-integration' },
  },
  {
    day: 29, slug: 'what-to-automate-first-plan', category: 'Perspective', date,
    title: "What I'd automate if I ran your business",
    seoTitle: "A founder's 4-week plan to automate a small business",
    description: 'A deliberately unambitious four-week plan from an AI agency founder: write it down, one place for enquiries, fast replies, then buy one tool.',
    summary: "If I ran a normal business tomorrow, I'd spend week one writing down how we really work, week two getting every enquiry into one place, and week three making sure nobody waits more than an hour for a reply. Only in week four would I buy one tool, for the single most repetitive task. There's no AI in the first three weeks.",
    takeaways: [
      'Week 1: write down how things actually happen, a page per process.',
      'Week 2: get every enquiry into one place.',
      'Week 3: nobody waits more than an hour for a reply in working hours.',
      'Week 4: buy one tool for the single most repetitive task.',
    ],
    body: `Forget my job for a second. If I stopped being the technology person and ran a normal business tomorrow, here's the order I'd go in, and it's deliberately unambitious.

## The four-week plan

| Week | Do this | Technology needed |
| --- | --- | --- |
| 1 | Write down how we actually do things: a page per process, including the parts that embarrass us | Pen and paper |
| 2 | Get every enquiry into one place, whatever that place is | A shared sheet or simple CRM |
| 3 | Make sure nobody waits more than an hour for a reply in working hours | A person with a reminder |
| 4 | Buy one tool, for the single most repetitive task | One tool |

## Week 1: write it down

Not a manual. A page per process, describing how it really happens, including the shortcuts and the bits that go wrong. This alone usually reveals two or three fixes. See [AI won't fix a broken process](/blog/ai-wont-fix-a-broken-process).

## Week 2: one place for enquiries

Calls, WhatsApp, Instagram, website, walk-ins: every enquiry ends up in one list with a name, a need, an owner and a next step. See [the hidden cost of running on WhatsApp](/blog/running-business-on-whatsapp).

## Week 3: fast replies

Nobody waits more than an hour during working hours, even if that's a person with a reminder rather than software. Reply speed is one of the biggest things owners can improve cheaply.

## Week 4: one tool

Only then would I look at tools, and I'd buy one thing for the single most repetitive task. Test it for a week first. See [how to test any AI tool](/blog/how-to-test-ai-tools).

## Notice what's missing

There's no AI in the first three weeks. Most of what makes a business feel chaotic isn't solved by software. It's solved by deciding things and writing them down. Software just makes the decision stick.

> Decide, write it down, then automate. In that order.

When you're ready for week four, the free [Business Impact calculator](/tools/business-impact) helps you pick the task worth automating.`,
    faqs: [
      { q: 'How should a small business start with automation?', a: 'Write down how processes really work, get every enquiry into one place, make sure replies are fast, then automate the single most repetitive task.' },
      { q: 'Do I need AI to organise my business?', a: 'Usually not at first. Most chaos is solved by deciding processes and writing them down. Software and AI help once those decisions exist.' },
      { q: 'What is the most important first step in digitising a business?', a: 'Getting every enquiry into one place with an owner and a next step, so nothing is lost across calls, WhatsApp and walk-ins.' },
    ],
    related: { label: 'Find the task worth automating', to: '/tools/business-impact' },
  },
  {
    day: 30, slug: 'technology-should-work-for-your-business', category: 'Perspective', date,
    title: 'Technology should work for your business',
    seoTitle: 'How to decide if a technology is worth it for your business',
    description: 'Every piece of technology is a trade: money and attention now for time, accuracy or reach later. The one question that decides whether it\'s worth it.',
    summary: "Every piece of technology is a trade: money and attention now, for time, accuracy or reach later. The only question that matters is whether that trade is good for your specific business this year, not whether it's modern or a competitor has it. The businesses that win usually pick two or three things and implement them properly.",
    takeaways: [
      'Not an app, not AI on a broken process, not the cheapest quote. Those were the lessons of this series.',
      'Judge technology as a trade, not an upgrade.',
      'Ignore "everyone is doing it". Ask if it\'s good for you, this year.',
      'If someone can\'t explain plainly what you get for your money, keep your money.',
    ],
    body: `This series has mostly told you not to buy things. Not an app. Not AI on a broken process. Not the cheapest quote. Here's the thread running through all of it.

## Technology is a trade

Every piece of technology trades money and attention now for time, accuracy or reach later. The only question that matters is whether that trade is good for your specific business this year.

Not whether it's modern. Not whether a competitor has it. Not whether someone with a slide deck says the industry is moving.

## The trade test

| Question | Good sign |
| --- | --- |
| What does it cost, including setup, running and staff time? | You know the full number |
| What does it give back: time, accuracy or reach? | You can measure it |
| How soon? | Within months, not years |
| What has to change for it to work? | Your process and data are ready |
| What happens if it fails? | You can undo it cheaply |

## What winning businesses do

The businesses we watch win are rarely the most advanced. They're the ones that chose two or three things, implemented them properly and ignored everything else.

## The series in one page

1. [Your business probably doesn't need an app](/blog/does-my-business-need-an-app).
2. [AI won't fix a broken process](/blog/ai-wont-fix-a-broken-process).
3. [What AI automation actually costs](/blog/ai-automation-cost-india).
4. [What AI can actually do for you today](/blog/what-ai-can-do-for-business), and [what it still cannot do](/blog/what-ai-cannot-do).
5. [The first three things to automate](/blog/first-things-to-automate).
6. [The maintenance cost nobody quotes you](/blog/software-maintenance-cost).
7. [Red flags when hiring an agency](/blog/agency-red-flags).
8. [Build the boring thing first](/blog/build-the-boring-thing-first).

> Technology should work for your business, not the other way around. And if anyone in this industry, us included, can't explain in plain language what you get for your money, you should keep your money.

Want a plain-language answer for your own business? Start with the free [Business Impact calculator](/tools/business-impact), or [read the whole blog](/blog).`,
    faqs: [
      { q: 'How do I know if a technology is worth it for my business?', a: 'Treat it as a trade: compare the full cost, including setup, running costs and staff time, with the time, accuracy or reach it gives back, and how soon.' },
      { q: 'Should I adopt new technology because competitors use it?', a: 'No. Adopt it only if the trade is good for your business this year. Many winning businesses use two or three tools well rather than many poorly.' },
      { q: 'What should a technology partner explain before I buy?', a: 'In plain language: what you get for your money, what it costs to run, what has to change for it to work, and what happens if it fails.' },
    ],
    related: { label: 'Calculate the business impact', to: '/tools/business-impact' },
  },
]
