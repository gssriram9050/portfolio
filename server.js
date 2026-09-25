import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : '';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (HTML, CSS, JS) from public folder or root
if (__dirname) {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname)));
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
    const profile = await db.getProfile();
    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

app.get('/api/skills', async (req, res) => {
  try {
    const skills = await db.getSkills();
    res.json(skills);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to retrieve skills data' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to retrieve projects data' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const projects = await db.getProjects();
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
    const education = await db.getEducation();
    res.json(education);
  } catch (err) {
    console.error('Error fetching education:', err);
    res.status(500).json({ error: 'Failed to retrieve education data' });
  }
});

app.get('/api/experience', async (req, res) => {
  try {
    const experience = await db.getExperience();
    res.json(experience);
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
    await db.saveContactMessage(name.trim(), email.trim(), message.trim());
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

// Fallback to index.html for non-API routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && __dirname) {
    const publicIndexPath = path.join(__dirname, 'public', 'index.html');
    const rootIndexPath = path.join(__dirname, 'index.html');
    const fs = require('fs');
    if (fs && fs.existsSync && fs.existsSync(publicIndexPath)) {
      return res.sendFile(publicIndexPath);
    } else if (fs && fs.existsSync && fs.existsSync(rootIndexPath)) {
      return res.sendFile(rootIndexPath);
    }
  }
  next();
});

// If executed directly via node server.js
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
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
