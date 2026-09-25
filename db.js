const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

let pgPool = null;
let sqliteDb = null;
const isPostgres = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

if (isPostgres) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  pgPool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  const dbPath = path.join(__dirname, 'portfolio.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

// SQL Helper to work with both PostgreSQL and SQLite
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      // Convert SQLite '?' placeholders to PostgreSQL '$1', '$2', etc.
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      pgPool.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
      // For SELECT queries or RETURNING queries
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
    }
  });
}

async function initDb() {
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
      id INTEGER PRIMARY KEY ${isPostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY ${isPostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
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
      id INTEGER PRIMARY KEY ${isPostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      location TEXT,
      period TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY ${isPostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY ${isPostgres ? 'GENERATED ALWAYS AS IDENTITY' : 'AUTOINCREMENT'},
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const sql of createTablesSql) {
    await query(sql);
  }

  await seedInitialData();
}

async function seedInitialData() {
  const profiles = await query('SELECT * FROM profile WHERE id = 1');
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
      ]
    );
  }

  const skillsCount = await query('SELECT COUNT(*) as count FROM skills');
  const countVal = parseInt(skillsCount[0].count || skillsCount[0].COUNT || 0, 10);
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
      ]);
    }
  }

  const projectsCount = await query('SELECT COUNT(*) as count FROM projects');
  const projCountVal = parseInt(projectsCount[0].count || projectsCount[0].COUNT || 0, 10);
  if (projCountVal === 0) {
    const initialProjects = [
      {
        title: 'Full Stack Personal Portfolio',
        description: 'A responsive, database-driven personal portfolio showcase built with Node.js, Express, HTML/CSS/JS, and SQL database.',
        long_description: 'This project implements a complete generic personal portfolio template with a RESTful backend API and database integration. Project data, skills, education, and contact messages are dynamically managed and stored.',
        number_label: '01',
        tags: 'Node.js, Express, HTML, CSS, JavaScript, PostgreSQL/SQLite',
        demo_url: '#',
        repo_url: '#',
        display_order: 1
      },
      {
        title: 'Task Management Application',
        description: 'A full-stack task organizer allowing users to create, categorize, update, and track status of daily tasks.',
        long_description: 'Features a clean UI connected to RESTful endpoints for CRUD operations on tasks, task priority management, and persistent storage.',
        number_label: '02',
        tags: 'JavaScript, Node.js, Express, REST API, Database',
        demo_url: '#',
        repo_url: '#',
        display_order: 2
      },
      {
        title: 'E-Commerce Platform Template',
        description: 'A web application featuring dynamic product catalog displays, shopping cart functionality, and checkout flow API.',
        long_description: 'Built with modular architecture, backend product endpoints, database schema for items and orders, and client-side reactive rendering.',
        number_label: '03',
        tags: 'HTML5, CSS3, JavaScript, Node.js, Express, SQL',
        demo_url: '#',
        repo_url: '#',
        display_order: 3
      },
      {
        title: 'RESTful API & Content Engine',
        description: 'A lightweight backend web service providing structured JSON data endpoints and database integration.',
        long_description: 'Provides standardized API routes, request input validation, CORS middleware support, and structured database error handling.',
        number_label: '04',
        tags: 'Node.js, Express, JSON API, PostgreSQL, Middleware',
        demo_url: '#',
        repo_url: '#',
        display_order: 4
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
        ]
      );
    }
  }

  const eduCount = await query('SELECT COUNT(*) as count FROM education');
  const eduCountVal = parseInt(eduCount[0].count || eduCount[0].COUNT || 0, 10);
  if (eduCountVal === 0) {
    const initialEdu = [
      {
        institution: 'University / Institution Name',
        degree: 'Bachelor of Technology / Science in Computer Science / IT',
        location: 'City, Country',
        period: '2021 - 2025',
        display_order: 1
      },
      {
        institution: 'Higher Secondary School Name',
        degree: 'High School Education (Science & Mathematics Stream)',
        location: 'City, Country',
        period: '2019 - 2021',
        display_order: 2
      }
    ];

    for (const edu of initialEdu) {
      await query('INSERT INTO education (institution, degree, location, period, display_order) VALUES (?, ?, ?, ?, ?)', [
        edu.institution,
        edu.degree,
        edu.location,
        edu.period,
        edu.display_order
      ]);
    }
  }

  const expCount = await query('SELECT COUNT(*) as count FROM experience');
  const expCountVal = parseInt(expCount[0].count || expCount[0].COUNT || 0, 10);
  if (expCountVal === 0) {
    const initialExp = [
      {
        role: 'Full Stack Development Intern',
        company: 'Technology Internship Program',
        location: 'Remote',
        period: '2024 - Present',
        description: 'Developed scalable web applications, designed database schemas, built RESTful backend services with Express.js, and implemented responsive user interfaces.',
        display_order: 1
      },
      {
        role: 'Web Development Trainee',
        company: 'Technical Training Academy',
        location: 'City, Country',
        period: '2023 - 2024',
        description: 'Gained hands-on experience in HTML5, CSS3, JavaScript DOM manipulation, backend API integration, version control with Git, and database modeling.',
        display_order: 2
      }
    ];

    for (const exp of initialExp) {
      await query('INSERT INTO experience (role, company, location, period, description, display_order) VALUES (?, ?, ?, ?, ?, ?)', [
        exp.role,
        exp.company,
        exp.location,
        exp.period,
        exp.description,
        exp.display_order
      ]);
    }
  }
}

async function getProfile() {
  const rows = await query('SELECT * FROM profile WHERE id = 1');
  return rows[0] || null;
}

async function getSkills() {
  return await query('SELECT * FROM skills ORDER BY display_order ASC, id ASC');
}

async function getProjects() {
  return await query('SELECT * FROM projects ORDER BY display_order ASC, id ASC');
}

async function getEducation() {
  return await query('SELECT * FROM education ORDER BY display_order ASC, id ASC');
}

async function getExperience() {
  return await query('SELECT * FROM experience ORDER BY display_order ASC, id ASC');
}

async function saveContactMessage(name, email, message) {
  const result = await query(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message]
  );
  return result;
}

async function getContactMessages() {
  return await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
}

module.exports = {
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
