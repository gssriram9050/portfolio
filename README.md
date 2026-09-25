# Full-Stack Personal Portfolio Website

## Overview
A modern, generic, responsive, full-stack personal portfolio template designed to showcase developer skills, education, work experience, featured projects, and contact details. Built with a clean 3-tier architecture (Frontend → Backend/API → Database), this template connects a dynamic client interface to a Node.js/Express RESTful API backed by a SQL database engine (PostgreSQL or SQLite).

## Why This Project
Personal portfolios are an essential tool for software engineers to present their technical proficiency, completed work, and professional background. Standard static portfolios lack server-side dynamic content management and real persistent data handling. This full-stack portfolio provides a dynamic system where skills, education records, project showcases, and user contact messages are stored in and served directly from a relational database.

## Thiranex Internship Context
This project was enhanced and finalized as part of the **Full Stack Development Internship** at **Thiranex Education LLP**. It demonstrates practical competency in end-to-end web software development, including responsive frontend engineering, server-side API design, database schema management, and cloud application deployment.

## Original Internship Task
The original task specification provided for this project was:

> "Build a full-stack personal portfolio to showcase your projects and skills."

Required capabilities:
- **Frontend:** HTML, CSS, JavaScript (or React.js)
- **Backend:** Node.js & Express.js (or Django/Flask)
- **Database:** MySQL, MongoDB, or PostgreSQL
- **Deployment:** Public live deployment where frontend, backend, and database actively communicate.

## Features
- **Dynamic Content Engine:** Portfolio details (Profile, Skills, Projects, Education, Experience) are retrieved dynamically from the backend API.
- **Database-Backed Contact Form:** Contact form submissions are validated and saved directly into the SQL database.
- **Responsive & Accessible UI:** Modern dark/light theme toggle, mobile navigation hamburger menu, and fluid layout adjustments across desktop, tablet, and mobile devices.
- **Interactive Project Modals:** Dedicated modal dialogs displaying extended project descriptions and technology tags.
- **Multi-Database Support:** Native compatibility with PostgreSQL for production cloud deployment and SQLite for zero-configuration local development.
- **Generic & Reusable Structure:** Completely sanitized of personal identifiers, making it instantly adaptable for any developer portfolio.

## Technology Stack
- **Frontend:** HTML5, CSS3 (CSS Variables, Flexbox, Grid), Vanilla JavaScript (ES6+ Fetch API, DOM API)
- **Backend:** Node.js, Express.js framework
- **Database:** PostgreSQL (Production / Cloud), SQLite (Local zero-config fallback via `sqlite3`)
- **Middleware & Libraries:** `cors`, `dotenv`, `pg` (PostgreSQL client)

## Architecture
The project follows a standard 3-tier monolithic application architecture:

```text
+-------------------------------------------------------+
|                   Client Browser                      |
|         (HTML5 / CSS3 / Vanilla JavaScript)           |
+---------------------------+---------------------------+
                            |
                     HTTP / REST API
                            |
+---------------------------v---------------------------+
|                   Node.js / Express                   |
|           (Static Server & REST Endpoints)            |
+---------------------------+---------------------------+
                            |
                   Database Driver / SQL
                            |
+---------------------------v---------------------------+
|                   Database Engine                     |
|                (PostgreSQL / SQLite)                  |
+-------------------------------------------------------+
```

## Database
The database layer manages 6 core relational tables:

1. `profile`: Stores name, role, hero summary, about text, tagline, and contact links.
2. `skills`: Stores technical skills categorized by domain (Languages, Web, Databases, Tools).
3. `projects`: Stores portfolio project title, summary, extended descriptions, tags, and links.
4. `education`: Stores academic degrees, institutions, locations, and attendance periods.
5. `experience`: Stores professional roles, organization names, locations, and descriptions.
6. `contact_messages`: Stores inbound contact form submissions (`name`, `email`, `message`, `created_at`).

## API
The backend exposes the following RESTful endpoints:

- `GET /api/health` — System status and timestamp
- `GET /api/profile` — Retrieves portfolio owner profile details
- `GET /api/skills` — Retrieves technical skills array
- `GET /api/projects` — Retrieves list of all showcase projects
- `GET /api/projects/:id` — Retrieves detailed information for a specific project
- `GET /api/education` — Retrieves academic history records
- `GET /api/experience` — Retrieves work experience history
- `POST /api/contact` — Submits a contact form message (saves record to database)

## Project Structure
```text
.
├── index.html        # Main HTML layout & structured semantic sections
├── style.css         # Modern CSS styles, variables, & theme definitions
├── script.js        # Client-side JavaScript & API fetch handlers
├── server.js        # Express application & REST API server
├── db.js            # Database connection, schema creation, & auto-seeding
├── package.json     # Project dependencies & startup scripts
├── .env.example     # Environment variable blueprint
└── README.md        # Documentation
```

## Local Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment (Optional for local run):**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Start the application:**
   ```bash
   npm start
   ```
   The application will automatically initialize the local `portfolio.db` SQLite database, seed initial generic data, and start listening at `http://localhost:5000`.

## Database Setup
- **Local SQLite:** Automatically initialized when running `npm start`. No manual database server setup is required.
- **Production PostgreSQL:** Supply a valid PostgreSQL connection string in the `DATABASE_URL` environment variable. On startup, the backend automatically creates tables and seeds default data if tables are empty.

## Deployment
This repository contains the complete full-stack portfolio code ready for deployment:

1. **GitHub Repository:** `https://github.com/gssriram9050/portfolio.git`
2. **Cloudflare / Web Service Deployment:**
   - **Frontend:** Static assets (`index.html`, `style.css`, `script.js`) can be served via Cloudflare Pages or Express static server.
   - **Backend & Database:** Deploy `server.js` with `DATABASE_URL` (PostgreSQL) to your preferred Node.js runtime host or web service container.

## Live Demo
- **Repository:** [https://github.com/gssriram9050/portfolio.git](https://github.com/gssriram9050/portfolio.git)

## GitHub
- **Repository URL:** `https://github.com/gssriram9050/portfolio.git`

## Internship Attribution
This project was developed as part of the **Full Stack Development Internship** at **Thiranex Education LLP**.

## Scope / Limitations
- This repository is designed exclusively as a generic personal portfolio showcase.
- Unrelated features such as e-commerce checkout, user blog publishing, payment processing, or live chat support are out of scope.
- Authentication for an administrative content management system can be added as a future upgrade.

## Future Improvements
- Admin dashboard route with authentication to allow editing portfolio records directly through the web UI.
- File upload support for resume PDFs and project thumbnail images.
- Integration with external email notification services (e.g., SendGrid/Nodemailer) for real-time contact alerts.
