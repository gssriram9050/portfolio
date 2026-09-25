/* ==============================
   Small helpers
============================== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const body = document.body;
const header = $("#siteHeader");
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
const scrollProgress = $("#scrollProgress");
const backToTop = $("#backToTop");
const themeToggle = $("#themeToggle");
const themeIcon = $(".theme-icon");

/* ==============================
   Current year
============================== */
if ($("#year")) {
  $("#year").textContent = new Date().getFullYear();
}

/* ==============================
   Theme toggle with localStorage
============================== */
const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "light") {
  body.classList.add("light-mode");
  if (themeIcon) themeIcon.textContent = "☀";
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    const isLight = body.classList.contains("light-mode");
    if (themeIcon) themeIcon.textContent = isLight ? "☀" : "☾";
    localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
  });
}

/* ==============================
   Responsive mobile navigation
============================== */
function closeMobileMenu() {
  if (navToggle && navMenu) {
    navToggle.classList.remove("active");
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  }
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("menu-open", isOpen);
  });
}

$$(".nav-menu a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

/* ==============================
   Animated typing effect
============================== */
const typingText = $("#typingText");
const typingPhrases = [
  "Full Stack Web Developer",
  "REST API Designer",
  "Database Developer",
  "Problem Solver"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeHeroText() {
  if (!typingText) return;
  const currentPhrase = typingPhrases[phraseIndex];
  const visibleText = currentPhrase.slice(0, charIndex);
  typingText.textContent = visibleText;

  if (!isDeleting && charIndex < currentPhrase.length) {
    charIndex += 1;
    setTimeout(typeHeroText, 85);
    return;
  }

  if (isDeleting && charIndex > 0) {
    charIndex -= 1;
    setTimeout(typeHeroText, 42);
    return;
  }

  if (!isDeleting) {
    isDeleting = true;
    setTimeout(typeHeroText, 1100);
  } else {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % typingPhrases.length;
    setTimeout(typeHeroText, 250);
  }
}

typeHeroText();

/* ==============================
   Scroll effects and active links
============================== */
const sections = $$("section[id]");
const navLinks = $$(".nav-menu a");

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
  if (header) header.classList.toggle("scrolled", scrollTop > 20);
  if (backToTop) backToTop.classList.toggle("visible", scrollTop > 550);

  let currentSection = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 140;
    if (scrollTop >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
  });
}

window.addEventListener("scroll", updateScrollUI);
window.addEventListener("load", updateScrollUI);

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==============================
   Scroll reveal animations
============================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

$$(".reveal").forEach((element) => revealObserver.observe(element));

/* ==============================
   Fetch Data from Backend & API
============================== */

async function fetchProfile() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) return;
    const profile = await res.json();
    if (!profile) return;

    if ($("#brandName")) $("#brandName").textContent = profile.name;
    if ($("#heroName")) $("#heroName").textContent = profile.name;
    if ($("#heroRole")) $("#heroRole").textContent = profile.role;
    if ($("#heroSummary")) $("#heroSummary").textContent = profile.hero_summary;
    if ($("#cardName")) $("#cardName").textContent = profile.name;
    if ($("#cardTagline")) $("#cardTagline").textContent = profile.tagline || profile.role;
    if ($("#aboutText")) $("#aboutText").textContent = profile.about_text;
    if ($("#footerName")) $("#footerName").textContent = profile.name;

    const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'YN';
    if ($("#brandInitials")) $("#brandInitials").textContent = initials;
    if ($("#cardInitials")) $("#cardInitials").textContent = initials;

    if (profile.email) {
      if ($("#heroEmail")) $("#heroEmail").href = `mailto:${profile.email}`;
      if ($("#contactEmailLink")) {
        $("#contactEmailLink").href = `mailto:${profile.email}`;
        $("#contactEmailLink").textContent = profile.email;
      }
    }
    if (profile.phone && $("#contactPhone")) {
      $("#contactPhone").href = `tel:${profile.phone.replace(/[^0-9+]/g, '')}`;
      $("#contactPhone").textContent = profile.phone;
    }
    if (profile.github_url) {
      if ($("#heroGithub")) $("#heroGithub").href = profile.github_url;
      if ($("#contactGithub")) {
        $("#contactGithub").href = profile.github_url;
        $("#contactGithub").textContent = profile.github_url.replace('https://', '');
      }
    }
    if (profile.linkedin_url) {
      if ($("#heroLinkedin")) $("#heroLinkedin").href = profile.linkedin_url;
      if ($("#contactLinkedin")) {
        $("#contactLinkedin").href = profile.linkedin_url;
        $("#contactLinkedin").textContent = profile.linkedin_url.replace('https://', '');
      }
    }
  } catch (err) {
    console.error('Error loading profile from API:', err);
  }
}

async function fetchSkills() {
  const container = $("#skillsGrid");
  if (!container) return;
  try {
    const res = await fetch('/api/skills');
    if (!res.ok) return;
    const skills = await res.json();
    if (!Array.isArray(skills) || skills.length === 0) return;

    // Group skills by category
    const categories = {};
    skills.forEach(skill => {
      const cat = skill.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(skill.name);
    });

    container.innerHTML = Object.entries(categories).map(([category, list]) => `
      <article class="skill-card">
        <h3>${category}</h3>
        <div class="tag-list">
          ${list.map(name => `<span>${name}</span>`).join('')}
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Error loading skills from API:', err);
  }
}

let loadedProjects = [];

async function fetchProjects() {
  const container = $("#projectsGrid");
  if (!container) return;
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) return;
    const projects = await res.json();
    if (!Array.isArray(projects) || projects.length === 0) return;

    loadedProjects = projects;
    container.innerHTML = projects.map(proj => `
      <article class="project-card" data-id="${proj.id}">
        <div class="project-number">${proj.number_label || `0${proj.id}`}</div>
        <h3>${proj.title}</h3>
        <p>${proj.description}</p>
        <button class="text-btn open-project" type="button" data-id="${proj.id}">View Details</button>
      </article>
    `).join('');

    // Attach event listeners to project detail buttons
    $$(".open-project").forEach((button) => {
      button.addEventListener("click", () => {
        const projId = parseInt(button.dataset.id, 10);
        const proj = loadedProjects.find(p => p.id === projId);
        if (proj) openProjectModal(proj);
      });
    });
  } catch (err) {
    console.error('Error loading projects from API:', err);
  }
}

async function fetchEducation() {
  const container = $("#educationList");
  if (!container) return;
  try {
    const res = await fetch('/api/education');
    if (!res.ok) return;
    const education = await res.json();
    if (!Array.isArray(education) || education.length === 0) return;

    container.innerHTML = education.map(edu => `
      <article class="education-card glass-panel">
        <div>
          <h3>${edu.institution}</h3>
          <p><strong>${edu.degree}</strong></p>
          <p>${edu.location || ''}</p>
        </div>
        <span>${edu.period}</span>
      </article>
    `).join('');
  } catch (err) {
    console.error('Error loading education from API:', err);
  }
}

async function fetchExperience() {
  const container = $("#experienceList");
  if (!container) return;
  try {
    const res = await fetch('/api/experience');
    if (!res.ok) return;
    const experience = await res.json();
    if (!Array.isArray(experience) || experience.length === 0) return;

    container.innerHTML = experience.map(exp => `
      <article class="education-card glass-panel" style="margin-bottom: 1rem;">
        <div>
          <h3>${exp.role}</h3>
          <p><strong>${exp.company}</strong> — <em>${exp.location || ''}</em></p>
          <p style="margin-top: 0.5rem; color: var(--text-muted);">${exp.description}</p>
        </div>
        <span>${exp.period}</span>
      </article>
    `).join('');
  } catch (err) {
    console.error('Error loading experience from API:', err);
  }
}

/* ==============================
   Project details modal
============================== */
const projectModal = $("#projectModal");
const projectModalTitle = $("#projectModalTitle");
const projectModalTags = $("#projectModalTags");
const projectModalDescription = $("#projectModalDescription");

function openProjectModal(proj) {
  if (!projectModal) return;
  projectModalTitle.textContent = proj.title;
  projectModalDescription.textContent = proj.long_description || proj.description;
  
  if (projectModalTags && proj.tags) {
    const tagArray = proj.tags.split(',').map(t => t.trim());
    projectModalTags.innerHTML = tagArray.map(t => `<span>${t}</span>`).join('');
  } else if (projectModalTags) {
    projectModalTags.innerHTML = '';
  }

  projectModal.classList.add("show");
  projectModal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.remove("show");
  projectModal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
}

$$("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeProjectModal);
});

/* ==============================
   Contact form - Backend Integration
============================== */
const contactForm = $("#contactForm");
const formNote = $("#formNote");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nameInput = $("#name");
    const emailInput = $("#email");
    const messageInput = $("#message");

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !email || !message) {
      if (formNote) formNote.textContent = "Please fill in all fields.";
      return;
    }

    if (formNote) formNote.textContent = "Sending message to server...";

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (formNote) {
          formNote.style.color = "#4caf50";
          formNote.textContent = data.message || "Thank you! Message saved to database.";
        }
        contactForm.reset();
      } else {
        if (formNote) {
          formNote.style.color = "#f44336";
          formNote.textContent = data.error || "Failed to send message.";
        }
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      if (formNote) {
        formNote.style.color = "#f44336";
        formNote.textContent = "Network error while connecting to server.";
      }
    }
  });
}

/* ==============================
   Keyboard support for modal
============================== */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
  }
});

/* ==============================
   Load all sections on DOM ready
============================== */
document.addEventListener("DOMContentLoaded", () => {
  fetchProfile();
  fetchSkills();
  fetchProjects();
  fetchEducation();
  fetchExperience();
});
