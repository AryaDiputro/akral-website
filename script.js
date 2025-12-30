// Smooth Scrolling untuk navigasi
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Navbar Sticky dan Change on Scroll
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 100) {
    navbar.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    navbar.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  }
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;

darkModeToggle.addEventListener("click", function () {
  body.classList.toggle("dark-mode");
  const icon = this.querySelector("i");
  if (body.classList.contains("dark-mode")) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
    localStorage.setItem("darkMode", "enabled");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
    localStorage.setItem("darkMode", "disabled");
  }
});

// Load Dark Mode preference from localStorage
if (localStorage.getItem("darkMode") === "enabled") {
  body.classList.add("dark-mode");
  const icon = darkModeToggle.querySelector("i");
  icon.classList.remove("fa-moon");
  icon.classList.add("fa-sun");
}

// Mobile Menu Toggle
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector(".nav-menu");

menuToggle.addEventListener("click", function () {
  navMenu.classList.toggle("active");
  const icon = this.querySelector("i");
  if (navMenu.classList.contains("active")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Animasi Scroll (Fade In)
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Terapkan animasi pada elemen yang ingin dianimasikan
document
  .querySelectorAll(
    ".guru-card, .siswa-card, .struktur-item, .galeri-item, .quote-item"
  )
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

// Counter Animation untuk statistik
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 20);
}

// Jalankan animasi counter saat section tentang terlihat
const tentangSection = document.getElementById("tentang");
const counterObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const stats = document.querySelectorAll(".stat h3");
        stats.forEach((stat) => {
          const target = parseInt(stat.textContent);
          if (!isNaN(target)) {
            animateCounter(stat, target);
          }
        });
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counterObserver.observe(tentangSection);

// Lazy Loading untuk gambar (placeholder)
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("load", function () {
    this.style.opacity = "1";
  });
  img.style.opacity = "0";
  img.style.transition = "opacity 0.3s ease";
});

// Form validation (jika ada form di masa depan)
function validateForm(form) {
  const inputs = form.querySelectorAll("input, textarea");
  let isValid = true;

  inputs.forEach((input) => {
    if (input.hasAttribute("required") && !input.value.trim()) {
      input.style.borderColor = "red";
      isValid = false;
    } else {
      input.style.borderColor = "#ddd";
    }
  });

  return isValid;
}

// Event listener untuk form submission (jika ada)
document.addEventListener("submit", function (e) {
  if (e.target.tagName === "FORM") {
    if (!validateForm(e.target)) {
      e.preventDefault();
      alert("Mohon lengkapi semua field yang diperlukan.");
    }
  }
});

// Keyboard Navigation untuk Accessibility
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    // Tutup mobile menu jika terbuka
    if (navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      const icon = menuToggle.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  }
});

// Performance: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Terapkan debounce pada scroll handler
window.addEventListener(
  "scroll",
  debounce(function () {
    // Scroll-based animations atau effects lainnya bisa ditambahkan di sini
  }, 10)
);

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Website Kelas XI AKMIL siap digunakan!");
});
