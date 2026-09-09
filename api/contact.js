import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = 'connect@vikku.in';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, company, phone, service, budget, projectType, timeline, message, website } = req.body;

    // Honeypot: bots that fill this hidden field get a silent fake-success, no email sent
    if (website) {
      return res.status(200).json({ success: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, or message' });
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
      from: 'Vikku Website <noreply@vikku.in>',
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
                        <p style="margin: 10px 0 0; color: #999999; font-size: 14px;">from ${name}</p>
                      </td>
                    </tr>

                    <!-- Details -->
                    <tr>
                      <td style="padding: 30px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px;">
                          ${rows.map(([label, value]) => `
                            <tr>
                              <td style="padding: 12px 20px; border-bottom: 1px solid #2a2a2a; color: #999999; font-size: 13px; width: 130px;">${label}</td>
                              <td style="padding: 12px 20px; border-bottom: 1px solid #2a2a2a; color: #ffffff; font-size: 13px;">${value}</td>
                            </tr>
                          `).join('')}
                        </table>

                        <p style="margin: 24px 0 8px; color: #999999; font-size: 13px; font-weight: 600;">Message</p>
                        <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; border-top: 1px solid #222222; text-align: center;">
                        <p style="margin: 0; color: #666666; font-size: 12px;">
                          Reply directly to this email to respond to ${name}.
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
