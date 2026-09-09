// Branded PDF export for tool results. jsPDF is dynamically imported so it stays
// out of the main bundle and only loads when a user clicks "Download PDF".
import { TOOL_LABELS } from './toolResultsService'

const money = (n, sym = '₹') => `${sym}${Number(n || 0).toLocaleString('en-IN')}`
const INK = [15, 23, 42]      // slate-900
const MUTED = [100, 116, 139] // slate-500
const ACCENT = [124, 58, 237] // violet-600

function lines(tool, r) {
  const sym = r.currencySymbol || '₹'
  const out = [] // { label, value } rows  OR  { h } section heading  OR { bullet }
  const bullets = (arr, key) => (arr || []).forEach((i) =>
    out.push({ bullet: typeof i === 'string' ? i : (i[key] || i.benefit || i.category || i.name || '') }))

  if (tool === 'cost_estimator') {
    out.push({ label: 'Estimated cost', value: `${money(r.totalCostMin, sym)} - ${money(r.totalCostMax, sym)}` })
    out.push({ label: 'Timeline', value: r.timeline || '-' })
    out.push({ label: 'Complexity', value: r.complexity || '-' })
    if (r.breakdown?.length) { out.push({ h: 'Cost breakdown' }); r.breakdown.forEach(b => out.push({ label: b.category, value: `${money(b.costMin, sym)} - ${money(b.costMax, sym)}` })) }
    if (r.recommendations?.length) { out.push({ h: 'Recommendations' }); bullets(r.recommendations) }
    if (r.risks?.length) { out.push({ h: 'Potential risks' }); bullets(r.risks) }
  } else if (tool === 'roi_calculator') {
    out.push({ label: 'Revenue lost / month', value: money(r.monthlyRevenueLost, sym) })
    out.push({ label: 'Revenue lost / year', value: money(r.annualRevenueLost, sym) })
    out.push({ label: 'Annual ROI', value: `${r.roiPercent}%` })
    out.push({ label: 'Payback period', value: `${r.paybackPeriodMonths} months` })
    if (r.keyInsights?.length) { out.push({ h: 'Key insights' }); bullets(r.keyInsights) }
  } else if (tool === 'timeline_calculator') {
    out.push({ label: 'Total duration', value: r.totalWeeksMin != null ? `${r.totalWeeksMin}-${r.totalWeeksMax} weeks` : (r.totalDuration || '-') })
    if (r.phases?.length) { out.push({ h: 'Phases' }); r.phases.forEach(p => out.push({ label: p.name || p.phase, value: p.weeksMin != null ? `${p.weeksMin}-${p.weeksMax} wks` : (p.duration || '') })) }
  } else if (tool === 'tech_recommender') {
    const s = r.recommendedStack || {}
    out.push({ h: 'Recommended stack' })
    if (s.frontend) out.push({ label: 'Frontend', value: s.frontend })
    if (s.backend)  out.push({ label: 'Backend', value: s.backend })
    if (s.database) out.push({ label: 'Database', value: s.database })
    if (s.hosting)  out.push({ label: 'Hosting', value: s.hosting })
    if (r.warnings?.length) { out.push({ h: 'Watch out for' }); bullets(r.warnings) }
  } else if (tool === 'maintenance_calculator') {
    out.push({ label: 'Monthly cost', value: `${money(r.monthlyCostMin, sym)} – ${money(r.monthlyCostMax, sym)}` })
    out.push({ label: 'Annual cost', value: `${money(r.annualCostMin, sym)} – ${money(r.annualCostMax, sym)}` })
    if (r.breakdown?.length) { out.push({ h: 'Cost breakdown' }); r.breakdown.forEach(b => out.push({ label: b.category, value: `${money(b.costMin, sym)} – ${money(b.costMax, sym)}` })) }
    if (r.recommendations?.length) { out.push({ h: 'Recommendations' }); bullets(r.recommendations) }
    if (r.risksOfSkipping?.length) { out.push({ h: 'Risks of skipping maintenance' }); bullets(r.risksOfSkipping) }
  } else if (tool === 'ai_visibility_score') {
    out.push({ label: 'Score', value: `${r.score}/100` })
    if (r.verdict) out.push({ label: 'Verdict', value: r.verdict })
    if (r.summary) { out.push({ h: 'Summary' }); out.push({ bullet: r.summary }) }
    if (r.blockers?.length) {
      out.push({ h: 'Blockers' })
      r.blockers.forEach((b) => out.push({ bullet: `[${b.severity || 'low'}] ${b.issue}${b.fix ? `. Fix: ${b.fix}` : ''}` }))
    }
    if (r.strengths?.length) { out.push({ h: 'Strengths' }); bullets(r.strengths) }
    if (r.quickWins?.length) { out.push({ h: 'Quick wins' }); bullets(r.quickWins) }
  }
  return out
}

export async function downloadResultPdf({ tool, title, result }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 48
  let y = 56

  // Header band
  doc.setFillColor(...INK); doc.rect(0, 0, W, 8, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(...INK)
  doc.text('vikku', M, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...MUTED)
  doc.text((TOOL_LABELS[tool] || 'Result').toUpperCase(), W - M, y, { align: 'right' })
  y += 28

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...INK)
  doc.text(doc.splitTextToSize(title || TOOL_LABELS[tool] || 'Result', W - M * 2), M, y)
  y += 26
  doc.setDrawColor(226, 232, 240); doc.line(M, y, W - M, y); y += 22

  const ensure = (h = 16) => { if (y + h > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = 56 } }

  for (const row of lines(tool, result || {})) {
    ensure()
    if (row.h) {
      y += 6
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...ACCENT)
      doc.text(row.h.toUpperCase(), M, y); y += 16
    } else if (row.bullet) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...INK)
      const wrapped = doc.splitTextToSize(`•  ${row.bullet}`, W - M * 2)
      doc.text(wrapped, M, y); y += wrapped.length * 14
    } else {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...MUTED)
      doc.text(String(row.label || ''), M, y)
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK)
      doc.text(String(row.value || ''), W - M, y, { align: 'right' }); y += 18
    }
  }

  // Footer CTA on every page
  const pages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    const fy = doc.internal.pageSize.getHeight() - 52
    doc.setDrawColor(226, 232, 240); doc.line(M, fy, W - M, fy)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...INK)
    doc.text('Want this built for a fixed price?', M, fy + 18)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED)
    doc.text('Book a free scoping call at vikku.in  ·  connect@vikku.in', M, fy + 32)
    doc.text(`${p} / ${pages}`, W - M, fy + 32, { align: 'right' })
  }

  doc.save(`vikku-${tool}.pdf`)
}
