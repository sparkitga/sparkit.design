// ====== DATA: update this to match your work ======
const PROJECTS = [
  {
    title: "Brand Impact Hub (Portal)",
    description: "A lightweight internal portal for brand assets, print requests, and quick links.",
    tags: ["web", "ops", "brand"],
    repo: "https://github.com/yourusername/brand-impact-hub",
    live: "https://yourusername.github.io/brand-impact-hub/",
    thumbText: "PORTAL"
  },
  {
    title: "Short-Form Video System",
    description: "Repeatable workflow for scripting, editing, and publishing weekly content.",
    tags: ["video", "ops"],
    repo: "https://github.com/yourusername/video-system",
    live: "",
    thumbText: "VIDEO"
  },
  {
    title: "Campaign Landing Page",
    description: "Fast, responsive landing page with clear CTA and conversion-focused layout.",
    tags: ["web", "brand"],
    repo: "https://github.com/yourusername/landing-page",
    live: "https://yourusername.github.io/landing-page/",
    thumbText: "WEB"
  }
];

// ====== UI Helpers ======
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

// Year in footer
$("#year").textContent = new Date().getFullYear();

// Mobile nav
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

// Close mobile nav on link click
$$(".nav-link", navMenu).forEach((a) => {
  a.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Render projects
const projectsGrid = $("#projectsGrid");

function projectCard(p) {
  const tagChips = p.tags.map(t => `<span class="tag">${t}</span>`).join("");
  const liveLink = p.live
    ? `<a class="btn" href="${p.live}" target="_blank" rel="noreferrer">Live</a>`
    : `<span class="btn ghost" aria-disabled="true" style="opacity:.5; pointer-events:none;">No Live</span>`;

  return `
    <article class="project" data-tags="${p.tags.join(",")}">
      <div class="thumb">${p.thumbText || "PROJECT"}</div>
      <div class="content">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="tags">${tagChips}</div>
      </div>
      <div class="links">
        ${liveLink}
        <a class="btn ghost" href="${p.repo}" target="_blank" rel="noreferrer">Repo</a>
      </div>
    </article>
  `;
}

function renderProjects(filter = "all") {
  const items = PROJECTS.filter(p => filter === "all" ? true : p.tags.includes(filter));
  projectsGrid.innerHTML = items.map(projectCard).join("");

  if (items.length === 0) {
    projectsGrid.innerHTML = `
      <div class="panel" style="grid-column:1/-1;">
        <strong>No projects in this category yet.</strong>
        <p class="muted" style="margin:8px 0 0;">Add a project in <code>script.js</code> and tag it to show here.</p>
      </div>
    `;
  }
}

renderProjects();

// Filter buttons
const chips = $$(".chip");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    renderProjects(chip.dataset.filter);
  });
});

// Active link highlighting on scroll
const sections = ["about", "projects", "skills", "contact"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

const navLinks = $$(".nav-link").filter(a => a.getAttribute("href")?.startsWith("#"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute("id");
    navLinks.forEach(a => {
      const on = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("active", on);
    });
  });
}, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });

sections.forEach(s => observer.observe(s));

// Contact form -> mailto
const contactForm = $("#contactForm");
const formNote = $("#formNote");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();

  const to = "youremail@example.com";
  const subject = encodeURIComponent(`Portfolio Inquiry — ${name}`);
  const body = encodeURIComponent(
`Name: ${name}
Email: ${email}

Message:
${message}
`
  );

  // Open email client
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  formNote.textContent = "Opening your email client now…";
});
