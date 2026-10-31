import { isoDay, pdfMoney, quoteTotals } from './crmUtils.js'
import { pdfSafe } from './pdfText.js'

// Quotation PDF for the CRM (src/pages/admin/crm/CrmDocuments.jsx). quotePdf is pure so it can be
// rendered in Node for checks; downloadPdf loads jsPDF and the logo in the browser and saves the file.
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

async function logoDataUrl() {
  try {
    const blob = await (await fetch('/logo-sm.png')).blob()
    return await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob) })
  } catch { return null }
}

// A4 quotation. Built-in Helvetica has no ₹, so amounts read "INR 1,00,000.00".
export function quotePdf(jsPDF, doc, party, logo) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), M = 48
  const orange = [234, 88, 12], ink = [15, 23, 42], muted = [100, 116, 139]
  const t = quoteTotals(doc.items, doc.tax_percent, doc.discount)
  const money = (n) => pdfMoney(n, doc.currency)

  if (logo) pdf.addImage(logo, 'PNG', M, 40, 36, 36)
  pdf.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...ink).text('Vikku Labs', M + (logo ? 46 : 0), 64)
  pdf.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...muted)
  ;['www.vikku.in', 'connect@vikku.in', '+91 93939 79892'].forEach((l, i) => pdf.text(l, W - M, 48 + i * 12, { align: 'right' }))

  pdf.setFont('helvetica', 'bold').setFontSize(22).setTextColor(...orange).text('QUOTATION', M, 120)
  pdf.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...ink)
  const meta = [['Number', doc.number || 'Draft'], ['Date', fmtDate(isoDay(new Date(doc.created_at || Date.now())))], ['Valid until', doc.valid_until ? fmtDate(doc.valid_until) : '-']]
  meta.forEach(([k, v], i) => { pdf.setTextColor(...muted).text(k, W - M - 150, 108 + i * 14); pdf.setTextColor(...ink).text(String(v), W - M, 108 + i * 14, { align: 'right' }) })

  let y = 162
  pdf.setFontSize(9).setTextColor(...muted).text('PREPARED FOR', M, y)
  pdf.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...ink).text(pdfSafe(party?.name) || '-', M, y + 15)
  pdf.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...muted)
  ;[party?.company, party?.email, party?.phone].filter(Boolean).forEach((l, i) => pdf.text(pdfSafe(l), M, y + 28 + i * 12))
  y += 76
  pdf.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...ink).text(pdfSafe(doc.title), M, y)
  y += 20

  const cols = { desc: M, qty: W - M - 210, rate: W - M - 110, amt: W - M }
  const header = () => {
    pdf.setFillColor(255, 247, 237).rect(M - 6, y - 12, W - 2 * M + 12, 22, 'F')
    pdf.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...orange)
    pdf.text('DESCRIPTION', cols.desc, y + 2); pdf.text('QTY', cols.qty, y + 2, { align: 'right' })
    pdf.text('RATE', cols.rate, y + 2, { align: 'right' }); pdf.text('AMOUNT', cols.amt, y + 2, { align: 'right' })
    y += 26
  }
  header()
  pdf.setFont('helvetica', 'normal').setFontSize(10)
  for (const it of doc.items) {
    const lines = pdf.splitTextToSize(pdfSafe(it.description) || '-', cols.qty - cols.desc - 40)
    if (y + lines.length * 13 > H - 140) { pdf.addPage(); y = 60; header(); pdf.setFont('helvetica', 'normal').setFontSize(10) }
    pdf.setTextColor(...ink).text(lines, cols.desc, y)
    pdf.text(String(Number(it.qty) || 0), cols.qty, y, { align: 'right' })
    pdf.text(money(it.rate), cols.rate, y, { align: 'right' })
    pdf.text(money(quoteTotals([it]).subtotal), cols.amt, y, { align: 'right' })
    y += lines.length * 13 - 4
    pdf.setDrawColor(226, 232, 240).line(M, y, W - M, y)
    y += 16
  }

  if (y > H - 200) { pdf.addPage(); y = 60 }
  y += 8
  const rows = [['Subtotal', money(t.subtotal)]]
  if (t.discount) rows.push(['Discount', `- ${money(t.discount)}`])
  if (Number(doc.tax_percent)) rows.push([`GST ${Number(doc.tax_percent)}%`, money(t.tax)])
  rows.forEach(([k, v]) => { pdf.setTextColor(...muted).text(k, cols.rate - 60, y); pdf.setTextColor(...ink).text(v, cols.amt, y, { align: 'right' }); y += 16 })
  pdf.setFillColor(...orange).rect(cols.rate - 72, y - 8, cols.amt - cols.rate + 84, 26, 'F')
  pdf.setFont('helvetica', 'bold').setFontSize(11).setTextColor(255, 255, 255)
  pdf.text('Total', cols.rate - 60, y + 9); pdf.text(money(t.total), cols.amt - 6, y + 9, { align: 'right' })
  y += 46

  for (const [label, body] of [['Notes', doc.notes], ['Terms', doc.terms]]) {
    if (!body) continue
    const lines = pdf.splitTextToSize(pdfSafe(body), W - 2 * M)
    if (y + 20 + lines.length * 12 > H - 60) { pdf.addPage(); y = 60 }
    pdf.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...muted).text(label.toUpperCase(), M, y)
    pdf.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...ink).text(lines, M, y + 14)
    y += 30 + lines.length * 12
  }

  const pages = pdf.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i).setFont('helvetica', 'normal').setFontSize(8).setTextColor(...muted)
    pdf.text('Thank you for considering Vikku Labs.', M, H - 30)
    pdf.text(`${i} / ${pages}`, W - M, H - 30, { align: 'right' })
  }
  return pdf
}

export async function downloadPdf(doc, party) {
  const { jsPDF } = await import('jspdf')
  quotePdf(jsPDF, doc, party, await logoDataUrl()).save(`${doc.number || 'quotation'}.pdf`)
}
