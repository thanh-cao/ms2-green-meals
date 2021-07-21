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

// functions to write nutrients' absolute value and draw caloric breakdown pie chart which can be used in recipe-randomizer.html and recipe-details.html
function writeNutrientsAbsolute(nutrient, nutrientList, dataType) {
  let amount = findNutrientAbsoluteData(nutrient, nutrientList, dataType);
  $(`.${nutrient}`).each(function() {
      $(this).text(''); // clear previous data
      return $(this).text(amount); // write new data
  })
}

function findNutrientAbsoluteData(nutrient, nutrientList, dataType) {
  if (dataType === 'mealPlanData') {
    console.log(`${nutrient} is ${nutrientList[nutrient]}`);
    return nutrientList[nutrient];
  } else if (dataType === 'mealData') {
    let found = nutrientList.find(element => element.name === capitalizeFirstLetter(nutrient));
    console.log(`${nutrient} is ${found.amount}`);
    return found.amount;
  }
}

function drawCaloricBreakdownChart(nutrients, dataType) {
  let caloricChart, carbsCalories, proteinCalories, fatCalories;

  if (dataType === 'mealPlanData') {
    carbsCalories = nutrients.carbohydrates * 4 / nutrients.calories * 100;
    proteinCalories = nutrients.protein * 4 / nutrients.calories * 100;
    fatCalories = nutrients.fat * 9 / nutrients.calories * 100;
  } else if (dataType === 'mealData') {
    carbsCalories = nutrients.percentCarbs;
    proteinCalories = nutrients.percentProtein;
    fatCalories = nutrients.percentFat;
  }

  const data = {
    labels: ['Carbs', 'Fat', 'Protein'],
    datasets: [{
      label: 'Caloric Breakdown',
      data: [Math.round(Number(carbsCalories)), Math.round(Number(fatCalories)), Math.round(Number(proteinCalories))],
      backgroundColor: [
        'rgb(138, 6, 6)',
        'rgb(243, 212, 65)',
        'rgb(9, 31, 146)'
      ],
      borderColor: [
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)'
      ],
      borderWidth: 1,
      hoverOffset: 3
    }]
  };

  const config = {
    type: 'pie',
    data: data,
    plugins: [ChartDataLabels],
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Caloric percentage breakdown',
          color: 'rgb(255, 255, 255)'
        },
        datalabels: {
          color: 'rgb(255, 255, 255)',
        }
      },
    }
  };

  $('.chart-container').html('<canvas class="nutrients-chart" width="200" height="200"></canvas>');
  let ctx = $('.nutrients-chart');
  ctx.each(function() {
    caloricChart = new Chart($(this), config);
  })
}