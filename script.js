const loader = document.getElementById("loader");

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("hide");
  }, 2200);
});

document.documentElement.classList.add("js");

const navCard = document.querySelector(".nav-card");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

menuToggle?.addEventListener("click", () => {
  const isOpen = navCard.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navCard.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".nav-dropdown-toggle").forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    if (window.matchMedia("(max-width: 980px)").matches) {
      event.preventDefault();
      toggle.closest(".nav-dropdown").classList.toggle("is-open");
    }
  });
});

window.addEventListener("scroll", () => {
  document.querySelector("[data-header]")?.classList.toggle("is-scrolled", window.scrollY > 20);
});

const runAnimations = () => {
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
      },
    });
  });

  const timeline = document.querySelector("[data-timeline]");
  const progress = document.querySelector("[data-progress]");
  if (timeline && progress) {
    gsap.to(progress, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: timeline,
        start: "top 80%",
        end: "bottom 35%",
        scrub: true,
      },
    });
  }
};

const animateCounters = () => {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count || 0);
        const suffix = target === 98 ? "%" : "+";
        let current = 0;
        const step = Math.max(1, Math.round(target / 44));
        const timer = window.setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = `${target}${suffix}`;
            window.clearInterval(timer);
          } else {
            el.textContent = `${current}${suffix}`;
          }
        }, 24);
        observer.unobserve(el);
      });
    },
    { threshold: 0.35 },
  );
  counters.forEach((counter) => observer.observe(counter));
};

const setupFilters = () => {
  const buttons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.style.opacity = show ? "1" : "0.25";
        card.style.transform = show ? "" : "scale(0.96)";
      });
    });
  });
};

const setupRcmWheel = () => {
  const wheel = document.querySelector(".rcm-wheel");
  if (!wheel) return;
  const items = [...wheel.querySelectorAll(".wheel-item")];
  const card = wheel.querySelector(".rcm-info-card");
  const title = wheel.querySelector("[data-rcm-info-title]");
  const text = wheel.querySelector("[data-rcm-info-text]");
  const link = wheel.querySelector("[data-rcm-info-link]");
  if (!items.length || !card || !title || !text) return;

  const moveCardToItem = (item) => {
  const wheelRect = wheel.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const itemCenter = itemRect.left - wheelRect.left + itemRect.width / 2;
  const itemTop = itemRect.top - wheelRect.top;
  const itemBottom = itemRect.bottom - wheelRect.top;
  const wheelCenter = wheelRect.height / 2;
  const minX = Math.min(150, wheelRect.width / 2);
  const maxX = wheelRect.width - minX;
  const x = Math.min(Math.max(itemCenter, minX), maxX);

  let y;
  if (itemTop > wheelCenter) {
    card.classList.add("is-above");
    y = itemTop;
  } else {
    card.classList.remove("is-above");
    y = itemBottom + 10;
  }

  card.style.setProperty("--tooltip-x", `${x}px`);
  card.style.setProperty("--tooltip-y", `${y}px`);
};	

  const setActive = (item) => {
    items.forEach((node) => node.classList.toggle("is-active", node === item));
    title.textContent = item.dataset.rcmTitle || item.textContent.trim();
    text.textContent = item.dataset.rcmText || "";
    if (link) {
      const href = item.dataset.rcmLink;
      link.hidden = !href;
      if (href) {
        link.href = href;
        link.textContent = `Know More`;
      }
    }
    moveCardToItem(item);
    card.classList.add("is-live");
  };

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => setActive(item));
    item.addEventListener("focus", () => setActive(item));
  });

  wheel.addEventListener("mouseleave", () => {
    items.forEach((node) => node.classList.remove("is-active"));
    card.classList.remove("is-live");
  });

  window.addEventListener("resize", () => {
    const active = wheel.querySelector(".wheel-item.is-active");
    if (active) moveCardToItem(active);
  });

  setActive(items[0]);
};

const setupMagneticButtons = () => {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.14}px)`;
    });
    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });
  });
};

const setupCanvas = () => {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const particles = [];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.length = 0;
    const count = Math.max(32, Math.floor(rect.width / 18));
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 2.4 + 0.6,
        vx: Math.random() * 0.35 - 0.18,
        vy: Math.random() * 0.25 - 0.12,
        hue: Math.random() > 0.74 ? "#1D9E75" : "#378ADD",
      });
    }
  };

  const draw = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.hue;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = "#185FA5";
          ctx.globalAlpha = (110 - distance) / 520;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
};

const setupForm = () => {
  document.querySelectorAll(".contact-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const currentForm = event.currentTarget;
      const button = currentForm.querySelector("button");
      const original = button.textContent;
      const isCareer = currentForm.classList.contains("career-form");
      const receivedText = isCareer ? "Application Received" : "Request Received";
      const errorText = "Couldn't send. Try again.";

      button.disabled = true;
      button.textContent = "Sending...";

      try {
        const response = await fetch(currentForm.action, {
          method: "POST",
          body: new FormData(currentForm),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Form submission failed");

        currentForm.classList.add("is-sent");
        button.textContent = receivedText;
        window.setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
          currentForm.classList.remove("is-sent");
          currentForm.reset();
        }, 1800);
      } catch (error) {
        button.textContent = errorText;
        window.setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
        }, 2200);
      }
    });
  });
};

window.addEventListener("DOMContentLoaded", () => {
  window.lucide?.createIcons();
  setupCanvas();
  setupRcmWheel();
  setupFilters();
  setupMagneticButtons();
  setupForm();
  animateCounters();
  window.setTimeout(runAnimations, 180);
});
