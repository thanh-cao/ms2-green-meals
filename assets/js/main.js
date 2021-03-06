// main.js file contains functions that can be used throughout all the pages
function toggleDarkMode(e) {
  if (e.target.checked) {
    $('body').addClass('dark-mode');
    saveToLocalStorage('theme', 'dark');
  } else {
    $('body').removeClass('dark-mode');
    saveToLocalStorage('theme', 'light');
  }
}

function setThemePreference() {
  // light/dark theme toggle
  const themeToggle = $('.theme-switch input[type="checkbox"]');
  const themePreference = loadFromLocalStorage('theme');

  themeToggle.on('change', toggleDarkMode);

  if (themePreference === 'dark') {
    $('body').addClass('dark-mode');
    themeToggle.prop('checked', true);
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

// clear all data in localStorage on reset button click
function resetLocalStorage() {
  // delete saved items in local storage
  const localStorageKeys = ['userDiet', 'userIntolerances', 'mealPlanData', 'mealPlanDisplay', 'totalNutrientBreakdown', 'newMeal', 'loadMealPlan', 'groceryList', 'recipeIdToDisplay'];
  localStorageKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  if ($('#resumePrevSessionModal')) {
    $('#resumePrevSessionModal').modal('hide');
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// functions to find the needed nutrient from a list and then write that nutrient's absolute value which can be used in recipe-randomizer.html and recipe-details.html
function findNutrientAbsoluteData(nutrient, nutrientList, dataType) {
  if (dataType === 'mealPlanData') {
    return nutrientList[nutrient];
  } else if (dataType === 'mealData') {
    let found = nutrientList.find(element => element.name === capitalizeFirstLetter(nutrient));
    return found.amount;
  }
}

function writeNutrientsAbsoluteData(nutrients, nutrientList, dataType) {
  nutrients.forEach(nutrient => {
    let amount = findNutrientAbsoluteData(nutrient, nutrientList, dataType);
    $(`.${nutrient}`).each(function() {
      $(this).text(''); // clear previous data
      return $(this).text(amount); // write new data
    });
  });
}

// get background colors for the 3 nutrients accordingly to the theme chosen from css variables
function getNutrientBackgroundColors() {
  let carbsColor = getComputedStyle(document.body).getPropertyValue('--carbs-color');
  let fatColor = getComputedStyle(document.body).getPropertyValue('--fat-color');
  let proteinColor = getComputedStyle(document.body).getPropertyValue('--protein-color');
  return [carbsColor, fatColor, proteinColor];
}

function updatePieChartColors() {
  caloricChart.data.datasets[0].backgroundColor = getNutrientBackgroundColors();
  caloricChart.update();
}

// functions to compile neccesary configurations and then draw pie chart using chart.js to show caloric percentage breakdown of nutrients
function compilePieChartConfigs(nutrients, dataType) {
  let carbsCalories, proteinCalories, fatCalories;

  // formula to calculate caloric percentage from fat, protein, carbs is based on Jim Painter's explanation https://www.scientificamerican.com/article/how-do-food-manufacturers/
  if (dataType === 'mealPlanData') {
    carbsCalories = nutrients.carbohydrates * 4 / nutrients.calories * 100;
    proteinCalories = nutrients.protein * 4 / nutrients.calories * 100;
    fatCalories = nutrients.fat * 9 / nutrients.calories * 100;
  } else if (dataType === 'mealData') {
    carbsCalories = nutrients.percentCarbs;
    proteinCalories = nutrients.percentProtein;
    fatCalories = nutrients.percentFat;
  }

  const chartData = {
    labels: ['Carbs', 'Fat', 'Protein'],
    datasets: [{
      label: 'Caloric Breakdown',
      data: [Math.round(Number(carbsCalories)), Math.round(Number(fatCalories)), Math.round(Number(proteinCalories))],
      backgroundColor: getNutrientBackgroundColors(),
      borderColor: [
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)'
      ],
      borderWidth: 1,
      hoverOffset: 3
    }]
  };

  const chartConfigs = {
    type: 'pie',
    data: chartData,
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
  return chartConfigs;
}

function drawCaloricBreakdownChart(nutrients, dataType) {
  let caloricChart;
  let chartConfigs = compilePieChartConfigs(nutrients, dataType);

  // draw pie chart
  $('.chart-container').html('<canvas class="nutrients-chart mx-auto" width="200" height="200"></canvas>');
  let ctx = $('.nutrients-chart');
  ctx.each(function() {
    caloricChart = new Chart($(this), chartConfigs);
  });

  // update background color of chart's data based on theme toggle
  $('.theme-switch input[type="checkbox"]').on('change', updatePieChartColors);
}

// functions to trigger modal when a user returns and already have a meal plan generated from previous visit. User can then choose to resume previous session or reset to start from beginning
function resumePreviousSession() {
  if (window.location.toString().includes('index.html') || !loadFromLocalStorage('groceryList')) {
    window.location = 'recipe-randomizer.html#meal-plan-container';
  } else {
    $('#resumePrevSessionModal').modal('hide');
  }
}

function showReturningUserModal() {
  if (loadFromLocalStorage('loadMealPlan') === 'true' && !sessionStorage.getItem('modalShown')) {
    $('div.returning-user-modal').html(
      `<div class="modal fade" id="resumePrevSessionModal" tabindex="-1" aria-labelledby="resumePrevSession" aria-hidden="true" data-backdrop="false">
        <div class="modal-dialog">
          <div class="modal-content card">
            <div class="modal-header">
              <h5 class="modal-title" id="resumePrevSessionModalLabel">Resume previous session?</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              You already have a meal plan generated from previous visit. Would you like to resume where you left off or reset to beginning?
            </div>
            <div class="modal-footer justify-content-center">
            <button class="btn btn-primary" onclick="resumePreviousSession()">Resume</button>
            <button class="btn btn-reset" onclick="resetLocalStorage()">Reset</button>
            </div>
          </div>
        </div>
      </div>`
    );
  }
  $('#resumePrevSessionModal').modal('show');
  sessionStorage.setItem('modalShown', 'true');
}

$(document).ready(function() {
  setThemePreference();
  showReturningUserModal();
});