// declaration of global variables
const userMealPreference = $("#meal-preference");
const mealPlanDisplay = $("#meal-plan-container");

const dietPreferenceList = $('input[name="dietPreference"]');
const intoleranceList = $('input[name="intolerances"]');
let diet = [];
let intolerances = [];

const totalNutrientsDisplay = $("#total-nutrients-absolute");
const totalNutrientsChart = $("#total-nutrients-chart");

const apiKey = "1f698cd1ba074580acc428ca007720bc";

// gather search query and then fetch data through API call
dietPreferenceList.on("change", getUserDiet);
intoleranceList.on("change", getUserIntolerances);
userMealPreference.on("submit", e => {
  e.preventDefault();
  mealPlanDisplay.empty();
  totalNutrientsDisplay.empty();
  totalNutrientsChart.empty();
  fetchMealPlanAPI();
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
    // intolerances.push($(this).attr("id"));
    console.log(intolerances);
  } else {
    intolerances.splice(intolerances.indexOf(this.labels[0].innerText), 1);
    console.log(intolerances);
  }
  return intolerances;
}

function fetchMealPlanAPI() {
  $.ajax({
    url: `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&diet=${diet}&exclude=${intolerances.toString()}&type=main%20course,side%20dish,dessert,appetizer,salad,bread,breakfast,soup,fingerfood,snack`,
    method: "GET"
  }).done(function(results) {
    console.log(results);
    writeMealPlan(results.meals);
    writeTotalNutrientsBreakdown(results.nutrients);
  });
}

// functions to display search results on to page
function writeMealPlan(meals) {
  let mealPlanHtml = "";
  meals.map(meal => {
    mealPlanHtml += `
      <div class="card mb-3">
          <div class="row row-cols-2 pt-3 pb-2">
              <h3 class="col my-auto ps-4">Breakfast</h3>
              <div class="col text-end pe-4">
                  <a href="#meal-plan" class="btn btn-secondary"><i class="fas fa-random"></i></a>
              </div>
          </div>
          <div class="row g-0">
              <div class="col-md-4 my-auto">
                  <img src="" class="w-100 h-auto px-3" alt="${meal.title}">
              </div>
              <div class="col-md-8">
                  <div class="card-body">
                      <h4 class="card-title">${meal.title}</h4>
                      <p class="card-text">
                          <small class="text-muted">Ready in: ${meal.readyInMinutes} minutes</small>
                          <small class="text-muted float-end">Servings: ${meal.servings}</small>
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
  });
  mealPlanDisplay.append(mealPlanHtml);
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
