// ==========================================================================
// BridGenta.de Portfolio — script.js
// ==========================================================================

(function () {
  "use strict";

  // ---------- Mobile navigation ----------
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");

  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll(".nav__links a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Footer year ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navigation active anchor highlighting (Scroll Spy) ----------
  const skillsSection = document.getElementById("faehigkeiten");
  const navFaehigkeiten = document.getElementById("nav-link-faehigkeiten");
  const navStartseite = document.querySelector('.nav__links a[href="/"]');

  if (skillsSection && navFaehigkeiten && window.location.pathname === "/") {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navFaehigkeiten.setAttribute("aria-current", "page");
            if (navStartseite) navStartseite.removeAttribute("aria-current");
          } else {
            navFaehigkeiten.removeAttribute("aria-current");
            if (window.location.hash !== "#faehigkeiten" && navStartseite) {
              navStartseite.setAttribute("aria-current", "page");
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px"
      }
    );
    observer.observe(skillsSection);
  }

  // ---------- Back-to-top button ----------
  let backToTopBtn = document.querySelector(".back-to-top");
  if (!backToTopBtn) {
    backToTopBtn = document.createElement("button");
    backToTopBtn.className = "back-to-top";
    backToTopBtn.setAttribute("aria-label", "Nach oben scrollen");
    backToTopBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
    document.body.appendChild(backToTopBtn);
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("is-visible");
    } else {
      backToTopBtn.classList.remove("is-visible");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // ---------- Service worker registration ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.registration ||
        navigator.serviceWorker
          .register("/service-worker.js")
          .catch(() => {
            /* PWA registration failed silently — site still works */
          });
    });
  }
})();
