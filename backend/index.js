const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const { query } = require('./db');
const { sendWelcomeEmail } = require('./src/utils/mailer');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'herta_genius_society_secret_access_protocol_13579';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to parse User Agent simply
function parseUserAgent(ua) {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Device
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  // OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser
  if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios|edg/i.test(ua)) browser = 'Safari';

  return { browser, os, device };
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin Guard Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator clearance required' });
  }
  next();
};

// Auto-seed user if database is empty on start
let dbInitialized = false;
const dbInitializationPromise = (async () => {
  try {
    const { rows } = await query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('📦 Database is empty. Running default seed automatically...');
      const seedFunc = require('./seed_demo');
      await seedFunc();
    }
    dbInitialized = true;
  } catch (err) {
    console.error('Failed to run auto-seed:', err.message);
  }
})();

// Middleware to block incoming requests until database seeding is complete
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    await dbInitializationPromise;
  }
  next();
});

// ==========================================
// 1. PUBLIC LINK REDIRECTION ENGINE (ROOT)
// ==========================================

// Handle password submission for links
app.post('/decrypt/:shortId', async (req, res) => {
  const { shortId } = req.params;
  const { password } = req.body;
  const host = req.headers.host || 'localhost:4040';
  const hostClean = host.split(':')[0];

  try {
    // 1. Find domain id (match clean domain or full host header)
    const { rows: domRows } = await query('SELECT id FROM domains WHERE (domain_name = ? OR domain_name = ?) AND is_active = 1', [hostClean, host]);
    const domainId = domRows.length > 0 ? domRows[0].id : 1; // Fallback to 1

    // 2. Find link
    let { rows: linkRows } = await query(
      `SELECT l.*, d.domain_name 
       FROM links l
       JOIN domains d ON l.domain_id = d.id
       WHERE l.short_id = ? AND (l.domain_id = ? OR l.domain_id = 1)`,
      [shortId, domainId]
    );

    if (linkRows.length === 0) {
      // Fallback: search for the short_id across ANY domain
      const { rows: fallbackRows } = await query(
        `SELECT l.*, d.domain_name 
         FROM links l
         JOIN domains d ON l.domain_id = d.id
         WHERE l.short_id = ?`,
        [shortId]
      );
      if (fallbackRows.length > 0) {
        linkRows = fallbackRows;
      }
    }

    if (linkRows.length === 0) {
      return res.status(404).send('<h1>404 Space Anchor Not Found</h1><p>The coordinate does not exist in the Simulated Universe.</p>');
    }

    const link = linkRows[0];

    // Check expiration and clicks again
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).send('<h1>Warp Connection Expired</h1><p>This Space Anchor protocol has passed its validity threshold.</p>');
    }
    if (link.max_clicks) {
      const { rows: clickCountRows } = await query('SELECT COUNT(*) as count FROM clicks WHERE link_id = ?', [link.id]);
      if (clickCountRows[0].count >= link.max_clicks) {
        return res.status(429).send('<h1>Warp Limit Exceeded</h1><p>This Space Anchor has reached its maximum transmission capacity.</p>');
      }
    }

    if (link.password !== password) {
      // Return decryption page with error
      return res.send(getPasswordFormHtml(shortId, true));
    }

    // Correct password! Track click and redirect
    await recordClick(link, req);
    return res.redirect(link.original_url);
  } catch (err) {
    console.error('Decryption routing failure:', err);
    res.status(500).send('Internal Telemetry routing error');
  }
});

// Primary Redirection Route
app.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;
  
  // Skip backend asset routes or api requests that slide past /api
  if (shortId === 'favicon.ico' || shortId === 'index.html' || shortId.startsWith('assets')) {
    return res.status(404).end();
  }

  const host = req.headers.host || 'localhost:4040';
  const hostClean = host.split(':')[0];

  try {
    // 1. Match custom domain or default, auto-register on-the-fly if missing
    let domainId = 1;
    const { rows: domRows } = await query(
      'SELECT id FROM domains WHERE (domain_name = ? OR domain_name = ?) AND is_active = 1',
      [hostClean, host]
    );

    if (domRows.length > 0) {
      domainId = domRows[0].id;
    } else {
      // Auto-register domain on-the-fly!
      try {
        const insertRes = await query('INSERT INTO domains (domain_name, is_active) VALUES (?, 1)', [hostClean]);
        domainId = insertRes.lastID;
        console.log(`🌐 Auto-whitelisted custom domain node: ${hostClean}`);
      } catch (err) {
        domainId = 1;
      }
    }

    // 2. Find matching link
    let { rows: linkRows } = await query(
      `SELECT l.*, d.domain_name 
       FROM links l
       JOIN domains d ON l.domain_id = d.id
       WHERE l.short_id = ? AND (l.domain_id = ? OR l.domain_id = 1)
       ORDER BY (l.domain_id = ?) DESC LIMIT 1`,
      [shortId, domainId, domainId]
    );

    if (linkRows.length === 0) {
      // Fallback: search for the short_id across ANY domain
      const { rows: fallbackRows } = await query(
        `SELECT l.*, d.domain_name 
         FROM links l
         JOIN domains d ON l.domain_id = d.id
         WHERE l.short_id = ? 
         LIMIT 1`,
        [shortId]
      );
      if (fallbackRows.length > 0) {
        linkRows = fallbackRows;
      }
    }

    if (linkRows.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 - Space Anchor Out of Bounds</title>
          <style>
            body { background-color: #0c0a0f; color: #a78bfa; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            h1 { color: #f43f5e; font-size: 3rem; margin-bottom: 10px; }
            p { color: #94a3b8; font-size: 1.2rem; }
            .herta-puppet { width: 80px; height: 80px; opacity: 0.7; margin-bottom: 20px; border-radius: 50%; border: 2px solid #8b5cf6; padding: 5px; }
          </style>
        </head>
        <body>
          <div class="herta-puppet" style="background: radial-gradient(circle, #7c3aed 0%, transparent 70%);"></div>
          <h1>404: Coordinate Out of Bounds</h1>
          <p>Madame Herta states: "This Space Anchor does not point to any registered curiosity in the Station."</p>
        </body>
        </html>
      `);
    }

    const link = linkRows[0];

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).send('<h1>Warp Coordinate Expired</h1><p>This path anchor has reached its operational lifespan limit.</p>');
    }

    // Check max click budget limit
    if (link.max_clicks) {
      const { rows: countRows } = await query('SELECT COUNT(*) as count FROM clicks WHERE link_id = ?', [link.id]);
      if (countRows[0].count >= link.max_clicks) {
        return res.status(429).send('<h1>Warp Limit Reached</h1><p>This Space Anchor connection limit has been reached.</p>');
      }
    }

    // Check passcode protection
    if (link.password) {
      // Render beautiful password query form
      return res.send(getPasswordFormHtml(shortId, false));
    }

    // Record Click telemetry and redirect
    await recordClick(link, req);
    return res.redirect(link.original_url);

  } catch (err) {
    console.error('Redirect endpoint breakdown:', err);
    res.status(500).send('Redirect error');
  }
});

// Helper to record click telemetry in DB
async function recordClick(link, req) {
  const userAgentStr = req.headers['user-agent'];
  const referrerUrl = req.headers['referer'] || req.headers['referrer'] || 'Direct';
  
  const clientInfo = parseUserAgent(userAgentStr);

  // Clean Referrer
  let referrer = 'Direct';
  if (referrerUrl !== 'Direct') {
    try {
      const refUrlObj = new URL(referrerUrl);
      const hostName = refUrlObj.hostname.toLowerCase();
      if (hostName.includes('google')) referrer = 'Google';
      else if (hostName.includes('github')) referrer = 'Github';
      else if (hostName.includes('twitter') || hostName.includes('t.co')) referrer = 'Twitter';
      else if (hostName.includes('reddit')) referrer = 'Reddit';
      else if (hostName.includes('facebook') || hostName.includes('fb.com')) referrer = 'Facebook';
      else if (hostName.includes('hoyolab')) referrer = 'HoyoLab';
      else referrer = refUrlObj.hostname;
    } catch {
      referrer = referrerUrl;
    }
  }

  // Country Geolocation Simulation (Thesis data helper)
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  if (ip.includes('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  let country = 'Philippines';
  const localIps = ['127.0.0.1', '::1', 'localhost'];
  if (localIps.includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    const mockCountries = ['Philippines', 'United States', 'Japan', 'Germany', 'Singapore', 'South Korea'];
    const weights = [0.50, 0.18, 0.15, 0.07, 0.05, 0.05];
    let r = Math.random();
    let sum = 0;
    for (let i = 0; i < mockCountries.length; i++) {
      sum += weights[i];
      if (r <= sum) {
        country = mockCountries[i];
        break;
      }
    }
  } else {
    if (req.headers['cf-ipcountry']) {
      country = req.headers['cf-ipcountry'];
    } else {
      country = 'Philippines';
    }
  }

  await query(
    `INSERT INTO clicks (link_id, referrer, browser, os, country, ip_address, device_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [link.id, referrer, clientInfo.browser, clientInfo.os, country, ip, clientInfo.device]
  );
}

// Beautiful cyber Herta-themed password entry HTML page
function getPasswordFormHtml(shortId, isInvalid = false) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Decrypting Space Anchor Coordinate</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          background-color: #08060b;
          color: #e2e8f0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
          background-image: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
                            radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);
        }
        .card {
          background-color: rgba(20, 16, 28, 0.7);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
          padding: 40px 30px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.1);
        }
        h2 {
          color: #a78bfa;
          margin-top: 0;
          font-size: 22px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        p {
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        label {
          display: block;
          font-size: 12px;
          color: #a1a1aa;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }
        input[type="password"] {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          background-color: rgba(9, 9, 11, 0.8);
          color: #f4f4f5;
          font-size: 16px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input[type="password"]:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
        }
        button {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        button:hover {
          opacity: 0.9;
        }
        button:active {
          transform: scale(0.98);
        }
        .error-msg {
          color: #ef4444;
          font-size: 12px;
          margin-top: 10px;
          font-weight: 500;
        }
        .tagline {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 30px;
          letter-spacing: 0.15em;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Passcode Required</h2>
        <p>This Space Anchor coordinate [/${shortId}] is protected by Madame Herta's decryption protocol. Input the passcode to proceed.</p>
        
        <form method="POST" action="/decrypt/${shortId}">
          <div class="form-group">
            <label for="password">Decryption Passcode</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required autofocus />
            ${isInvalid ? `<div class="error-msg">⚠️ Incorrect decryption code. Verification failed.</div>` : ''}
          </div>
          <button type="submit">Decrypt & Redirect</button>
        </form>
        
        <div class="tagline">Genius Society #83 Teleport Network</div>
      </div>
    </body>
    </html>
  `;
}

// ==========================================
// 2. BACKEND API ENDPOINTS (/api)
// ==========================================

// --- AUTHENTICATION ---

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter access coordinates (email) and code (password).' });
  }

  try {
    const { rows } = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized coordinate. User does not exist.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Decryption failed. Invalid passcode.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: `${user.first_name} ${user.last_name}` },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_temporary: user.is_temporary === 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Authentication protocol failure.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await query('SELECT id, email, first_name, last_name, role, is_temporary, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_temporary: user.is_temporary === 1,
      created_at: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Database handshake error.' });
  }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Must supply existing and new passcodes.' });
  }

  try {
    const { rows } = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current passcode verification failed.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ?, is_temporary = 0 WHERE id = ?', [hashedNew, req.user.id]);
    res.json({ success: true, message: 'Passcode successfully recalibrated.' });
  } catch (err) {
    res.status(500).json({ error: 'Recalibration failed.' });
  }
});

// --- USER CREATION & MANAGEMENT (ADMINS ONLY) ---

app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT id, email, first_name, last_name, role, is_temporary, created_at FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { email, first_name, last_name, role } = req.body;
  if (!email || !first_name || !last_name) {
    return res.status(400).json({ error: 'Coordinate requirements unmet. Fill all fields.' });
  }

  try {
    const { rows: existing } = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'This access coordinate (email) is already assigned.' });
    }

    const tempPassword = 'SA_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const userRole = role || 'user';

    const insertRes = await query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_temporary)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [email, hashedPassword, first_name, last_name, userRole]
    );

    // Send Welcome Email
    const emailResult = await sendWelcomeEmail(email, first_name, tempPassword);

    res.json({
      success: true,
      message: 'New user added successfully.',
      user: {
        id: insertRes.lastID,
        email,
        first_name,
        last_name,
        role: userRole
      },
      emailSimulated: emailResult.simulated || false,
      simulatedPassword: emailResult.simulated ? tempPassword : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deploy new researcher user.' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Self-destruction disabled. You cannot delete your own session user.' });
  }

  try {
    const { changes } = await query('DELETE FROM users WHERE id = ?', [id]);
    if (changes === 0) return res.status(404).json({ error: 'User coordinate not found.' });
    res.json({ success: true, message: 'User successfully purged from database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query('SELECT email, first_name FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    const tempPassword = 'SA_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await query('UPDATE users SET password = ?, is_temporary = 1 WHERE id = ?', [hashedPassword, id]);

    // Send email invite
    const emailResult = await sendWelcomeEmail(user.email, user.first_name, tempPassword);

    res.json({
      success: true,
      message: 'Password reset and welcome transmission dispatched.',
      emailSimulated: emailResult.simulated || false,
      simulatedPassword: emailResult.simulated ? tempPassword : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DOMAIN MANAGEMENT (ADMINS ONLY) ---

app.get('/api/domains', authenticateToken, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM domains ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/domains', authenticateToken, requireAdmin, async (req, res) => {
  const { domain_name } = req.body;
  if (!domain_name) return res.status(400).json({ error: 'Domain name is required.' });

  try {
    const insertRes = await query('INSERT INTO domains (domain_name, is_active) VALUES (?, 1)', [domain_name.trim().toLowerCase()]);
    res.json({
      success: true,
      domain: {
        id: insertRes.lastID,
        domain_name: domain_name.trim().toLowerCase(),
        is_active: 1
      }
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'This domain coordinate is already active in the network.' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/domains/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === 1) {
    return res.status(400).json({ error: 'Safety Protocol: Cannot delete the default host domain.' });
  }

  try {
    const { changes } = await query('DELETE FROM domains WHERE id = ?', [id]);
    if (changes === 0) return res.status(404).json({ error: 'Domain index not found.' });
    res.json({ success: true, message: 'Domain purged from system.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LINK SHORTENING CRUD ---

app.get('/api/links', authenticateToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin') {
      const result = await query(
        `SELECT l.*, d.domain_name, u.first_name, u.last_name, 
         (SELECT COUNT(*) FROM clicks WHERE link_id = l.id) as click_count
         FROM links l
         JOIN domains d ON l.domain_id = d.id
         JOIN users u ON l.created_by = u.id
         ORDER BY l.id DESC`
      );
      rows = result.rows;
    } else {
      const result = await query(
        `SELECT l.*, d.domain_name, u.first_name, u.last_name,
         (SELECT COUNT(*) FROM clicks WHERE link_id = l.id) as click_count
         FROM links l
         JOIN domains d ON l.domain_id = d.id
         JOIN users u ON l.created_by = u.id
         WHERE l.created_by = ?
         ORDER BY l.id DESC`,
        [req.user.id]
      );
      rows = result.rows;
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/links', authenticateToken, async (req, res) => {
  const { original_url, description, domain_id, password, expires_at, max_clicks } = req.body;
  if (!original_url) return res.status(400).json({ error: 'Original landing URL is required.' });

  try {
    let shortId = '';
    let duplicate = true;
    const finalDomainId = domain_id || 1;

    while (duplicate) {
      shortId = Math.random().toString(36).substring(2, 8);
      const { rows } = await query('SELECT id FROM links WHERE short_id = ? AND domain_id = ?', [shortId, finalDomainId]);
      if (rows.length === 0) duplicate = false;
    }

    const { lastID } = await query(
      `INSERT INTO links (original_url, short_id, domain_id, description, password, expires_at, max_clicks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        original_url.trim(),
        shortId,
        finalDomainId,
        description || '',
        password || null,
        expires_at || null,
        max_clicks ? parseInt(max_clicks) : null,
        req.user.id
      ]
    );

    const { rows: newlyCreated } = await query(
      `SELECT l.*, d.domain_name, u.first_name, u.last_name, 0 as click_count
       FROM links l
       JOIN domains d ON l.domain_id = d.id
       JOIN users u ON l.created_by = u.id
       WHERE l.id = ?`,
      [lastID]
    );

    res.json({
      success: true,
      message: 'Space Anchor coordinate successfully locked.',
      link: newlyCreated[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/links/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { original_url, description, domain_id, password, expires_at, max_clicks } = req.body;

  try {
    const { rows: targetLink } = await query('SELECT created_by FROM links WHERE id = ?', [id]);
    if (targetLink.length === 0) return res.status(404).json({ error: 'Link coordinate not found.' });

    if (req.user.role !== 'admin' && targetLink[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Security Breach: Unprivileged access to link modification.' });
    }

    await query(
      `UPDATE links 
       SET original_url = ?, description = ?, domain_id = ?, password = ?, expires_at = ?, max_clicks = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        original_url.trim(),
        description || '',
        domain_id,
        password || null,
        expires_at || null,
        max_clicks ? parseInt(max_clicks) : null,
        id
      ]
    );

    const { rows: updated } = await query(
      `SELECT l.*, d.domain_name, u.first_name, u.last_name,
       (SELECT COUNT(*) FROM clicks WHERE link_id = l.id) as click_count
       FROM links l
       JOIN domains d ON l.domain_id = d.id
       JOIN users u ON l.created_by = u.id
       WHERE l.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Space Anchor settings reconfigured.',
      link: updated[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/links/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: targetLink } = await query('SELECT created_by FROM links WHERE id = ?', [id]);
    if (targetLink.length === 0) return res.status(404).json({ error: 'Link not found' });

    if (req.user.role !== 'admin' && targetLink[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await query('DELETE FROM links WHERE id = ?', [id]);
    res.json({ success: true, message: 'Link coordinate dissolved from database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TELEMETRY & ANALYTICS ---

app.get('/api/analytics', authenticateToken, async (req, res) => {
  const { linkId, period, startDate, endDate } = req.query;

  try {
    let baseSql = `
      FROM clicks c
      JOIN links l ON c.link_id = l.id
    `;
    let params = [];
    let conditions = [];

    // Privilege restriction
    if (req.user.role !== 'admin') {
      conditions.push(`l.created_by = ?`);
      params.push(req.user.id);
    }

    // Specific Link Filter
    if (linkId) {
      conditions.push(`c.link_id = ?`);
      params.push(parseInt(linkId));
    }

    // Time-period Filter
    if (period) {
      let intervalSql = '';
      if (period === 'day') intervalSql = "-1 day";
      else if (period === 'week') intervalSql = "-7 days";
      else if (period === 'month') intervalSql = "-30 days";
      else if (period === 'year') intervalSql = "-365 days";

      if (intervalSql) {
        conditions.push(`datetime(c.clicked_at) >= datetime('now', '${intervalSql}')`);
      }
    } else if (startDate && endDate) {
      conditions.push(`datetime(c.clicked_at) >= datetime(?)`);
      params.push(startDate);
      conditions.push(`datetime(c.clicked_at) <= datetime(?)`);
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // 1. Total Visits
    const totalVisitsRes = await query(`SELECT COUNT(*) as count ${baseSql} ${whereClause}`, params);
    const totalVisits = totalVisitsRes.rows[0].count;

    // 2. Referrers
    const referrersRes = await query(
      `SELECT c.referrer, COUNT(*) as count 
       ${baseSql} 
       ${whereClause} 
       GROUP BY c.referrer 
       ORDER BY count DESC`,
      params
    );

    // 3. Browser Usage
    const browserRes = await query(
      `SELECT c.browser, COUNT(*) as count 
       ${baseSql} 
       ${whereClause} 
       GROUP BY c.browser 
       ORDER BY count DESC`,
      params
    );

    // 4. Country Distribution
    const countryRes = await query(
      `SELECT c.country, COUNT(*) as count 
       ${baseSql} 
       ${whereClause} 
       GROUP BY c.country 
       ORDER BY count DESC`,
      params
    );

    // 5. Operating System Usage
    const osRes = await query(
      `SELECT c.os, COUNT(*) as count 
       ${baseSql} 
       ${whereClause} 
       GROUP BY c.os 
       ORDER BY count DESC`,
      params
    );

    // 6. Device Distribution
    const deviceRes = await query(
      `SELECT c.device_type, COUNT(*) as count 
       ${baseSql} 
       ${whereClause} 
       GROUP BY c.device_type 
       ORDER BY count DESC`,
      params
    );

    // 7. Clicks Over Time
    let timeGroupingFormat = '%Y-%m-%d';
    if (period === 'day') timeGroupingFormat = '%Y-%m-%d %H:00';
    else if (period === 'year') timeGroupingFormat = '%Y-%m';

    const timelineRes = await query(
      `SELECT strftime('${timeGroupingFormat}', c.clicked_at) as date, COUNT(*) as count
       ${baseSql}
       ${whereClause}
       GROUP BY date
       ORDER BY date ASC`,
      params
    );

    res.json({
      totalVisits,
      referrers: referrersRes.rows,
      browsers: browserRes.rows,
      countries: countryRes.rows,
      os: osRes.rows,
      devices: deviceRes.rows,
      timeline: timelineRes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- SYSTEM & EMAIL SETTINGS (ADMIN ONLY) ---

app.get('/api/settings/smtp', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT value FROM settings WHERE key = ?', ['smtp_config']);
    if (rows.length === 0 || !rows[0].value) {
      return res.json({ configured: false });
    }
    const config = JSON.parse(rows[0].value);
    res.json({
      configured: true,
      host: config.host,
      port: config.port,
      username: config.username,
      senderName: config.senderName,
      senderEmail: config.senderEmail,
      passwordLength: config.password ? config.password.length : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/smtp', authenticateToken, requireAdmin, async (req, res) => {
  const { host, port, username, password, senderName, senderEmail } = req.body;
  if (!host || !port || !username) {
    return res.status(400).json({ error: 'Host, Port, and Username parameters required.' });
  }

  try {
    let finalPassword = password;
    if (!password) {
      const { rows } = await query('SELECT value FROM settings WHERE key = ?', ['smtp_config']);
      if (rows.length > 0 && rows[0].value) {
        const oldConfig = JSON.parse(rows[0].value);
        finalPassword = oldConfig.password;
      }
    }

    const payload = JSON.stringify({
      host: host.trim(),
      port: parseInt(port),
      username: username.trim(),
      password: finalPassword,
      senderName: (senderName || 'SpaceAnchor System').trim(),
      senderEmail: (senderEmail || username).trim()
    });

    await query(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ['smtp_config', payload]
    );

    res.json({ success: true, message: 'SMTP credentials successfully locked in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*splat', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/decrypt')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
    if (err) {
      res.status(200).send('SpaceAnchor APIs Online. Frontend dev client running on port 5173.');
    }
  });
});

// Start Server
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SpaceAnchor core station running on port ${PORT}`);
    console.log(`🌐 Routing anchors and clicking stats registered.`);
  });
}

module.exports = app;
