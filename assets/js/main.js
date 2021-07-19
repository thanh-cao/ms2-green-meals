// main.js file contains functions that can be used throughout all the pages

// light/dark theme toggle
const themeToggle = $('.theme-switch input[type="checkbox"]');
const themePreference = loadFromLocalStorage("theme");

themeToggle.on('change', toggleDarkMode);

if (themePreference === "dark") {
  $("body").addClass("dark-mode");
  themeToggle.prop('checked', true);
}

function toggleDarkMode(e) {
  if (e.target.checked) {
    $("body").addClass("dark-mode");
    saveToLocalStorage("theme", "dark");
  } else {
    $("body").removeClass("dark-mode");
    saveToLocalStorage("theme", "light");
  }
}

//functions to save and retrieve an item to local storage
function saveToLocalStorage(dataName, dataToSave) {
  //convert object into json string to save to local storage
  localStorage.setItem(dataName, JSON.stringify(dataToSave));
}

function loadFromLocalStorage(dataName) {
  //retrieve json string and parse it back to javascript object
  return JSON.parse(localStorage.getItem(dataName));
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// function to write nutrients' absolute value which can be used in recipe-randomizer.html and recipe-details.html
function writeNutrientsAbsolute(nutrient, amount) {
  $(`.${nutrient}`).each(function() {
      return $(this).text(amount);
  })
}