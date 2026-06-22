const bcrypt = require('bcryptjs');
const { query } = require('./db');

const seed = async () => {
  console.log('🌱 Starting Database Seeding...');

  try {
    // 1. Create Default Admin User
    const adminEmail = 'herta@spaceanchor.io';
    const rawPassword = 'adminpassword';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const { rows: existingUsers } = await query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    let adminId;

    if (existingUsers.length === 0) {
      const res = await query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_temporary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [adminEmail, hashedPassword, 'Herta', 'Genius', 'admin', 0]
      );
      adminId = res.lastID;
      console.log(`👤 Seeded Default Admin User:
   Email: ${adminEmail}
   Password: ${rawPassword} (Please change it on production)`);
    } else {
      adminId = existingUsers[0].id;
      console.log('👤 Default Admin User already exists.');
    }

    // 2. Ensure Seed Domains exist and fetch their IDs
    const domains = [
      { id: 1, name: 'localhost:4040' },
      { id: 2, name: 'spaceanchor.io' },
      { id: 3, name: 'herta.station' },
      { id: 4, name: 'genius.wiki' }
    ];

    for (const dom of domains) {
      await query('INSERT OR IGNORE INTO domains (id, domain_name, is_active) VALUES (?, ?, 1)', [dom.id, dom.name]);
    }
    console.log('🌐 Default Domains verified.');

    // 3. Seed Mock Shortened Links
    const links = [
      {
        id: 1,
        original_url: 'https://hsr.hoyoverse.com/en-us/',
        short_id: 'hsr',
        domain_id: 3, // herta.station
        description: 'Madame Herta\'s Home Base - Honkai Star Rail Portal',
        created_by: adminId
      },
      {
        id: 2,
        original_url: 'https://github.com/dost-replica/proact-reporting',
        short_id: 'proact',
        domain_id: 1, // localhost:4040
        description: 'DOST PROACT Disaster Situational Reporting System Repo',
        created_by: adminId
      },
      {
        id: 3,
        original_url: 'https://en.wikipedia.org/wiki/Simulated_Universe',
        short_id: 'simuni',
        domain_id: 4, // genius.wiki
        description: 'Wiki documentation on the Simulated Universe Project',
        created_by: adminId
      },
      {
        id: 4,
        original_url: 'https://news.google.com',
        short_id: 'news',
        domain_id: 2, // spaceanchor.io
        description: 'General News feed aggregator',
        created_by: adminId
      }
    ];

    for (const link of links) {
      const { rows: existingLinks } = await query('SELECT * FROM links WHERE short_id = ? AND domain_id = ?', [link.short_id, link.domain_id]);
      if (existingLinks.length === 0) {
        await query(
          `INSERT INTO links (id, original_url, short_id, domain_id, description, created_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [link.id, link.original_url, link.short_id, link.domain_id, link.description, link.created_by]
        );
      }
    }
    console.log('🔗 Seeded Mock Links.');

    // Fetch link IDs in db
    const { rows: dbLinks } = await query('SELECT id FROM links');
    if (dbLinks.length === 0) {
      console.log('No links in database to attach clicks to. Skipping clicks.');
      return;
    }

    // 4. Generate Clicks Telemetry Data
    const referrers = ['Direct', 'Google', 'Github', 'Twitter', 'Reddit', 'Facebook', 'HoyoLab'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
    const oss = ['Windows', 'macOS', 'Android', 'iOS', 'Linux'];
    const countries = ['Philippines', 'United States', 'Japan', 'Germany', 'Singapore', 'South Korea', 'United Kingdom', 'Canada'];
    const deviceTypes = ['Desktop', 'Mobile', 'Tablet'];

    const getWeightedRandom = (arr, weights) => {
      let sum = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * sum;
      for (let i = 0; i < arr.length; i++) {
        if (rand < weights[i]) return arr[i];
        rand -= weights[i];
      }
      return arr[0];
    };

    // Clear existing click logs first to make it a fresh demo dashboard
    await query('DELETE FROM clicks');

    console.log('📊 Simulating link clicks telemetry logs (180+ entries)...');

    const totalClicksToSimulate = 220;
    const now = new Date();

    for (let i = 0; i < totalClicksToSimulate; i++) {
      // Pick a random link
      const link = dbLinks[Math.floor(Math.random() * dbLinks.length)];

      // Pick a timestamp
      const dist = Math.random();
      let clickDate = new Date();

      if (dist < 0.30) {
        // Today
        clickDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
      } else if (dist < 0.60) {
        // This Week
        const daysAgo = Math.floor(Math.random() * 6) + 1;
        clickDate.setDate(now.getDate() - daysAgo);
        clickDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
      } else if (dist < 0.85) {
        // This Month
        const daysAgo = Math.floor(Math.random() * 23) + 7;
        clickDate.setDate(now.getDate() - daysAgo);
        clickDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
      } else {
        // This Year
        const daysAgo = Math.floor(Math.random() * 334) + 31;
        clickDate.setDate(now.getDate() - daysAgo);
        clickDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
      }

      // Format ISO string
      const clickTimeStr = clickDate.toISOString().replace('T', ' ').substring(0, 19);

      // Attributes
      const referrer = getWeightedRandom(referrers, [30, 25, 20, 15, 10, 5, 5]);
      const browser = getWeightedRandom(browsers, [50, 20, 15, 10, 5]);
      const os = getWeightedRandom(oss, [40, 20, 20, 15, 5]);
      const country = getWeightedRandom(countries, [45, 20, 15, 5, 5, 5, 3, 2]); // Philippines is highest
      const device = getWeightedRandom(deviceTypes, [45, 45, 10]);

      // Mock IP
      const ip = `112.198.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      await query(
        `INSERT INTO clicks (link_id, clicked_at, referrer, browser, os, country, ip_address, device_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [link.id, clickTimeStr, referrer, browser, os, country, ip, device]
      );
    }

    console.log('✨ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
};

// If run directly
if (require.main === module) {
  seed();
}

module.exports = seed;
