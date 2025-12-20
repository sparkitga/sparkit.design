/* =========================================================
   Portfolio script.js (FULL)
   - Year in footer
   - Mobile nav toggle + close on link click
   - Active section nav highlighting (IntersectionObserver)
   - Apple-like Gallery slider (render + next/prev + keyboard)
   - OPTIONAL: Projects grid render + category filters (if present)
   - Contact form -> mailto draft
   ========================================================= */

/* ---------- Helpers ---------- */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/* ---------- Footer year ---------- */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Mobile nav ---------- */
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

function closeMobileNav() {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close menu when clicking any link
  $$(".nav-link", navMenu).forEach((a) => {
    a.addEventListener("click", () => closeMobileNav());
  });

  // Close if clicking outside nav (mobile behavior)
  document.addEventListener("click", (e) => {
    const clickedInside = navMenu.contains(e.target) || navToggle.contains(e.target);
    if (!clickedInside) closeMobileNav();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileNav();
  });
}

/* ---------- Active nav highlight on scroll ---------- */
(function setupActiveNav() {
  const navLinks = $$(".nav-link").filter(a => (a.getAttribute("href") || "").startsWith("#"));
  if (!navLinks.length) return;

  const sectionIds = navLinks
    .map(a => a.getAttribute("href"))
    .filter(Boolean)
    .map(href => href.replace("#", ""))
    .filter(id => id && document.getElementById(id));

  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    // Find the most “active” entry
    const visible = entries.filter(e => e.isIntersecting);
    if (!visible.length) return;

    // Pick the entry closest to top of viewport
    visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
    const id = visible[0].target.id;

    navLinks.forEach(a => {
      const on = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("active", on);
    });
  }, {
    root: null,
    threshold: 0.05,
    rootMargin: "-35% 0px -55% 0px"
  });

  sections.forEach(sec => observer.observe(sec));
})();

/* =========================================================
   GALLERY (Apple-like Work Slider)
   Requires:
   - <div id="galleryTrack"></div>
   - Optional buttons: #galleryPrev, #galleryNext
   ========================================================= */

/* Edit these items */
const GALLERY_ITEMS = [
  {
    title: "Brand Impact Hub (Portal)",
    desc: "A clean internal portal for assets, print requests, and quick links.",
    chips: ["Web", "Ops", "Brand"],
    href: "https://yourusername.github.io/brand-impact-hub/",
    mediaText: "PORTAL"
    // Optional thumbnail image:
    // image: "assets/portal.jpg"
  },
  {
    title: "Customer-First Video System",
    desc: "A repeatable short-form system that keeps messaging consistent.",
    chips: ["Video", "Ops"],
    href: "https://github.com/yourusername/video-system",
    mediaText: "VIDEO"
    // image: "assets/video.jpg"
  },
  {
    title: "Campaign Landing Page",
    desc: "Fast, clear landing page built for conversion and trust.",
    chips: ["Web", "Brand"],
    href: "https://yourusername.github.io/landing-page/",
    mediaText: "WEB"
    // image: "assets/web.jpg"
  },
  {
    title: "Print + Event Kit Templates",
    desc: "Templates that help teams execute without confusion or rework.",
    chips: ["Brand", "Ops"],
    href: "#contact",
    mediaText: "PRINT"
    // image: "assets/print.jpg"
  }
];

const galleryTrack = $("#galleryTrack");
const galleryPrev = $("#galleryPrev");
const galleryNext = $("#galleryNext");

function galleryCard(item) {
  const chips = (item.chips || []).map(c => `<span class="meta-chip">${c}</span>`).join("");
  const isExternal = /^https?:\/\//i.test(item.href);
  const targetAttrs = isExternal ? ` target="_blank" rel="noreferrer"` : "";

  // If you want images, uncomment image section in data and use this:
  // const media = item.image
  //  ? `<img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
  //  : `<span>${item.mediaText || "WORK"}</span>`;

  const media = `<span>${item.mediaText || "WORK"}</span>`;

  return `
    <a class="gallery-card" href="${item.href}"${targetAttrs}>
      <div class="gallery-media">${media}</div>
      <div class="gallery-body">
        <h3 class="gallery-title">${item.title}</h3>
        <p class="gallery-desc">${item.desc}</p>
        <div class="gallery-meta">${chips}</div>
      </div>
    </a>
  `;
}

function renderGallery() {
  if (!galleryTrack) return;
  galleryTrack.innerHTML = GALLERY_ITEMS.map(galleryCard).join("");
}

function getGalleryStepPx() {
  if (!galleryTrack) return 0;
  const card = galleryTrack.querySelector(".gallery-card");
  if (!card) return 0;
  const gap = 16; // match CSS gap
  return card.getBoundingClientRect().width + gap;
}

function scrollGallery(dir = 1) {
  if (!galleryTrack) return;
  const step = getGalleryStepPx();
  if (!step) return;
  galleryTrack.scrollBy({ left: step * dir, behavior: "smooth" });
}

if (galleryTrack) {
  renderGallery();

  if (galleryPrev) galleryPrev.addEventListener("click", () => scrollGallery(-1));
  if (galleryNext) galleryNext.addEventListener("click", () => scrollGallery(1));

  // Keyboard support: focus track and use arrows
  galleryTrack.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") scrollGallery(-1);
    if (e.key === "ArrowRight") scrollGallery(1);
  });

  // Optional: mouse wheel horizontal scrolling (nice “gallery” feel)
  galleryTrack.addEventListener("wheel", (e) => {
    // If user scrolls vertically, translate to horizontal
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      galleryTrack.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
}

/* =========================================================
   OPTIONAL: Projects Grid + Filters
   Only runs if #projectsGrid exists.
   Requires:
   - <div id="projectsGrid"></div>
   - optional buttons with class .chip and data-filter="..."
   ========================================================= */

const PROJECTS = [
  {
    title: "Brand Impact Hub (Portal)",
    description: "A lightweight portal for brand assets, requests, and quick links.",
    tags: ["web", "ops", "brand"],
    repo: "https://github.com/yourusername/brand-impact-hub",
    live: "https://yourusername.github.io/brand-impact-hub/",
    thumbText: "PORTAL"
  },
  {
    title: "Short-Form Video System",
    description: "Scripting + editing workflow to publish consistently.",
    tags: ["video", "ops"],
    repo: "https://github.com/yourusername/video-system",
    live: "",
    thumbText: "VIDEO"
  },
  {
    title: "Campaign Landing Page",
    description: "Responsive landing page with clear CTA and clean layout.",
    tags: ["web", "brand"],
    repo: "https://github.com/yourusername/landing-page",
    live: "https://yourusername.github.io/landing-page/",
    thumbText: "WEB"
  }
];

const projectsGrid = $("#projectsGrid");

function projectCard(p) {
  const tagChips = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
  const liveLink = p.live
    ? `<a class="btn" href="${p.live}" target="_blank" rel="noreferrer">Live</a>`
    : `<span class="btn ghost" aria-disabled="true" style="opacity:.55; pointer-events:none;">No Live</span>`;

  return `
    <article class="project" data-tags="${(p.tags || []).join(",")}">
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
  if (!projectsGrid) return;

  const items = PROJECTS.filter(p => filter === "all" ? true : (p.tags || []).includes(filter));
  projectsGrid.innerHTML = items.map(projectCard).join("");

  if (!items.length) {
    projectsGrid.innerHTML = `
      <div class="panel" style="grid-column:1/-1;">
        <strong>No projects in this category yet.</strong>
        <p class="muted" style="margin:8px 0 0;">Add a project in <code>script.js</code> and tag it to show here.</p>
      </div>
    `;
  }
}

// Filters (if present)
const chips = $$(".chip");
if (projectsGrid) {
  renderProjects("all");

  if (chips.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        renderProjects(chip.dataset.filter || "all");
      });
    });
  }
}

/* =========================================================
   Contact form -> mailto draft
   Requires:
   - form#contactForm
   - optional #formNote
   ========================================================= */

const contactForm = $("#contactForm");
const formNote = $("#formNote");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    // EDIT THIS:
    const to = "youremail@example.com";

    const subject = encodeURIComponent(`Portfolio Inquiry — ${name || "New message"}`);
    const body = encodeURIComponent(
`Name: ${name}
Email: ${email}

Message:
${message}
`
    );

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    if (formNote) formNote.textContent = "Opening your email client now…";
  });
}
