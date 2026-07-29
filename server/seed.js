const bcrypt = require('bcryptjs');
const { readJSON, writeJSON, exists } = require('./utils/dataStore');

const defaultContent = require('./data/content.json');

const MERGE_CONTENT_SECTIONS = ['homeWorkWithUs', 'homeCertificates'];

async function mergeContentDefaults() {
  const content = await readJSON('content.json');
  if (!content) return;

  let changed = false;
  for (const key of MERGE_CONTENT_SECTIONS) {
    if (!content[key] && defaultContent[key]) {
      content[key] = defaultContent[key];
      changed = true;
    }
  }

  if (changed) {
    await writeJSON('content.json', content);
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Merged new homepage content sections');
    }
  }
}

async function seed() {
  if (!(await exists('admin.json'))) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminData = {
      users: [
        {
          id: '1',
          email: 'admin@galler.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'admin@gmail.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    await writeJSON('admin.json', adminData);
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Default admin users created:');
      console.log('  - admin@galler.com / admin123');
      console.log('  - admin@gmail.com / admin123');
    }
  }

  if (!(await exists('content.json'))) {
    await writeJSON('content.json', defaultContent);
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Default homepage content created');
    }
  } else {
    await mergeContentDefaults();
  }

  if (!(await exists('careers-jobs.json'))) {
    const defaultJobs = require('./data/careers-jobs.json');
    await writeJSON('careers-jobs.json', defaultJobs);
  }
}

module.exports = seed;
