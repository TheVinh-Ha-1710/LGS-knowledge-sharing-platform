require('dotenv').config()
const { pool } = require('./db')

async function seed() {
  try {
    await pool.query(`
      INSERT INTO fields (name, slug, icon, description) VALUES
        ('Technology', 'technology', '💻', 'Programming, networks, cybersecurity, AI and everything digital'),
        ('Health & Medicine', 'health-medicine', '🏥', 'Nursing, anatomy, pharmacology and healthcare practice'),
        ('Law & Policy', 'law-policy', '⚖️', 'Civil law, criminal law, contracts and public policy'),
        ('Business', 'business', '📊', 'Finance, marketing, management and entrepreneurship'),
        ('Science', 'science', '🔬', 'Biology, chemistry, physics and research methods'),
        ('General', 'general', '🌐', 'Life skills, philosophy, cross-discipline and everything else')
      ON CONFLICT DO NOTHING
    `)
    console.log('Fields seeded successfully!')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

seed()