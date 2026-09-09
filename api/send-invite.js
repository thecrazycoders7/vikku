import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const ALLOWED_URL_PREFIX = 'https://vikku.in/pm/';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate caller
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) return res.status(500).json({ error: 'Server misconfigured' });
    const authHeader = req.headers['authorization'] || '';
    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return res.status(401).json({ error: 'Unauthorized' });

    const { email, projectName, projectUrl, inviterName, role } = req.body;

    if (!email || !projectName || !projectUrl) {
      return res.status(400).json({
        error: 'Missing required fields: email, projectName, or projectUrl'
      });
    }

    // Validate projectUrl to prevent phishing via arbitrary URLs
    if (!projectUrl.startsWith(ALLOWED_URL_PREFIX)) {
      return res.status(400).json({ error: 'Invalid project URL' });
    }

    const roleDescriptions = {
      admin: 'full access to manage the project',
      member: 'edit tasks and milestones',
      viewer: 'view-only access'
    };

    const roleDescription = roleDescriptions[role] || 'collaborate on';

    const { data, error } = await resend.emails.send({
      from: 'Vikku PM <noreply@vikku.in>',
      to: [email],
      subject: `You've been invited to ${projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Invitation</title>
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
                          You've been invited to collaborate
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 30px 40px;">
                        <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                          ${inviterName || 'Someone'} has invited you to collaborate on <strong style="color: #ffffff;">${projectName}</strong>.
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #999999; font-size: 14px; line-height: 1.6;">
                          You've been given <strong style="color: #ffffff;">${role}</strong> access, which means you can ${roleDescription}.
                        </p>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${projectUrl}" style="display: inline-block; padding: 16px 32px; background-color: #ffffff; color: #000000; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; transition: background-color 0.2s;">
                                View Project
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Info Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; margin-top: 30px;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; font-weight: 600;">
                                📋 Getting Started
                              </p>
                              <ol style="margin: 0; padding-left: 20px; color: #999999; font-size: 14px; line-height: 1.8;">
                                <li>Click the button above to access the project</li>
                                <li>Sign up or log in with this email: <strong style="color: #ffffff;">${email}</strong></li>
                                <li>Start collaborating with your team!</li>
                              </ol>
                            </td>
                          </tr>
                        </table>

                        <!-- Link fallback -->
                        <p style="margin: 30px 0 0; color: #666666; font-size: 12px; line-height: 1.6;">
                          Button not working? Copy and paste this link:<br>
                          <a href="${projectUrl}" style="color: #4a9eff; text-decoration: none; word-break: break-all;">${projectUrl}</a>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; border-top: 1px solid #222222; text-align: center;">
                        <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                          Sent by <strong style="color: #ffffff;">Vikku PM</strong> — Project Management for Teams
                        </p>
                        <p style="margin: 0; color: #444444; font-size: 11px;">
                          If you didn't expect this invitation, you can safely ignore this email.
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
You've been invited to collaborate on ${projectName}

${inviterName || 'Someone'} has invited you to join their project with ${role} access.

Click here to view the project:
${projectUrl}

Getting Started:
1. Visit the link above
2. Sign up or log in with this email: ${email}
3. Start collaborating!

---
Sent by Vikku PM
If you didn't expect this invitation, you can safely ignore this email.
      `.trim()
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: 'Failed to send invitation email' });
    }

    return res.status(200).json({ 
      success: true,
      messageId: data.id 
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return res.status(500).json({ error: 'Failed to send invitation email' });
  }
}
