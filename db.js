import pg from 'pg';
const { Pool } = pg;

let pgPool = null;

function getDbConfig(env) {
  let connectionString = null;
  if (env && typeof env === 'object') {
    connectionString = env.DATABASE_URL || env.POSTGRES_URL;
  }
  if (!connectionString && typeof process !== 'undefined' && process.env) {
    connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  }
  const isPostgres = Boolean(connectionString);
  return { connectionString, isPostgres };
}

function getPgPool(env) {
  if (pgPool) return pgPool;
  const { connectionString } = getDbConfig(env);
  if (connectionString) {
    pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

export function query(sql, params = [], env = null) {
  return new Promise(async (resolve, reject) => {
    const { connectionString, isPostgres } = getDbConfig(env);

    if (isPostgres || connectionString) {
      const pool = getPgPool(env);
      if (!pool) {
        return reject(new Error('PostgreSQL connection string (DATABASE_URL) is missing'));
      }
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      pool.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
      // Local Node.js SQLite fallback
      try {
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const sqlite3Module = await import('sqlite3');
        const sqlite3 = sqlite3Module.default || sqlite3Module;
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const dbPath = path.join(__dirname, 'portfolio.db');
        const sqliteDb = new sqlite3.verbose().Database(dbPath);

        const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
        if (isSelect) {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          });
        } else {
          sqliteDb.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
          });
        }
      } catch (err) {
        return resolve([]);
      }
    }
  });
}

export async function initDb(env = null) {
  const { connectionString } = getDbConfig(env);
  const usePostgres = Boolean(connectionString);

  const createTablesSql = [
    `CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      hero_summary TEXT NOT NULL,
      about_text TEXT NOT NULL,
      tagline TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      resume_url TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY ${usePostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY ${usePostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT,
      number_label TEXT,
      tags TEXT,
      demo_url TEXT,
      repo_url TEXT,
      display_order INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY ${usePostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      location TEXT,
      period TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY ${usePostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY ${usePostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const sql of createTablesSql) {
    await query(sql, [], env);
  }

  await seedInitialData(env);
}

async function seedInitialData(env = null) {
  try {
    const profiles = await query('SELECT * FROM profile WHERE id = 1', [], env);
    if (profiles.length === 0) {
      await query(
        `INSERT INTO profile (id, name, role, hero_summary, about_text, tagline, email, phone, location, github_url, linkedin_url, resume_url)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Your Name',
          'Full Stack Software Developer',
          'A dedicated developer passionate about building clean, efficient, and user-friendly full-stack web applications with modern technologies.',
          'Welcome to my portfolio! I specialize in full-stack web development, working with frontend interfaces, backend RESTful APIs, and database architectures. I enjoy solving complex technical challenges and building scalable software solutions.',
          'Building robust & scalable full-stack applications',
          'developer@example.com',
          '+1 (000) 000-0000',
          'City, Country',
          'https://github.com/example',
          'https://linkedin.com/in/example',
          '#'
        ],
        env
      );
    }

    const skillsCount = await query('SELECT COUNT(*) as count FROM skills', [], env);
    const countVal = parseInt(skillsCount[0]?.count || skillsCount[0]?.COUNT || 0, 10);
    if (countVal === 0) {
      const initialSkills = [
        { category: 'Programming Languages', name: 'JavaScript', display_order: 1 },
        { category: 'Programming Languages', name: 'Python', display_order: 2 },
        { category: 'Programming Languages', name: 'TypeScript', display_order: 3 },
        { category: 'Programming Languages', name: 'SQL', display_order: 4 },
        { category: 'Web Technologies', name: 'HTML5', display_order: 5 },
        { category: 'Web Technologies', name: 'CSS3', display_order: 6 },
        { category: 'Web Technologies', name: 'Node.js', display_order: 7 },
        { category: 'Web Technologies', name: 'Express.js', display_order: 8 },
        { category: 'Databases', name: 'PostgreSQL', display_order: 9 },
        { category: 'Databases', name: 'MySQL', display_order: 10 },
        { category: 'Databases', name: 'MongoDB', display_order: 11 },
        { category: 'Databases', name: 'SQLite', display_order: 12 },
        { category: 'Tools & Version Control', name: 'Git', display_order: 13 },
        { category: 'Tools & Version Control', name: 'GitHub', display_order: 14 },
        { category: 'Tools & Version Control', name: 'REST APIs', display_order: 15 },
        { category: 'Tools & Version Control', name: 'VS Code', display_order: 16 }
      ];

      for (const skill of initialSkills) {
        await query('INSERT INTO skills (category, name, display_order) VALUES (?, ?, ?)', [
          skill.category,
          skill.name,
          skill.display_order
        ], env);
      }
    }

    const projectsCount = await query('SELECT COUNT(*) as count FROM projects', [], env);
    const projCountVal = parseInt(projectsCount[0]?.count || projectsCount[0]?.COUNT || 0, 10);
    if (projCountVal === 0) {
      const initialProjects = [
        {
          title: 'Full Stack Personal Portfolio',
          description: 'A responsive, database-driven personal portfolio showcase built with Node.js, Express, HTML/CSS/JS, and SQL database.',
          long_description: 'This project implements a complete generic personal portfolio template with a RESTful backend API and database integration.',
          number_label: '01',
          tags: 'Node.js, Express, HTML, CSS, JavaScript, PostgreSQL/SQLite',
          demo_url: '#',
          repo_url: '#',
          display_order: 1
        },
        {
          title: 'Task Management Application',
          description: 'A full-stack task organizer allowing users to create, categorize, update, and track status of daily tasks.',
          long_description: 'Features a clean UI connected to RESTful endpoints for CRUD operations on tasks and persistent storage.',
          number_label: '02',
          tags: 'JavaScript, Node.js, Express, REST API, Database',
          demo_url: '#',
          repo_url: '#',
          display_order: 2
        }
      ];

      for (const proj of initialProjects) {
        await query(
          `INSERT INTO projects (title, description, long_description, number_label, tags, demo_url, repo_url, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            proj.title,
            proj.description,
            proj.long_description,
            proj.number_label,
            proj.tags,
            proj.demo_url,
            proj.repo_url,
            proj.display_order
          ],
          env
        );
      }
    }
  } catch (err) {
    console.warn('Data seeding notice:', err.message);
  }
}

export async function getProfile(env = null) {
  try {
    const rows = await query('SELECT * FROM profile WHERE id = 1', [], env);
    return rows[0] || null;
  } catch (e) {
    return null;
  }
}

export async function getSkills(env = null) {
  try {
    return await query('SELECT * FROM skills ORDER BY display_order ASC, id ASC', [], env);
  } catch (e) {
    return [];
  }
}

export async function getProjects(env = null) {
  try {
    return await query('SELECT * FROM projects ORDER BY display_order ASC, id ASC', [], env);
  } catch (e) {
    return [];
  }
}

export async function getEducation(env = null) {
  try {
    return await query('SELECT * FROM education ORDER BY display_order ASC, id ASC', [], env);
  } catch (e) {
    return [];
  }
}

export async function getExperience(env = null) {
  try {
    return await query('SELECT * FROM experience ORDER BY display_order ASC, id ASC', [], env);
  } catch (e) {
    return [];
  }
}

export async function saveContactMessage(name, email, message, env = null) {
  return await query(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    env
  );
}

export async function getContactMessages(env = null) {
  try {
    return await query('SELECT * FROM contact_messages ORDER BY created_at DESC', [], env);
  } catch (e) {
    return [];
  }
}

export default {
  query,
  initDb,
  getProfile,
  getSkills,
  getProjects,
  getEducation,
  getExperience,
  saveContactMessage,
  getContactMessages
};
