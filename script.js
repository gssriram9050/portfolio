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
$("#year").textContent = new Date().getFullYear();

/* ==============================
   Theme toggle with localStorage
============================== */
const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "light") {
  body.classList.add("light-mode");
  themeIcon.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("light-mode");
  const isLight = body.classList.contains("light-mode");
  themeIcon.textContent = isLight ? "☀" : "☾";
  localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
});

/* ==============================
   Responsive mobile navigation
============================== */
function closeMobileMenu() {
  navToggle.classList.remove("active");
  navMenu.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
}

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.classList.toggle("active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("menu-open", isOpen);
});

$$(".nav-menu a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

/* ==============================
   Animated typing effect
============================== */
const typingText = $("#typingText");
const typingPhrases = [
  "Aspiring Developer",
  "Student",
  "Web Technology Learner",
  "Problem Solver"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeHeroText() {
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

  scrollProgress.style.width = `${progress}%`;
  header.classList.toggle("scrolled", scrollTop > 20);
  backToTop.classList.toggle("visible", scrollTop > 550);

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

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

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
   Project details modal
============================== */
const projectModal = $("#projectModal");
const projectModalTitle = $("#projectModalTitle");
const projectModalDescription = $("#projectModalDescription");

function openProjectModal(card) {
  projectModalTitle.textContent = card.dataset.title;
  projectModalDescription.textContent = card.dataset.description;
  projectModal.classList.add("show");
  projectModal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeProjectModal() {
  projectModal.classList.remove("show");
  projectModal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
}

$$(".open-project").forEach((button) => {
  button.addEventListener("click", () => openProjectModal(button.closest(".project-card")));
});

$$("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeProjectModal);
});

/* ==============================
   Frontend-only mock login modal
============================== */
const loginOpen = $("#loginOpen");
const loginModal = $("#loginModal");
const loginForm = $("#loginForm");
const loginNote = $("#loginNote");

function openLoginModal() {
  loginModal.classList.add("show");
  loginModal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeLoginModal() {
  loginModal.classList.remove("show");
  loginModal.setAttribute("aria-hidden", "true");
  loginNote.textContent = "";
  body.classList.remove("modal-open");
}

loginOpen.addEventListener("click", openLoginModal);

$$("[data-close-login]").forEach((button) => {
  button.addEventListener("click", closeLoginModal);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value.trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail) {
    loginNote.textContent = "Please enter a valid email address.";
    return;
  }

  if (password.length < 6) {
    loginNote.textContent = "Password must contain at least 6 characters.";
    return;
  }

  loginNote.textContent = "Login validated locally. No data is sent anywhere.";
  loginForm.reset();
});

/* ==============================
   Contact form demo validation
============================== */
const contactForm = $("#contactForm");
const formNote = $("#formNote");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formNote.textContent = "Thanks! This static demo validates the form locally.";
  contactForm.reset();
});

/* ==============================
   Keyboard support for modals
============================== */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
    closeLoginModal();
  }
});
