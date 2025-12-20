/* =========================================================
   script.js — FULL (single copy)
   - Footer year
   - Mobile nav toggle + close behaviors
   - Active nav highlighting on scroll
   - Gallery slider (render + prev/next + keyboard + wheel)
   - OPTIONAL Projects grid + filters (only if #projectsGrid exists)
   - Contact form -> mailto draft
   ========================================================= */

/* ---------- Helpers ---------- */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

/* ---------- Safe init on DOM ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();
  setupMobileNav();
  setupActiveNav();
  setupGallery();
  setupProjects();   // optional
  setupContactForm();
});

/* ---------- Footer year ---------- */
function setFooterYear() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

/* ---------- Mobile nav ---------- */
function setupMobileNav() {
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  if (!navToggle || !navMenu) return;

  const isMenuOpen = () => navMenu.classList.contains("open");

  function openMenu() {
    navMenu.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  // Toggle click
  navToggle.addEventListener("click", (e) => {
    e.preventDefault();
    isMenuOpen() ? closeMenu() : openMenu();
  });

  // Close when clicking any nav link
  $$(".nav-link", navMenu).forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const clickedInside = navMenu.contains(e.target) || navToggle.contains(e.target);
    if (!clickedInside) closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Close if resizing to desktop (prevents “stuck open”)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

/* ---------- Active nav highlight on scroll ---------- */
function setupActiveNav() {
  const navLinks = $$(".nav-link").filter((a) =>
    (a.getAttribute("href") || "").startsWith("#")
  );
  if (!navLinks.length) return;

  const sections = navLinks
    .map((a) => (a.getAttribute("href") || "").replace("#", ""))
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (!visible.length) return;

      // choose the one closest to top
      visible.sort(
        (a, b) =>
          Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
      );
      const activeId = visible[0].target.id;

      navLinks.forEach((a) => {
        const on = a.getAttribute("href") === `#${activeId}`;
        a.classList.toggle("active", on);
      });
    },
    {
      root: null,
      threshold: 0.08,
      rootMargin: "-35% 0px -55% 0px",
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* =========================================================
   GALLERY (Apple-like Work Slider)
   Requires:
   - <div id="galleryTrack"></div>
   - Optional buttons: #galleryPrev, #galleryNext
   ========================================================= */
function setupGallery() {
  const galleryTrack = $("#galleryTrack");
  if (!galleryTrack) return;

  const galleryPrev = $("#galleryPrev");
  const galleryNext = $("#galleryNext");

  // EDIT THESE ITEMS
  const GALLERY_ITEMS = [
    {
      title: "Brand Impact Hub (Portal)",
      desc: "A clean internal portal for assets, print requests, and quick links.",
      chips: ["Web", "Ops", "Brand"],
      href: "https://yourusername.github.io/brand-impact-hub/",
      mediaText: "PORTAL",
      // image: "assets/portal.jpg",
    },
    {
      title: "Customer-First Video System",
      desc: "A repeatable short-form system that keeps messaging consistent.",
      chips: ["Video", "Ops"],
      href: "https://github.com/yourusername/video-system",
      mediaText: "VIDEO",
      // image: "assets/video.jpg",
    },
    {
      title: "Campaign Landing Page",
      desc: "Fast, clear landing page built for conversion and trust.",
      chips: ["Web", "Brand"],
      href: "https://yourusername.github.io/landing-page/",
      mediaText: "WEB",
      // image: "assets/web.jpg",
    },
    {
      title: "Print + Event Kit Templates",
      desc: "Templates that help teams execute without confusion or rework.",
      chips: ["Brand", "Ops"],
      href: "#contact",
      mediaText: "PRINT",
      // image: "assets/print.jpg",
    },
  ];

  function galleryCard(item) {
    const chips = (item.chips || [])
      .map((c) => `<span class="meta-chip">${escapeHtml(c)}</span>`)
      .join("");

    const isExternal = /^https?:\/\//i.test(item.href);
    const targetAttrs = isExternal ? ` target="_blank" rel="noreferrer"` : "";

    const media = item.image
      ? `<img src="${item.image}" alt="${escapeHtml(
          item.title
        )}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
      : `<span>${escapeHtml(item.mediaText || "WORK")}</span>`;

    return `
      <a class="gallery-card" href="${item.href}"${targetAttrs}>
        <div class="gallery-media">${media}</div>
        <div class="gallery-body">
          <h3 class="gallery-title">${escapeHtml(item.title)}</h3>
          <p class="gallery-desc">${escapeHtml(item.desc)}</p>
          <div class="gallery-meta">${chips}</div>
        </div>
      </a>
    `;
  }

  function renderGallery() {
    galleryTrack.innerHTML = GALLERY_ITEMS.map(galleryCard).join("");
  }

  function getGalleryStepPx() {
    const card = galleryTrack.querySelector(".gallery-card");
    if (!card) return 0;

    // Use computed gap so it stays in sync with CSS
    const styles = window.getComputedStyle(galleryTrack);
    const gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;

    return card.getBoundingClientRect().width + gap;
  }

  function scrollGallery(dir = 1) {
    const step = getGalleryStepPx();
    if (!step) return;
    galleryTrack.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  // Render once
  renderGallery();

  // Buttons
  if (galleryPrev) galleryPrev.addEventListener("click", () => scrollGallery(-1));
  if (galleryNext) galleryNext.addEventListener("click", () => scrollGallery(1));

  // Keyboard support (focus track then use arrows)
  galleryTrack.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") scrollGallery(-1);
    if (e.key === "ArrowRight") scrollGallery(1);
  });

  // Smooth wheel-to-horizontal (optional, feels great)
  galleryTrack.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        galleryTrack.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

/* =========================================================
   OPTIONAL: Projects Grid + Filters
   Only runs if #projectsGrid exists.
   Requires:
   - <div id="projectsGrid"></div>
   - optional buttons with class .chip and data-filter="..."
   ========================================================= */
function setupProjects() {
  const projectsGrid = $("#projectsGrid");
  if (!projectsGrid) return;

  // EDIT THESE
  const PROJECTS = [
    {
      title: "Brand Impact Hub (Portal)",
      description: "A lightweight portal for brand assets, requests, and quick links.",
      tags: ["web", "ops", "brand"],
      repo: "https://github.com/yourusername/brand-impact-hub",
      live: "https://yourusername.github.io/brand-impact-hub/",
      thumbText: "PORTAL",
    },
    {
      title: "Short-Form Video System",
      description: "Scripting + editing workflow to publish consistently.",
      tags: ["video", "ops"],
      repo: "https://github.com/yourusername/video-system",
      live: "",
      thumbText: "VIDEO",
    },
    {
      title: "Campaign Landing Page",
      description: "Responsive landing page with clear CTA and clean layout.",
      tags: ["web", "brand"],
      repo: "https://github.com/yourusername/landing-page",
      live: "https://yourusername.github.io/landing-page/",
      thumbText: "WEB",
    },
  ];

  function projectCard(p) {
    const tagChips = (p.tags || [])
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");

    const liveLink = p.live
      ? `<a class="btn" href="${p.live}" target="_blank" rel="noreferrer">Live</a>`
      : `<span class="btn ghost" aria-disabled="true" style="opacity:.55; pointer-events:none;">No Live</span>`;

    return `
      <article class="project" data-tags="${(p.tags || []).join(",")}">
        <div class="thumb">${escapeHtml(p.thumbText || "PROJECT")}</div>
        <div class="content">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
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
    const items = PROJECTS.filter((p) =>
      filter === "all" ? true : (p.tags || []).includes(filter)
    );

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

  // Initial render
  renderProjects("all");

  // Filters (if present)
  const chips = $$(".chip");
  if (chips.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
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
function setupContactForm() {
  const contactForm = $("#contactForm");
  if (!contactForm) return;

  const formNote = $("#formNote");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    // EDIT THIS
    const to = "youremail@example.com";

    const subject = encodeURIComponent(
      `Portfolio Inquiry — ${name || "New message"}`
    );

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

/* ---------- Small safety helpers ---------- */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
