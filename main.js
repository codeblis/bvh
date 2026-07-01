// Ticker update
const tickerData = [
  { sym: "AZCUBA", base: 142.5, chg: 2.3 },
  { sym: "ETECSA", base: 89.2, chg: 0.8 },
  { sym: "CIMEX", base: 67.8, chg: -1.2 },
  { sym: "GAESA", base: 215.0, chg: 3.1 },
  { sym: "BFI", base: 45.6, chg: -0.5 },
  { sym: "CUBACAB", base: 33.4, chg: 1.7 },
  { sym: "ISLAZUL", base: 58.9, chg: 0.4 },
  { sym: "CUBANA", base: 121.3, chg: -2.8 },
  { sym: "TRD", base: 76.5, chg: 1.1 },
  { sym: "CUPET", base: 188.7, chg: -0.9 },
];

function updateTicker() {
  const items = document.querySelectorAll(".ticker-item");
  items.forEach((item, i) => {
    const d = tickerData[i % tickerData.length];
    const noise = (Math.random() - 0.5) * 0.4;
    const newChg = +(d.chg + noise).toFixed(2);
    const newPrice = +(d.base * (1 + newChg / 100)).toFixed(2);
    const isUp = newChg >= 0;
    const priceEl = item.querySelector(".ticker-price");
    const chgEl = item.querySelector(".ticker-change");
    if (priceEl) priceEl.textContent = newPrice.toFixed(2);
    if (chgEl) {
      chgEl.textContent = (isUp ? "▲ +" : "▼ ") + newChg.toFixed(2) + "%";
      chgEl.className = "ticker-change " + (isUp ? "up" : "down");
    }
  });
}
setInterval(updateTicker, 3000);

// Mobile menu toggle
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".mobile-toggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      links.classList.toggle("open");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("nav")) {
        links.classList.remove("open");
      }
    });
  }

  // Smooth scroll para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top =
          target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  // Tema claro/oscuro
  const themeBtn = document.getElementById("themeToggle");
  const body = document.body;

  // Recuperar preferencia guardada
  const savedTheme = localStorage.getItem("bvh-theme");
  logo = document.getElementById("nav-logo");
  logotipo = document.getElementById("footer-logotipo");
  if (savedTheme === "light") {
    body.classList.add("light-theme");
    logo.setAttribute("src", "/assets/svg/logo.svg");
    logotipo.setAttribute("src", "/assets/svg/logotipo.svg");
  } else {
    body.classList.add("dark-theme");
    logo.setAttribute("src", "/assets/svg/logo-dark.svg");
    logotipo.setAttribute("src", "/assets/svg/logotipo-dark.svg");
  }

  themeBtn.addEventListener("click", function () {
    body.classList.toggle("light-theme");
    const isLight = body.classList.contains("light-theme");
    localStorage.setItem("bvh-theme", isLight ? "light" : "dark");
    logo = document.getElementById("nav-logo");
    logotipo = document.getElementById("footer-logotipo");
    if (isLight) {
      logo.setAttribute("src", "/assets/svg/logo.svg");
      logotipo.setAttribute("src", "/assets/svg/logotipo.svg");
    } else {
      logo.setAttribute("src", "/assets/svg/logo-dark.svg");
      logotipo.setAttribute("src", "/assets/svg/logotipo-dark.svg");
    }
  });
});
