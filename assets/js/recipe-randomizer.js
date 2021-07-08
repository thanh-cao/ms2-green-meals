// declaration of global variables
const userMealPreference = $("#meal-preference");
const mealPlanDisplay = $("#meal-plan-container");

const dietPreferenceList = $('input[name="diet-preference"]');
const intoleranceList = $('input[name="intolerances"]');
let diet = [];
let intolerances = [];

const totalNutrientsDisplay = $("#total-nutrients-absolute");
const totalNutrientsChart = $("#total-nutrients-chart");

// const myapiKey = "1f698cd1ba074580acc428ca007720bc";
const apiKey = "09c17d8e03d043c49e345a14a780221e";

let mealListId = [];

// gather search query and then fetch data through API call
dietPreferenceList.on("change", getUserDiet);
intoleranceList.on("change", getUserIntolerances);
userMealPreference.on("submit", e => {
  e.preventDefault();
  randomizeMealPlan();
});

function randomizeMealPlan() {
  $('#meal-plan').removeClass('d-none');
  mealPlanDisplay.empty();
  totalNutrientsDisplay.empty();
  totalNutrientsChart.empty();
  fetchMealPlan();
}
// reset button to clear all data
$('button[type="reset"]').on('click', function() {
  diet = '';
  intolerances.splice(0);
  mealListId.splice(0);
  mealPlanDisplay.empty();
})

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

function fetchMealPlan() {
  $.when(
    $.ajax({
    url: `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&diet=${diet.toLowerCase()}&exclude=${intolerances.toString()}&type=main%20course,side%20dish,dessert,appetizer,salad,bread,breakfast,soup,fingerfood,snack`,
    method: "GET"
  })).then(function(results) {
    console.log(results);
    console.log(results.meals);
    console.log(results.nutrients);
    let mealList = results.meals;
    extractMealListId(mealList);
    writeTotalNutrientsBreakdown(results.nutrients);
  }).done(function () {
    console.log(mealListId);
    writeMealPlan(mealListId);
  })
}

function extractMealListId (mealList) {
  mealListId = [];
  // for (let meal of mealList) {
  //   console.log(meal.id);
  //   mealListId.push(meal.id);
  //   console.log(mealListId);
  // }
  $.each(mealList, function (index, value) {
    console.log(value);
    console.log(value.id);
    mealListId.push(value.id);
    console.log(mealListId);
  })
  return mealListId;
}

// functions to display search results on to page
function writeMealPlan(mealListId) {
  let mealPlanHtml = "";
  $.each(mealListId, function(index, value) {
    $.ajax({
      url: `https://api.spoonacular.com/recipes/${value}/information?apiKey=${apiKey}&includeNutrition=true`,
      method: 'GET'
    }).done(function(recipeData) {
      console.log(recipeData);
      console.log(recipeData.image);
      mealPlanHtml = `
      <div class="card mb-3">
          <div class="row row-cols-2 pt-3 pb-2">
              <h3 class="col my-auto ps-4">${writeMealCardTitle(index)}</h3>
              <div class="col text-end pe-4">
                  <button class="btn btn-secondary" onclick="findNewRecipe();"><i class="fas fa-random"></i></button>
              </div>
          </div>
          <div class="row g-0">
              <div class="col-md-4 my-auto">
                  <img src="${(recipeData.image)}" class="w-100 h-auto px-3" alt="${recipeData.title}">
              </div>
              <div class="col-md-8">
                  <div class="card-body">
                      <h4 class="card-title">${recipeData.title}</h4>
                      <p class="card-text">
                          <small class="text-muted">Ready in: ${recipeData.readyInMinutes} minutes</small>
                          <small class="text-muted float-end">Servings: ${recipeData.servings}</small>
                      </p>
                      <div class="row row-cols-2">
                          <div class="col text-center">
                              <span class="border py-2 px-3 d-block mb-2">Calories: </span>
                              <span class="border py-2 px-3 d-block">Fat: </span>
                          </div>
                          <div class="col text-center">
                              <span class="border py-2 px-3 d-block mb-2">Protein: </span>
                              <span class="border py-2 px-3 d-block">Carbs: </span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      `;
      mealPlanDisplay.append(mealPlanHtml);
    });
  });
};

function writeMealCardTitle (index) {
  if (index === 0) {
    return 'Breakfast';
  } else if (index === 1) {
    return 'Lunch';
  } else if (index === 2) {
    return 'Dinner';
  }
}

function writeTotalNutrientsBreakdown(nutrients) {
  let caloBreakdownHtml = "";
  caloBreakdownHtml += `
      <div class="clearfix">
          <div class="nutrient-key d-inline-block text-end w-50 me-2 text-white">Calories:</div>
          <div class="nutrient-value d-inline-block w-25 text-start text-white">${nutrients.calories}</div>
      </div>
      <div class="clearfix">
          <div class="nutrient-key protein-color d-inline-block text-end w-50 me-2">Protein:</div>
          <div class="nutrient-value protein-color d-inline-block w-25 text-start">${nutrients.protein}</div>
      </div>
      <div class="clearfix">
          <div class="nutrient-key fat-color d-inline-block text-end w-50 me-2">Fat:</div>
          <div class="nutrient-value fat-color d-inline-block w-25 text-start">${nutrients.fat}</div>
      </div>
      <div class="clearfix">
          <div class="nutrient-key carbs-color d-inline-block text-end w-50 me-2">Carbs:</div>
          <div class="nutrient-value carbs-color d-inline-block w-25 text-start">${nutrients.carbohydrates}</div>
      </div>
    `;
  totalNutrientsDisplay.append(caloBreakdownHtml);
}

// function findNewRecipe(

// )