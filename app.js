/* ============================================================
   AMIT KUMAR JANGID — PORTFOLIO interactions
   Pure vanilla JavaScript. Restrained, business-friendly motion.
   ============================================================ */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* footer year */
  const yearEl = document.querySelector(".f-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- theme toggle ---------------- */
  const themeBtn = document.getElementById("themeToggle");
  const setTheme = (theme, persist) => {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeBtn) {
      const next = theme === "dark" ? "light" : "dark";
      themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
      themeBtn.title = "Switch to " + next + " theme";
    }
    if (persist !== false) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* noop */ }
    }
  };
  if (themeBtn) {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------------- mobile menu ---------------- */
  const toggle = document.getElementById("menuToggle");
  const closeBtn = document.getElementById("menuClose");
  const menu = document.getElementById("mobileMenu");

  const openMenu = () => {
    if (!menu) return;
    menu.classList.add("open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  const closeMenu = () => {
    if (!menu || !menu.classList.contains("open")) return;
    menu.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  if (toggle) toggle.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------------- gentle scroll reveal ---------------- */
  const revealEls = document.querySelectorAll(".rv");
  if (revealEls.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in-view"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------------- scrollspy (active nav link) ---------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  let spyTicking = false;
  const updateSpy = () => {
    spyTicking = true;
    const pos = window.scrollY + 120;
    let currentId = sections[0] ? sections[0].id : "";
    for (const sec of sections) {
      if (sec.offsetTop <= pos) currentId = sec.id;
    }
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
    spyTicking = false;
  };
  const scheduleSpy = () => {
    if (spyTicking) return;
    requestAnimationFrame(updateSpy);
  };
  window.addEventListener("scroll", scheduleSpy, { passive: true });
  window.addEventListener("resize", scheduleSpy);
  setTimeout(updateSpy, 200);

  /* ---------------- copy to clipboard ---------------- */
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  let toastTimer = null;
  const showToast = (msg) => {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
  };
  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (err) { /* noop */ }
    document.body.removeChild(ta);
  };

  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.dataset.copy || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => showToast("Copied to clipboard"))
          .catch(() => { fallbackCopy(text); showToast("Copied to clipboard"); });
      } else {
        fallbackCopy(text);
        showToast("Copied to clipboard");
      }
    });
  });

  /* ---------------- contact form → mailto ---------------- */
  const form = document.getElementById("contactForm");
  const setError = (input, on) => {
    input.style.borderColor = on ? "#dc2626" : "";
    input.style.boxShadow = on ? "0 0 0 3px rgba(220,38,38,0.1)" : "";
  };
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#cName");
      const email = form.querySelector("#cEmail");
      const subject = form.querySelector("#cSubject");
      const message = form.querySelector("#cMsg");
      let ok = true;
      const check = (inp, test) => {
        const good = test(inp.value.trim());
        setError(inp, !good);
        if (!good) ok = false;
        return good;
      };
      check(name, (v) => v.length >= 2);
      check(email, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      check(subject, (v) => v.length >= 3);
      check(message, (v) => v.length >= 10);
      if (!ok) {
        showToast("Please complete the highlighted fields");
        return;
      }
      const mailSubject = encodeURIComponent(subject.value.trim() || "Portfolio enquiry");
      const mailBody = encodeURIComponent(
        "Name: " + name.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n\n" +
        message.value.trim()
      );
      window.location.href = "mailto:mitjangir@gmail.com?subject=" + mailSubject + "&body=" + mailBody;
      showToast("Opening your mail app…");
    });
    form.querySelectorAll("input, textarea").forEach((inp) => {
      inp.addEventListener("input", () => setError(inp, false));
    });
  }
})();
