import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { checkSignup } from './_signup.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = 'connect@vikku.in';

// Visitor input is placed into the HTML email, so escape it to stop markup or link injection.
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.body?.kind === 'demo') return demoRequest(req, res);

  try {
    const { name, email, company, phone, service, budget, projectType, timeline, message, website } = req.body;

    // Honeypot: bots that fill this hidden field get a silent fake-success, no email sent
    if (website) {
      return res.status(200).json({ success: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, or message' });
    }
    if ([name, email, message].some((v) => typeof v !== 'string') || message.length > 5000) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const rows = [
      ['Email', email],
      ['Company', company || 'Not provided'],
      ['Phone', phone || 'Not provided'],
      ['Service', service || 'Not specified'],
      ['Budget', budget || 'Not specified'],
      ['Project Type', projectType || 'Not specified'],
      ['Timeline', timeline || 'Not specified'],
    ];

    const { data, error } = await resend.emails.send({
      from: 'Vikku Labs Website <noreply@vikku.in>',
      to: [TO_EMAIL],
      replyTo: email,
      subject: `New project inquiry from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New project inquiry</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border: 1px solid #222222; border-radius: 16px; overflow: hidden;">

                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                          New project inquiry
                        </h1>
                        <p style="margin: 10px 0 0; color: #999999; font-size: 14px;">from ${esc(name)}</p>
                      </td>
                    </tr>

                    <!-- Details -->
                    <tr>
                      <td style="padding: 30px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px;">
                          ${rows.map(([label, value]) => `
                            <tr>
                              <td style="padding: 12px 20px; border-bottom: 1px solid #2a2a2a; color: #999999; font-size: 13px; width: 130px;">${label}</td>
                              <td style="padding: 12px 20px; border-bottom: 1px solid #2a2a2a; color: #ffffff; font-size: 13px;">${esc(value)}</td>
                            </tr>
                          `).join('')}
                        </table>

                        <p style="margin: 24px 0 8px; color: #999999; font-size: 13px; font-weight: 600;">Message</p>
                        <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${esc(message)}</p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; border-top: 1px solid #222222; text-align: center;">
                        <p style="margin: 0; color: #666666; font-size: 12px;">
                          Reply directly to this email to respond to ${esc(name)}.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
New project inquiry from ${name}

${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}

Message:
${message}

---
Reply directly to this email to respond to ${name}.
      `.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ success: true, messageId: data.id });

  } catch (error) {
    console.error('Error sending contact message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

// ---------------------------------------------------------------- demo requests ---
// The "Request a live demo" form on product pages (src/components/DemoRequest.jsx). Demo links live
// only here, never in the site's code: the request becomes a CRM lead whose notes carry the link to
// send, and connect@vikku.in gets an email. Shares this function because Vercel Hobby allows 12.
const DEMOS = {
  school: { product: 'School management system', link: 'https://school-os-vert.vercel.app', org: 'School', size: 'Students' },
  restaurant: { product: 'Restaurant management system', link: 'https://kavari-grand-rms.vercel.app', org: 'Restaurant', size: 'Outlets' },
};

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function demoRequest(req, res) {
  const b = req.body;
  const demo = DEMOS[b.product];
  const check = checkSignup({ email: b.email, website: b.website, elapsedMs: b.elapsedMs });
  if (check.silent) return res.status(200).json({ success: true }); // bots get a normal-looking reply
  if (!demo) return res.status(400).json({ error: 'Unknown product.' });
  if (!check.ok) return res.status(400).json({ error: check.error });

  const d = { name: str(b.name), role: str(b.role), phone: str(b.phone, 30), org: str(b.org), city: str(b.city), size: str(b.size), message: str(b.message, 2000) };
  if (['name', 'role', 'phone', 'org', 'city', 'size'].some((k) => !d[k])) {
    return res.status(400).json({ error: 'Please fill in every field.' });
  }
  if (!/^[0-9+()\- ]{7,30}$/.test(d.phone)) return res.status(400).json({ error: 'Please enter a valid phone number.' });

  const email = check.email;
  const rows = [
    ['Product', demo.product], ['Role', d.role], ['Email', email], ['Phone', d.phone],
    [demo.org, d.org], ['City', d.city], [demo.size, d.size], ['Demo link to send', demo.link],
  ];
  const notes = `Requested the ${demo.product.toLowerCase()} demo.\n${rows.slice(1).filter(([k]) => k !== 'Email').map(([k, v]) => `${k}: ${v}`).join('\n')}${d.message ? `\nMessage: ${d.message}` : ''}`;

  let saved = false;
  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD in IST
    const must = ({ data, error }) => { if (error) throw error; return data; };
    const pattern = email.replace(/[\\%_]/g, (c) => '\\' + c);
    const [existing] = must(await supabase.from('crm_leads').select('id').ilike('email', pattern).order('created_at', { ascending: false }).limit(1));
    if (existing) {
      // Someone already in the CRM: note the request on their lead and bring the follow-up to today.
      must(await supabase.from('crm_activity').insert({ lead_id: existing.id, kind: 'note', body: notes }));
      must(await supabase.from('crm_leads').update({ next_follow_up: today }).eq('id', existing.id));
    } else {
      must(await supabase.from('crm_leads').insert({
        name: d.name, email, phone: d.phone, company: d.org, city: d.city, source: 'website',
        service: `${demo.product} demo`, stage: 'new', next_follow_up: today, notes,
      }));
    }
    saved = true;
  } catch (err) {
    console.error('Demo request: saving the lead failed', err);
  }

  let mailed = false;
  try {
    const { error } = await resend.emails.send({
      from: 'Vikku Labs Website <noreply@vikku.in>',
      to: [TO_EMAIL],
      replyTo: email,
      subject: `Demo request: ${demo.product} from ${d.name}, ${d.org}`,
      html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#111">
        <h2 style="margin:0 0 12px;font-size:18px">${esc(d.name)} asked for the ${esc(demo.product.toLowerCase())} demo</h2>
        <table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('')}</table>
        ${d.message ? `<p style="margin:16px 0 4px;color:#666">Message</p><p style="margin:0;white-space:pre-wrap">${esc(d.message)}</p>` : ''}
        <p style="margin:16px 0 0;color:#666">${saved ? 'Saved as a lead in the admin CRM.' : 'Saving the lead failed, so add it to the CRM by hand.'} Reply to this email to answer ${esc(d.name)}.</p>
      </div>`,
    });
    if (error) throw error;
    mailed = true;
  } catch (err) {
    console.error('Demo request: email failed', err);
  }

  if (!saved && !mailed) return res.status(500).json({ error: 'We couldn’t send your request. Please try again, or message us on WhatsApp.' });
  return res.status(200).json({ success: true });
}
