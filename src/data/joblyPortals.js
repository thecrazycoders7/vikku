// The five portals in the Jobly Solutions case study (src/pages/CaseStudyJobly.jsx).
// Screenshots are 1600×1000 WebP in /public/case-studies/jobly and show sample data.
export const JOBLY_PORTALS = [
  {
    id: 'admin', name: 'Admin', audience: 'Founders and system owners', tagline: 'The whole agency on one screen.',
    summary: 'Headcount, clients, revenue and every pending approval at a glance, plus the controls to run the platform: roles, settings, audit trail and legal review.',
    features: [
      ['System overview', 'Employees, active clients, projects, monthly revenue and approvals waiting, with six-month revenue and hiring trends.'],
      ['Role-based access', 'Built-in roles, with every screen and API call checked against the signed-in role.'],
      ['Audit log', 'Who created, changed, approved or deleted what, searchable and timestamped.'],
      ['Reports and analytics', 'Employee, client, timesheet and financial reports, plus cash-flow, invoice and expense analytics.'],
      ['Immigration oversight', 'Review every H-1B, PERM and OPT case the agency sponsors, with legal notes and messages in one place.'],
      ['Settings and templates', 'Company holidays, email and invoice templates, system settings and support tickets.'],
    ],
    week: ['Open the overview and see what needs attention', 'Approve or reassign anything stuck in a queue', 'Review revenue and hiring trends', 'Check the audit log before month-end'],
    shots: [
      ['admin-dashboard', 'Admin system overview with employee, client, project, revenue and approval totals above revenue and hiring charts', 'System overview'],
      ['admin-reports', 'Reports page with headcount totals, employees by department and type, and an employee directory', 'Reports and analytics'],
    ],
  },
  {
    id: 'hr', name: 'HR', audience: 'People and compliance teams', tagline: 'Hire, onboard and stay compliant.',
    summary: 'A complete employee record from offer to exit: onboarding, I-9 and visa compliance, immigration cases, documents, leave and reviews.',
    features: [
      ['Guided onboarding', 'Add an employee once, then track paperwork, profile completion and checklists until they are ready to work.'],
      ['I-9, E-Verify and visas', 'I-9 and E-Verify status, H-1B, OPT and other visa types, with alerts before work authorization lapses.'],
      ['Immigration cases', 'H-1B, PERM green card and STEM OPT cases on an 11-step timeline, with receipts, RFEs, attorney and petitioner.'],
      ['Documents and expiry', 'Store employee documents securely and get a queue of everything expiring soon.'],
      ['Leave and attendance', 'Leave requests with balances and accruals, attendance review and company holidays.'],
      ['Reviews and benefits', 'Performance reviews, probation tracking and digital benefits enrollment forms.'],
    ],
    week: ['See who is onboarding and what is missing', 'Clear expiring visas and I-9 documents', 'Move immigration cases to the next step', 'Approve leave requests'],
    shots: [
      ['hr-dashboard', 'HR dashboard with active, onboarding and inactive staff, visa expiry and I-9 status, above hiring and headcount charts', 'Workforce and compliance'],
      ['hr-immigration-cases', 'Immigration case list with H-1B, PERM and STEM OPT cases, status, receipt numbers and work status expiry warnings', 'Immigration cases'],
    ],
  },
  {
    id: 'operations', name: 'Operations', audience: 'Project and delivery managers', tagline: 'Every assignment, every hour, approved on time.',
    summary: 'Place people on client projects, keep the weekly timesheet pipeline moving, and see capacity before committing to new work.',
    features: [
      ['Assignments', 'Who works for which client, on what project, at what bill and pay rate, with start and end dates.'],
      ['Timesheet approvals', 'A clear Draft → Submitted → Manager approved flow, with rejections sent back to the employee.'],
      ['Approval velocity', 'See how fast timesheets move through the pipeline, week by week.'],
      ['Shifts and attendance', 'Shift schedules and an attendance review queue.'],
      ['Capacity and availability', 'Capacity reports and workforce availability before staffing the next project.'],
      ['Org chart and assets', 'Reporting lines at a glance, and the laptops and licences assigned to each person.'],
    ],
    week: ['Open the approval queue on Monday', 'Approve, or reject with a reason', 'Reopen an approved week if it needs a fix', 'Check capacity for incoming work'],
    shots: [
      ['operations-dashboard', 'Operations dashboard with assignments and timesheet approval totals, an approval velocity chart and assignments by client', 'Assignments and approvals'],
      ['operations-timesheets', 'Timesheet list with employee, client, week, hours and approval status', 'Timesheet approvals'],
    ],
  },
  {
    id: 'finance', name: 'Finance', audience: 'Billing and accounts teams', tagline: 'From approved hours to cash in the bank.',
    summary: 'Turn approved timesheets into branded invoices, follow every invoice from draft to paid, and keep cash flow, expenses and budgets in view.',
    features: [
      ['Invoices from timesheets', "Build invoices from manager-approved hours at each consultant's bill rate, with Net 30/45 terms and custom PDF templates."],
      ['Send and get paid', 'Email invoices or share a secure link, with automatic payment reminders.'],
      ['Payments', 'Record full or partial payments. The pipeline shows draft, sent, viewed, partial, overdue and paid.'],
      ['Estimates and recurring', 'Send estimates and convert them to invoices, and schedule recurring invoices for retainers.'],
      ['Expenses', 'Review employee expense claims with receipts, approve them and mark them paid.'],
      ['Cash flow and budgets', 'Cash-flow, invoice and expense analytics, client budgets and tax documents.'],
    ],
    week: ["Generate invoices from last week's approved hours", 'Send them, or share a link', 'Record payments as they land', 'Chase overdue balances with reminders'],
    shots: [
      ['finance-dashboard', 'Finance dashboard with draft invoices, outstanding payments and amounts collected, above an invoice pipeline from draft to paid', 'Revenue and invoicing'],
      ['finance-invoices', 'Invoice list with invoice number, client, dates, amount, status and who created it', 'Invoices'],
    ],
  },
  {
    id: 'employee', name: 'Employee', audience: 'Consultants and staff', tagline: 'Everything an employee needs, in one place.',
    summary: 'Submit timesheets, request leave, file expenses and find documents and pay information, without emailing HR.',
    features: [
      ['Weekly timesheets', 'Log hours per day against the assignment, attach client proof and submit in a minute.'],
      ['Status at a glance', 'See which weeks are pending, approved or sent back, and why.'],
      ['Leave and holidays', 'Request time off, and see the leave balance and company holiday calendar.'],
      ['Expenses', 'Submit expense claims with receipts and track them until paid.'],
      ['Documents and tax forms', 'Personal documents, enrollment forms and tax documents, always available.'],
      ['Announcements and reviews', 'Company announcements, notifications and performance reviews.'],
    ],
    week: ["Fill in this week's hours", 'Submit before Friday', 'Request leave or file an expense', 'Read announcements and notifications'],
    shots: [
      ['employee-dashboard', 'Employee workspace with assigned client, pending timesheets, approved hours and a chart of hours per week', 'My workspace'],
      ['employee-timesheets', 'Employee timesheet list with weeks, hours and approval status', 'My timesheets'],
    ],
  },
]
