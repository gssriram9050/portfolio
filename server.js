import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : '';

const app = express();
const PORT = (typeof process !== 'undefined' && process.env && process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets in Node.js server environment
if (__dirname) {
  try {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname)));
  } catch (e) {
    // Ignore static middleware in serverless isolates
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Full-Stack Portfolio API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await db.getProfile(req.env);
    res.json(profile || {
      name: 'Your Name',
      role: 'Full Stack Software Developer',
      hero_summary: 'A dedicated developer passionate about building clean, efficient, and user-friendly full-stack web applications.',
      about_text: 'Welcome to my portfolio! I specialize in full-stack web development with RESTful APIs and database solutions.',
      tagline: 'Building robust & scalable full-stack applications',
      email: 'developer@example.com',
      phone: '+1 (000) 000-0000',
      location: 'City, Country',
      github_url: 'https://github.com/example',
      linkedin_url: 'https://linkedin.com/in/example',
      resume_url: '#'
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

app.get('/api/skills', async (req, res) => {
  try {
    const skills = await db.getSkills(req.env);
    res.json(skills.length > 0 ? skills : [
      { category: 'Programming Languages', name: 'JavaScript', display_order: 1 },
      { category: 'Programming Languages', name: 'Python', display_order: 2 },
      { category: 'Web Technologies', name: 'HTML5', display_order: 3 },
      { category: 'Web Technologies', name: 'CSS3', display_order: 4 },
      { category: 'Web Technologies', name: 'Node.js', display_order: 5 },
      { category: 'Web Technologies', name: 'Express.js', display_order: 6 },
      { category: 'Databases', name: 'PostgreSQL', display_order: 7 },
      { category: 'Databases', name: 'SQLite', display_order: 8 }
    ]);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to retrieve skills data' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.getProjects(req.env);
    res.json(projects.length > 0 ? projects : [
      {
        id: 1,
        title: 'Full Stack Personal Portfolio',
        description: 'A responsive, database-driven personal portfolio showcase built with Node.js, Express, HTML/CSS/JS, and SQL database.',
        long_description: 'This project implements a complete generic personal portfolio template with a RESTful backend API and database integration.',
        number_label: '01',
        tags: 'Node.js, Express, HTML, CSS, JavaScript, PostgreSQL',
        demo_url: '#',
        repo_url: '#',
        display_order: 1
      },
      {
        id: 2,
        title: 'Task Management Application',
        description: 'A full-stack task organizer allowing users to create, categorize, update, and track status of daily tasks.',
        long_description: 'Features a clean UI connected to RESTful endpoints for CRUD operations on tasks and persistent storage.',
        number_label: '02',
        tags: 'JavaScript, Node.js, Express, REST API, Database',
        demo_url: '#',
        repo_url: '#',
        display_order: 2
      }
    ]);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to retrieve projects data' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const projects = await db.getProjects(req.env);
    const proj = projects.find(p => p.id === parseInt(req.params.id, 10));
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(proj);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to retrieve project detail' });
  }
});

app.get('/api/education', async (req, res) => {
  try {
    const education = await db.getEducation(req.env);
    res.json(education.length > 0 ? education : [
      {
        id: 1,
        institution: 'University / Institution Name',
        degree: 'Bachelor of Technology / Science in Computer Science / IT',
        location: 'City, Country',
        period: '2021 - 2025',
        display_order: 1
      }
    ]);
  } catch (err) {
    console.error('Error fetching education:', err);
    res.status(500).json({ error: 'Failed to retrieve education data' });
  }
});

app.get('/api/experience', async (req, res) => {
  try {
    const experience = await db.getExperience(req.env);
    res.json(experience.length > 0 ? experience : [
      {
        id: 1,
        role: 'Full Stack Development Intern',
        company: 'Technology Internship Program',
        location: 'Remote',
        period: '2024 - Present',
        description: 'Developed web applications, designed database schemas, built RESTful backend services with Express.js.',
        display_order: 1
      }
    ]);
  } catch (err) {
    console.error('Error fetching experience:', err);
    res.status(500).json({ error: 'Failed to retrieve experience data' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields (name, email, message) are required.'
    });
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address.'
    });
  }

  try {
    await db.saveContactMessage(name.trim(), email.trim(), message.trim(), req.env);
    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been stored in the database.'
    });
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to save contact message to database.'
    });
  }
});

// JSON Fallback for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Fallback to index.html ONLY when running in standard Node.js server mode
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && typeof process !== 'undefined' && process.release && process.release.name === 'node') {
    try {
      const publicIndexPath = path.join(__dirname, 'public', 'index.html');
      const rootIndexPath = path.join(__dirname, 'index.html');
      const fs = require('fs');
      if (fs.existsSync(publicIndexPath)) {
        return res.sendFile(publicIndexPath);
      } else if (fs.existsSync(rootIndexPath)) {
        return res.sendFile(rootIndexPath);
      }
    } catch (e) {}
  }
  next();
});

if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && process.argv[1].endsWith('server.js')) {
  db.initDb()
    .then(() => {
      console.log('Database initialized successfully.');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

export default app;
