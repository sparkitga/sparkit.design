(() => {
  const closeMenu = (button, nav) => {
    button.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };

  document.querySelectorAll(".nav-toggle").forEach((button) => {
    const nav = button.parentElement.querySelector(".main-nav");
    if (!nav) return;

    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu(button, nav));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu(button, nav);
    });
  });
})();
