// light/dark theme toggle
const themeToggle = $('.theme-switch input[type="checkbox"]');
const themePreference = localStorage.getItem("theme");

if (themePreference === "dark") {
  $("body").addClass("dark-mode");
  themeToggle.prop('checked', true);
}

function toggleDarkMode(e) {
  if (e.target.checked) {
    $("body").addClass("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    $("body").removeClass("dark-mode");
    localStorage.setItem("theme", "light");
  }
}

themeToggle.on('change', toggleDarkMode);