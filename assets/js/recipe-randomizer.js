const userMealPreference = $("#meal-preference");
const mealPlanDisplay = $("#meal-plan-container");

const dietPreferenceList = $('input[name="diet-preference"]');
const intoleranceList = $('input[name="intolerances"]');
let diet = [];
let intolerances = [];

const apiKey = "1f698cd1ba074580acc428ca007720bc";

// gather search query and then fetch data through API call
dietPreferenceList.on("change", getUserDiet);
intoleranceList.on("change", getUserIntolerances);
userMealPreference.on("submit", e => {
  e.preventDefault();
  mealPlanDisplay.empty();
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