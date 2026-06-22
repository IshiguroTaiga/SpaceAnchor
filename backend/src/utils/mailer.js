const nodemailer = require('nodemailer');
const { query } = require('../../db');

/**
 * Sends a welcome email to a newly added user containing their temporary password.
 */
const sendWelcomeEmail = async (userEmail, firstName, tempPassword) => {
  let smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
  let smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  let smtpUser = process.env.SMTP_USER;
  let smtpPass = process.env.SMTP_PASS;
  let senderName = process.env.SMTP_SENDER_NAME || 'SpaceAnchor System';
  let senderEmail = process.env.SMTP_SENDER_EMAIL || smtpUser;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    // Fetch SMTP settings from DB settings table
    const { rows } = await query('SELECT value FROM settings WHERE key = $1', ['smtp_config']);
    if (rows.length > 0 && rows[0].value) {
      const config = JSON.parse(rows[0].value);
      if (config.host && config.username && config.password) {
        smtpHost = config.host;
        smtpPort = parseInt(config.port) || smtpPort;
        smtpUser = config.username;
        smtpPass = config.password;
        senderName = config.senderName || senderName;
        senderEmail = config.senderEmail || config.username;
      }
    }
  } catch (dbErr) {
    console.warn('[Mailer] Could not fetch SMTP config from settings table, checking ENV...', dbErr.message);
  }

  // Fallback / Sandbox Mode if SMTP is not set
  if (!smtpUser || !smtpPass || smtpUser === 'your_smtp_email@example.com') {
    console.log('\n==================================================');
    console.log('[MAILER SIMULATOR] SMTP is not configured. Sandbox Mode Active.');
    console.log(`To: ${userEmail}`);
    console.log(`Subject: Welcome to SpaceAnchor - Your Access Credentials`);
    console.log(`Message: Welcome, ${firstName}! Your account is ready.`);
    console.log(`Login URL: ${clientUrl}`);
    console.log(`Temp Password: ${tempPassword}`);
    console.log('==================================================\n');
    return { success: true, simulated: true, tempPassword };
  }

  const fromAddress = `"${senderName}" <${senderEmail}>`;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: smtpPort === 587 || smtpPort === 25 ? false : true,
    }
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #e2e8f0;
          max-width: 600px;
          margin: 0 auto;
          border: 1px solid #3f3f46;
          border-radius: 12px;
          overflow: hidden;
          background-color: #09090b;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .content {
          padding: 32px 24px;
          background-color: #09090b;
        }
        .welcome-title {
          font-size: 20px;
          font-weight: 600;
          color: #a78bfa;
          margin-bottom: 16px;
        }
        .info-card {
          background-color: #18181b;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
          text-align: center;
        }
        .label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #a1a1aa;
          font-weight: 700;
          margin-bottom: 6px;
          display: block;
        }
        .value {
          font-family: monospace;
          font-size: 24px;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 1.5px;
          margin: 8px 0;
          display: inline-block;
          background: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 6px;
          padding: 6px 16px;
        }
        .btn-link {
          display: inline-block;
          background-color: #6366f1;
          color: #ffffff !important;
          padding: 12px 32px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 24px;
        }
        .footer {
          background-color: #18181b;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #71717a;
          border-top: 1px solid #27272a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SPACE ANCHOR WARP HUB</h1>
        </div>
        <div class="content">
          <div class="welcome-title">Greetings, Researcher ${firstName}!</div>
          <p>You have been added to the SpaceAnchor network — Madame Herta's specialized link routing and telemetry node.</p>
          <p>Please utilize the credentials below to log into the terminal.</p>
          
          <div class="info-card">
            <span class="label">Access Coordinate (Email)</span>
            <div style="font-weight: 600; font-size: 16px; color: #f4f4f5; margin-bottom: 20px;">${userEmail}</div>
            
            <span class="label">Temporary Decryption Code (Password)</span>
            <div><span class="value">${tempPassword}</span></div>
            <div style="font-size: 12px; color: #71717a; margin-top: 8px;">For security compliance, you must change this code immediately upon first entry.</div>
          </div>
          
          <div style="text-align: center;">
            <a href="${clientUrl}" class="btn-link">Initialize Session</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated transmission from the Simulated Universe terminal.</p>
          <p>&copy; ${new Date().getFullYear()} Genius Society #83 - SpaceAnchor Node.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: userEmail,
      subject: "Welcome to SpaceAnchor - Your Node Access Credentials",
      html: htmlContent,
    });
    console.log('[Mailer] Email sent successfully to:', userEmail, 'MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer] SMTP Transmission Failure:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWelcomeEmail };
