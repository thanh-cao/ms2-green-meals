// declaration of global variables
const userMealPreference = $("#meal-preference");
const mealPlanDisplay = $("#meal-plan-container");

const dietPreferenceList = $('input[name="diet-preference"]');
const intoleranceList = $('input[name="intolerances"]');
let diet = 'vegetarian'; // make vegetarian as a default diet preference to give a visual hint to users that they can click and choose
let intolerances = [];

const totalNutrientsDisplay = $("#total-nutrients-absolute");
const totalNutrientsChart = $("#total-nutrients-chart");

const apiKey = "1f698cd1ba074580acc428ca007720bc";
const apiKey2 = "09c17d8e03d043c49e345a14a780221e"; // backup apiKey for use when daily quota is exceeded

let mealListId = [];

// event listeners
// gather search query and then fetch data through API call
dietPreferenceList.on("change", getUserDiet);
intoleranceList.on("change", getUserIntolerances);
userMealPreference.on("submit", e => {
  e.preventDefault();
  handleUserMealPreferences();
});

function handleUserMealPreferences() {
  $("#meal-plan").removeClass("d-none");
  mealPlanDisplay.empty();
  // totalNutrientsDisplay.empty();
  totalNutrientsChart.empty();
  fetchMealPlan();
}
// reset button to clear all data
$('button[type="reset"]').on("click", function () {
  diet = "";
  intolerances.splice(0);
  mealListId.splice(0);
  $("#meal-plan").addClass("d-none");
});

// functions to gather user's search query based on diet preference and intolerances and parse queries to API call
function getUserDiet(e) {
  if (this.checked) {
    diet = this.labels[0].innerText;
    console.log(diet);
  } else {
    console.log(diet);
  }
  return diet;
}

function getUserIntolerances(e) {
  if (this.checked) {
    intolerances.push(this.labels[0].innerText);
    console.log(intolerances);
  } else {
    intolerances.splice(intolerances.indexOf(this.labels[0].innerText), 1);
    console.log(intolerances);
  }
  return intolerances;
}

// The results from ajax do not have data on the meals' image urls. After api call is finished, the function will extract IDs of all the meals into an array and then the meal ID array is parsed into another api call in order to get all the neccessary data to then finally write to document
function fetchMealPlan() {
  $.when(
    $.ajax({
      url: `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&diet=${diet.toLowerCase()}&exclude=${intolerances.toString()},drinks,beverages,alcohol`,
      method: "GET"
    })
  )
    .then(function (results) {
      console.log(results);
      console.log(results.meals);
      console.log(results.nutrients);
      let mealList = results.meals;
      extractMealListId(mealList);
      drawTotalCaloricBreakdownChart(results.nutrients);
      writeNutrientsAbsolute('calories', results.nutrients.calories);
      writeNutrientsAbsolute('protein', results.nutrients.protein);
      writeNutrientsAbsolute('fat', results.nutrients.fat);
      writeNutrientsAbsolute('carbs', results.nutrients.carbohydrates);
    })
    .done(function () {
      console.log(mealListId);
      writeMealPlan(mealListId);
    });
}

function extractMealListId(mealList) {
  //empty previous mealListId array and then assign a new one for new meal plan
  mealListId = [];
  $.each(mealList, function (index, value) {
    console.log(value);
    console.log(value.id);
    mealListId.push(value.id);
    console.log(mealListId);
  });
  return mealListId;
}

// below functions to display search results on to page in order breakfast, lunch, dinner
function writeMealPlan(mealListId) {
  //use Promise.all() to get all the json data ready before looping the data to write meal cards in correct order (breakfast, lunch, dinner) based on data's index
  let breakfastResponse = fetch(
    `https://api.spoonacular.com/recipes/${mealListId[0]}/information?apiKey=${apiKey}&includeNutrition=true`
  ),
    lunchResponse = fetch(
      `https://api.spoonacular.com/recipes/${mealListId[1]}/information?apiKey=${apiKey}&includeNutrition=true`
    ),
    dinnerResponse = fetch(
      `https://api.spoonacular.com/recipes/${mealListId[2]}/information?apiKey=${apiKey}&includeNutrition=true`
    );

  Promise.all([breakfastResponse, lunchResponse, dinnerResponse])
    .then(responses => {
      return Promise.all(
        responses.map(response => {
          return response.json();
        })
      );
    })
    .then(dataArray => {
      console.log(dataArray);
      saveToLocalStorage('mealPlanData', dataArray);
      dataArray.forEach(data => {
        console.log(data.id);
        let mealCardHtml = "";
        mealCardHtml = `
      <div class="card mb-3">
          <div class="row row-cols-2 pt-3 pb-2">
              <h3 class="col my-auto ps-4 meal-type-title">${writeMealCardTitle(dataArray.indexOf(data))}</h3>
              <div class="col text-end pe-4">
                  <button class="btn btn-secondary find-new-meal-btn"><i class="fas fa-random"></i></button>
              </div>
          </div>
          <a class="row g-0 meal-card-data" href="recipe-details.html" id="${data.id}">
              <div class="col-md-4 my-auto">
                  <img src="${data.image}" class="w-100 h-auto px-3" alt="${data.title}">
              </div>
              <div class="col-md-8">
                  <div class="card-body">
                      <h4 class="card-title">${data.title}</h4>
                      <p class="card-text">
                          <small class="text-muted">Ready in: ${data.readyInMinutes} minutes</small>
                          <small class="text-muted float-end">Servings: ${data.servings}</small>
                      </p>
                      <div class="row row-cols-2">
                          <div class="col text-center">
                              <span class="border py-2 px-3 d-block mb-2">Calories: ${data.nutrition.nutrients[0].amount}</span>
                              <span class="border py-2 px-3 d-block">Fat: ${data.nutrition.nutrients[1].amount}g</span>
                          </div>
                          <div class="col text-center">
                              <span class="border py-2 px-3 d-block mb-2">Protein: ${data.nutrition.nutrients[8].amount}</span>
                              <span class="border py-2 px-3 d-block">Carbs: ${data.nutrition.nutrients[3].amount}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </a>
      </div>
      `;
        mealPlanDisplay.append(mealCardHtml);
      });
      viewRecipeDetails();
    })
    .catch(err => {
      console.log(err);
    });
}

function writeMealCardTitle(index) {
  if (index === 0) {
    return "Breakfast";
  } else if (index === 1) {
    return "Lunch";
  } else if (index === 2) {
    return "Dinner";
  }
}

function drawTotalCaloricBreakdownChart(nutrients) {
  let ctx = $('#total-nutrients-chart');
  let carbsCalories = nutrients.carbohydrates * 4 / nutrients.calories * 100;
  let proteinCalories = nutrients.protein * 4 / nutrients.calories * 100;
  let fatCalories = nutrients.fat * 9 / nutrients.calories * 100;

  let totalCaloricChart = new Chart(ctx, {
    type: 'pie',
    data: {
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
    },
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
  })
}

// function to add 'click' event listener for meal card to store meal ID being clicked in order to load the correct data at recipe-details page
function viewRecipeDetails() {
  $('.meal-card-data').each(function() {
    $(this).click(function() {
      console.log('card is clicked');
      console.log(this.id);
      saveToLocalStorage('recipeIdToDisplay', this.id);
    })
  })
}