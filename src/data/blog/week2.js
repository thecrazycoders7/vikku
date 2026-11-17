// Week 2: the AI reality check. Written from the founder's 30-day series, expanded into full guides.
const date = '2026-11-17'
const category = 'AI reality check'

export const WEEK2 = [
  {
    day: 8, slug: 'what-ai-can-do-for-business', category, date,
    title: 'What AI can actually do for you today',
    seoTitle: 'What AI can actually do for a small business today',
    description: 'Forget the hype. Four jobs AI does reliably in an ordinary business today, with examples, and the simple test for where AI pays for itself.',
    summary: "Today AI reliably does four jobs in an ordinary business: reading documents, answering the same questions again and again, writing first drafts, and sorting or routing enquiries. They have one thing in common: high volume, low judgment, and mistakes that are easy to spot. That's where AI pays for itself.",
    takeaways: [
      'Reading documents: pulling numbers from invoices, bills and forms.',
      'Answering repeat questions: timings, prices, availability, directions.',
      'First drafts that a person fixes in two minutes instead of writing in twenty.',
      'Sorting and routing: which enquiry is urgent and who should handle it.',
    ],
    body: `Ignore what you've been told AI will do eventually. Here's what it does reliably today, in an ordinary business.

## Four jobs AI does well right now

| Job | Examples | Why it works |
| --- | --- | --- |
| Reading documents | Invoices, bills, forms, delivery notes, ID proofs | Pulls the numbers out and puts them where they belong. Boring, and it works. |
| Answering repeat questions | Timings, prices, availability, directions, documents needed | Customers get an instant answer, and staff stop repeating themselves |
| First drafts | Quotes, replies, product descriptions, follow-up messages | A person edits in two minutes instead of writing in twenty |
| Sorting and routing | Which enquiry is urgent, which team, what needs a follow-up today | Nothing waits in the wrong inbox |

## The test for where AI pays for itself

These four have something in common. They are:

1. **High volume**: the task happens many times a day or week.
2. **Low judgment**: there's usually a right answer.
3. **Easy to check**: a person can spot a wrong answer quickly.

That's the zone where AI pays for itself. The further you move from it, toward rare, high-judgment or hard-to-check decisions, the more you pay to supervise a machine.

## Real examples

- **A clinic** answers "Is the doctor available today?" and books the slot, while anything medical goes to staff. That's how our [AI receptionist for hospitals](/products/hospital-receptionist) is designed.
- **A staffing agency** reads timesheets and flags the ones that don't match the schedule.
- **A distributor** reads supplier invoices and enters them, with a person approving totals above a limit.
- **A service business** drafts replies to common enquiries for a person to approve and send.

## How to choose your first AI job

Pick the task that is most repetitive, and score it:

- How many times a week does it happen?
- How long does it take each time?
- What does a mistake cost?
- How easily would you notice a mistake?

High frequency, low cost of error and easy checking make the best first project. Then run [a one-week test](/blog/how-to-test-ai-tools) before you commit.

> AI is best at the boring work. That's a good thing: boring work is where your team's time quietly disappears.

See what an AI project could save you with the free [Business Impact calculator](/tools/business-impact).`,
    faqs: [
      { q: 'What can AI do for a small business?', a: 'Reliably today: read documents like invoices and forms, answer repeat customer questions, write first drafts, and sort or route enquiries to the right person.' },
      { q: 'Where does AI pay for itself?', a: 'In tasks that are high volume, low judgment and easy to check. The further a task is from that, the more time you spend supervising the AI.' },
      { q: 'What is a good first AI project?', a: 'The most repetitive task in your week where mistakes are cheap and easy to spot, such as answering common questions or reading standard documents.' },
    ],
    related: { label: 'Calculate the business impact of AI', to: '/tools/business-impact' },
  },
  {
    day: 9, slug: 'what-ai-cannot-do', category, date,
    title: 'What AI still cannot do',
    seoTitle: 'What AI still cannot do: 4 limits every business should know',
    description: 'An AI company on where AI falls over: accountability, reading the room, unwritten knowledge and irreversible decisions. Know these before you buy.',
    summary: "AI still can't be accountable when something goes wrong, can't read the emotion behind a request, can't use knowledge that was never written down, and shouldn't make irreversible decisions without a person. Know these four limits and you'll buy the right things.",
    takeaways: [
      '"The system decided" is not an answer a customer will accept. A person has to own outcomes.',
      'AI answers the literal question and can miss what the customer actually means.',
      'If knowledge only lives in someone\'s head, no model can learn it.',
      'Payments, cancellations and anything legal need a human check.',
    ],
    body: `We build AI systems, so take this seriously: there are things AI still does badly. Knowing them will save you money and embarrassment.

## 1. It can't be accountable

When something goes wrong, a person has to own it. "The system decided" is not an answer your customer will accept, and in many industries it's not one a regulator will accept either.

**What to do:** name a person responsible for every automated process, and give customers a way to reach them.

## 2. It can't read the room

A customer is technically asking about a refund but is actually about to leave you forever. AI will answer the refund question perfectly and lose the customer.

**What to do:** route complaints, cancellations and unhappy customers to a person. Teach the AI to spot words that signal frustration and hand over early.

## 3. It can't work from what was never written down

Most of what makes your business good lives in people's heads: which customer needs extra care, which supplier is always late, which exception is fine. If it isn't written anywhere, no model can learn it.

**What to do:** write down your rules, FAQs and exceptions before any AI project. That work also helps new staff. See [why your data is why AI isn't working](/blog/data-quality-ai).

## 4. It shouldn't decide anything irreversible

Payments, cancellations, refunds above a limit, anything legal or medical. Not because AI gets these wrong often, but because when it does, there's no taking it back.

**What to do:** let AI prepare these, like drafting the refund or filling the form, and let a person approve.

## Summary

| Limit | Keep a human on | Let AI help by |
| --- | --- | --- |
| Accountability | Owning outcomes and complaints | Logging what happened and why |
| Reading the room | Unhappy or high-value customers | Flagging frustration early |
| Unwritten knowledge | Exceptions and judgment calls | Using rules once you write them down |
| Irreversible actions | Payments, cancellations, legal, medical | Preparing the action for approval |

> Know these four limits and you'll buy the right things. Ignore them and you'll spend a lot of money being disappointed.

This is how we design our own systems, including the [AI hospital receptionist](/products/hospital-receptionist), which hands emergencies and medicine questions to staff instead of answering them.`,
    faqs: [
      { q: 'What are the limitations of AI for business?', a: 'AI cannot be accountable for outcomes, often misses the emotion behind a request, cannot use knowledge that was never written down, and should not make irreversible decisions without a person.' },
      { q: 'Should AI handle refunds and cancellations?', a: 'AI can prepare them, but a person should approve anything irreversible, such as payments, refunds above a limit, cancellations, or legal and medical decisions.' },
      { q: 'How do I keep humans in control of AI?', a: 'Name an owner for each automated process, hand unhappy or high-value customers to a person, and require approval for irreversible actions.' },
    ],
    related: { label: 'See how our AI agents keep humans in the loop', to: '/ai-agents' },
  },
  {
    day: 10, slug: 'why-chatbots-annoy-customers', category, date,
    title: 'Why your chatbot annoys customers',
    seoTitle: 'Why your chatbot annoys customers, and how to fix it',
    description: 'Most annoying chatbots fail in the same three ways. How to fix a bot that guesses, traps customers, or doesn\'t know your business, with a checklist.',
    summary: "Chatbots annoy customers for three reasons: they guess instead of saying \"I don't know\", they give no way to reach a person, and they were never taught your actual business. The technology is rarely the problem. The preparation is.",
    takeaways: [
      'A bot that says "I\'m not sure, let me get someone" beats one that is confidently wrong.',
      'Every bot needs a visible way to reach a human within the first 30 seconds.',
      'Write down the 50 real questions customers ask, with real answers.',
      'Review conversations weekly and fix the answers that failed.',
    ],
    body: `Every annoying chatbot fails the same three ways. The fixes are mostly preparation, not technology.

## 1. It can't say "I don't know"

So it guesses, confidently, and now your customer has wrong information with your name on it. A bot that says "I'm not sure, let me get someone" is better than one that is confidently wrong.

**Fix:** set the bot to answer only from your approved information, and to hand over when it isn't sure.

## 2. There's no way out

The customer wants a human and there's no exit. So they wait, and then they stop being your customer.

**Fix:** every bot needs a visible escape hatch in the first 30 seconds, like "Talk to a person", a phone number or a WhatsApp handover. Tell customers when someone will reply.

## 3. It was never taught your business

It knows generic answers because nobody sat down and wrote the 50 real questions customers ask, with real answers. That work is unglamorous, and it's the entire difference between a bot people thank and a bot people screenshot to complain about.

**Fix:** collect real questions from calls, WhatsApp and email. Write a clear answer for each, including prices, timings, policies and what you don't do.

## The chatbot checklist

| Check | Yes? |
| --- | --- |
| Answers only from information you approved | |
| Says when it doesn't know, and hands over | |
| A person is reachable within 30 seconds | |
| Trained on your 50 most common real questions | |
| Says it's an automated assistant | |
| Someone reviews conversations every week | |
| Works in the languages your customers use | |

## Measure whether it works

Look at these every week:

- How many conversations ended with the customer's question answered.
- How many asked for a human, and why.
- The questions the bot got wrong, so you can fix the answer.

> The technology is rarely the problem. The preparation is.

Before buying a bot, check whether you need AI at all. Many "chatbot" problems are simple rules problems. See [AI agent or automation: the cheaper answer](/blog/ai-agent-vs-automation). We also build [AI voice and chat agents](/ai-voice-agents) with these handovers built in.`,
    faqs: [
      { q: 'Why do customers hate chatbots?', a: 'Usually because the bot guesses wrong answers, offers no way to reach a person, or does not know the business. Fixing those three is mostly preparation, not technology.' },
      { q: 'How do I make my chatbot better?', a: 'Train it on the real questions customers ask, let it say when it is unsure and hand over, add a visible way to reach a person, and review conversations weekly.' },
      { q: 'Should a chatbot say it is a bot?', a: 'Yes. Telling customers they are talking to an automated assistant builds trust, and it should hand over to a person whenever they ask.' },
    ],
    related: { label: 'Explore AI voice and chat agents', to: '/ai-voice-agents' },
  },
  {
    day: 11, slug: 'ai-agent-vs-automation', category, date,
    title: 'AI agent or automation: the cheaper answer',
    seoTitle: 'AI agent vs automation: which does your business need?',
    description: 'Half of what\'s sold as AI doesn\'t need AI. The difference between rules-based automation and AI agents, with examples and a simple decision test.',
    summary: "Use plain automation when the input is structured and the response is predictable: it's cheaper, faster and does exactly the same thing every time. Use AI only when the input is messy and the response needs judgment, like a Hinglish message with a typo. Most business problems are rules problems wearing an AI costume.",
    takeaways: [
      'Automation follows rules you set: when a form arrives, add the row, send the email, notify the team.',
      'AI is for messy input that needs judgment.',
      'If the input is structured and the answer predictable, AI only adds cost and unpredictability.',
      'A good partner will talk you out of AI at least once.',
    ],
    body: `Someone is selling you an AI agent. Before you buy, understand the difference, because it decides the price.

## The difference

| | Automation (rules) | AI agent |
| --- | --- | --- |
| How it works | Follows steps you define | Interprets input and decides what to do |
| Best input | Structured: forms, buttons, fixed fields | Messy: free text, voice, documents, mixed languages |
| Behaviour | Same result every time | Can vary, needs testing and limits |
| Running cost | Low and predictable | Usage-based, often monthly |
| Example | Form arrives, then add a row, email the customer and notify the team | A WhatsApp message in Hinglish with a typo, asking two things at once |

## The test

Ask two questions about the task:

1. **Is the input structured?** Fixed fields, dropdowns and buttons.
2. **Is the response predictable?** The same input always needs the same action.

If both are yes, use automation. AI would add cost, unpredictability and a monthly bill for nothing.

If the input is messy, like free-text messages, voice, scanned documents or mixed languages, and the response needs judgment, that's where AI earns its cost.

## Examples

- **Use automation:** sending a booking confirmation, adding a lead to your CRM, reminding a customer about a payment due date, moving an order to the next stage.
- **Use AI:** understanding a free-text enquiry and routing it, reading an invoice photo, answering varied questions on a call, summarising a long email thread.
- **Use both:** AI reads the message and works out what the customer wants, then rules handle the steps.

## The part nobody selling to you will say

Most business problems are rules problems wearing an AI costume. Often the cheapest fix is a better form: replace a free-text box with a few dropdowns, and suddenly you don't need AI at all.

> Use rules where rules work. Save AI for genuine mess. A good partner will talk you out of AI at least once.

Learn more about each approach on our [AI automation](/ai-automation) and [AI agents](/ai-agents) pages, or see what automation should cost in [what AI automation actually costs](/blog/ai-automation-cost-india).`,
    faqs: [
      { q: 'What is the difference between an AI agent and automation?', a: 'Automation follows fixed rules you set and does the same thing every time. An AI agent interprets messy input, like free text or voice, and decides what to do.' },
      { q: 'When do I need AI instead of automation?', a: 'When the input is messy, such as free-text messages, voice or documents, and the response needs judgment. For structured input with predictable responses, plain automation is cheaper and more reliable.' },
      { q: 'Is AI automation more expensive than normal automation?', a: 'Usually yes. AI has usage-based running costs and needs more testing. Rules-based automation is cheaper to run and behaves the same way every time.' },
    ],
    related: { label: 'Compare AI automation services', to: '/ai-automation' },
  },
  {
    day: 12, slug: 'data-quality-ai', category, date,
    title: "Your data is why AI isn't working",
    seoTitle: "Why your AI project isn't working: it's your data",
    description: 'AI projects stall on messy data, not bad models. The most common data problems in small businesses, and a one-week cleanup plan before any AI project.',
    summary: "AI projects usually stall because of messy data, not a bad model. Duplicate customers, prices in old WhatsApp messages and missing phone numbers make AI give confident wrong answers. Clean your messiest list of records before your first AI project: that's the real starting line.",
    takeaways: [
      'A model answering from wrong information gives confidently wrong answers.',
      'Most of the work in any AI project is cleaning what you already have.',
      'Decide which system is the source of truth when two disagree.',
      'Write down the rules that live in someone\'s head.',
    ],
    body: `An AI project stalls and everyone blames the model. It's almost never the model.

It's that the same customer exists four times with four spellings. Prices live in a WhatsApp message from March. Half the records have an empty phone number and nobody noticed. A model built on that will confidently give wrong answers, because it's answering correctly from wrong information.

## Common data problems

| Problem | Example | Why it hurts AI |
| --- | --- | --- |
| Duplicates | "Ravi Kumar", "Ravi K", "Ravi Kumar (old)" | The AI can't tell which is right |
| Scattered sources | Prices in WhatsApp, Excel and a printed list | It may quote the wrong one |
| Missing fields | No phone, no email, no address | It can't follow up or match records |
| Inconsistent formats | Dates as 5/3, 05-03-2026 and March 5 | Sorting and reminders break |
| Unwritten rules | "We never deliver to that area on Sundays" | It doesn't know the rule exists |

## The one-week cleanup plan

1. **Day 1: pick one list.** Your messiest important list, usually customers or products.
2. **Day 2: choose the source of truth.** When two systems disagree, which one wins? Write it down.
3. **Day 3: remove duplicates.** Merge records with the same phone number or email.
4. **Day 4: fill the gaps.** Find missing phone numbers and emails for active customers first.
5. **Day 5: standardise formats.** One date format, one way of writing names and addresses.
6. **Day 6: write down the rules** that live in people's heads.
7. **Day 7: set a habit** so it stays clean, such as required fields on forms and one person responsible.

## Why nobody sells this

Cleaning data doesn't demo well. Nobody posts a video of a deduplicated customer list. But skip it and nothing built on top of it works.

## Signs your data is ready

- Each customer appears once.
- Prices and policies live in one place everyone uses.
- Required fields are filled for active records.
- Someone owns keeping it that way.

> If you do one thing before your first AI project, pick your messiest list of records and clean it. That's the real starting line.

If your records live in spreadsheets, read [Excel is not a system](/blog/excel-is-not-a-system). Getting this foundation right is the first step in our [AI integration](/ai-integration) projects.`,
    faqs: [
      { q: 'Why do AI projects fail?', a: 'Most often because of messy data: duplicate records, information scattered across WhatsApp and spreadsheets, missing fields and rules that were never written down.' },
      { q: 'How do I prepare my data for AI?', a: 'Pick your most important list, choose a single source of truth, remove duplicates, fill missing fields, standardise formats and write down unwritten rules.' },
      { q: 'How long does data cleanup take?', a: 'A focused first pass on one important list can take about a week. Keeping it clean needs required fields and one person responsible.' },
    ],
    related: { label: 'See how we approach AI integration', to: '/ai-integration' },
  },
  {
    day: 13, slug: 'cost-of-waiting-on-ai', category, date,
    title: '"We\'ll add AI later" is also a decision',
    seoTitle: 'The real cost of waiting to adopt AI in your business',
    description: 'Waiting on AI is a valid choice, but it has a price: compounding messy records. Why to start with one small task now, and how to pick it.',
    summary: "Waiting to adopt AI is a legitimate choice, but it has a cost. Every month on manual processes adds more unstructured records and unwritten decisions, so the cleanup gets bigger. The cheapest path is to automate one small, repetitive task now. It's cheap to get wrong and teaches you what the technology really does.",
    takeaways: [
      'The real cost of waiting isn\'t missing out. It\'s a growing pile of messy records.',
      'Start with one task, not a platform.',
      'A small first project teaches you what AI can actually do for your business.',
      'It also builds the habit of writing processes down.',
    ],
    body: `Plenty of owners say they'll look at AI next year. That's a legitimate choice. But let's be honest that it is a choice, and it has a cost.

Not the cost of missing out. We're not going to scare you. The real cost is compounding.

## How waiting compounds

Every month you run on manual processes, you create:

- Another month of records nobody structured.
- Another set of decisions nobody wrote down.
- Another batch of customer history spread across phones and chats.

When you do start, you'll be cleaning up a bigger pile than the one that exists today.

## The cheapest way to start

Not a platform. Not a big project. Pick the single most repetitive task in your week and get it off a person.

| Good first tasks | Why they work |
| --- | --- |
| Booking confirmations and reminders | Low risk, customers notice immediately |
| Copying enquiries from WhatsApp into one list | Removes retyping, creates clean records |
| Reading supplier invoices | High volume, easy to check |
| Answering the same five questions | Saves staff time every day |

## What a small first project teaches you

1. What this technology actually does, beyond the hype.
2. How clean your data really is.
3. How to write a process down clearly.
4. How your team reacts to automation.

And it costs very little to be wrong.

## A simple plan

- **This month:** pick one task and measure how long it takes today.
- **Next month:** automate it and run it alongside the manual way. See [how to test any AI tool in one week](/blog/how-to-test-ai-tools).
- **Then:** keep it if it saved real time, and pick the next task.

> Waiting is fine. Waiting while the pile grows is expensive.

Not sure which task to start with? Read [the first three things to automate](/blog/first-things-to-automate), or estimate the savings with the free [Business Impact calculator](/tools/business-impact).`,
    faqs: [
      { q: 'Should my business wait to adopt AI?', a: 'Waiting is a valid choice, but every month of manual work adds messy records and unwritten decisions. Starting with one small task keeps that pile from growing.' },
      { q: 'What is the best first step with AI?', a: 'Automate one repetitive, low-risk task, such as booking reminders or copying enquiries into one list, and measure the time it saves.' },
      { q: 'Do I need a big budget to start with AI?', a: 'No. A single small workflow is cheap to build and cheap to get wrong, and it shows you whether bigger projects are worth it.' },
    ],
    related: { label: 'Estimate the impact of automating one task', to: '/tools/business-impact' },
  },
  {
    day: 14, slug: 'how-to-test-ai-tools', category, date,
    title: 'How to test any AI tool in one week',
    seoTitle: 'How to test an AI tool in one week before you buy',
    description: 'Don\'t sign an annual plan. A seven-day test for any AI tool: measure first, run it side by side, count the checking time, then decide.',
    summary: "Before committing to any AI tool, run a seven-day test. Measure what the task costs today, run the tool alongside a person on the same work, count the mistakes and how long they took to catch, then ask one question: did it give time back, and what did the person do with it?",
    takeaways: [
      'Measure the task before you start, or you\'ll never know if the tool helped.',
      'Run the tool alongside the person, not instead of them.',
      'A tool that is 90 percent right but needs full checking saves nothing.',
      'If the saved time goes into correcting the tool, walk away.',
    ],
    body: `Don't sign an annual plan. Run this test for seven days first.

## The seven-day test

| Day | What to do |
| --- | --- |
| 1 | Pick one task. Write down what it costs now: minutes per task, times per week, and who does it. |
| 2 to 5 | Run the tool and the person side by side on the same work. Alongside, not instead of. |
| 6 | Count the tool's mistakes, and how long it took to catch each one. |
| 7 | Decide: did this give time back to a person, and what did they do with it? |

## Day 1: measure before you start

Without a "before" number, you'll never know if the tool helped. Record:

- How long the task takes each time.
- How many times a week it happens.
- Who does it, and what their time is worth.
- How often mistakes happen today.

## Days 2 to 5: side by side

Give the tool and the person identical inputs. You're comparing output on the same work, so the comparison is fair.

## Day 6: count the checking time

This is the step most people skip. A tool that is 90 percent right but needs full checking saved you nothing, because someone still reads everything.

Track:

- Mistakes per 100 tasks.
- Time spent checking and correcting.
- Mistakes that would have reached a customer.

## Day 7: one question

Did this give time back to a person, and what did they do with it? If the honest answer is that they now spend the saved time correcting the tool, walk away.

## Worked example

| | Before | With the tool |
| --- | --- | --- |
| Time per invoice | 4 minutes | 1 minute plus 30 seconds checking |
| Invoices a week | 200 | 200 |
| Hours a week | About 13 | About 5 |
| Errors reaching accounts | 3 | 2 |

That's about eight hours a week back, worth keeping if the tool costs less than eight hours of that person's time.

> Seven days and a notebook can save you a year's subscription.

Before testing, make sure the tool fits the job. Read [what AI can actually do for you today](/blog/what-ai-can-do-for-business), and estimate the value with the free [Business Impact calculator](/tools/business-impact).`,
    faqs: [
      { q: 'How do I evaluate an AI tool before buying?', a: 'Measure the task today, run the tool alongside a person on the same work for a few days, count mistakes and checking time, then decide if it really gave time back.' },
      { q: 'How long should an AI tool trial be?', a: 'One focused week is usually enough to see accuracy, checking time and whether it saves real time on one task.' },
      { q: 'What should I measure in an AI pilot?', a: 'Time per task before and after, mistakes per 100 tasks, time spent checking, and mistakes that would have reached a customer.' },
    ],
    related: { label: 'Calculate the value of an AI tool', to: '/tools/business-impact' },
  },
]
