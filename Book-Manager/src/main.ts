import { initUI } from "./ui";

document.addEventListener("DOMContentLoaded", () => {
  initUI();

  // DARK MODE
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
  }

  // THEME COLOR SELECTOR
  const themeSelect = document.getElementById("theme-select") as HTMLSelectElement | null;
  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      const color = themeSelect.value;
      // Cập nhật biến CSS --main-color
      document.documentElement.style.setProperty("--main-color", color);
      // Nếu muốn cập nhật luôn nút dark mode
      const themeBtn = document.getElementById("theme-toggle");
      if (themeBtn) themeBtn.style.backgroundColor = color;
    });
  }
});
