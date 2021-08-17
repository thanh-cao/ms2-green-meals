// declaration of global variables
const userMealPreference = $("#meal-preference");
const mealPlanDisplay = $("#meal-plan-container");

const dietPreferenceList = $('input[name="diet-preference"]');
const intoleranceList = $('input[name="intolerances"]');
let diet = 'vegetarian'; // make vegetarian as a default diet preference to give a visual hint to users that they can click and choose
let intolerances = [];

const totalNutrientsChart = $("#total-nutrients-chart");

const apiKey = "1f698cd1ba074580acc428ca007720bc";
const apiKey2 = "09c17d8e03d043c49e345a14a780221e"; // backup apiKey for use when daily quota is exceeded

let mealListId = [];

$(document).ready(function() {
  showReturningUserModal();
});

// event listeners
// gather search query and then fetch data through API call
dietPreferenceList.on("change", getUserDiet);
intoleranceList.on("change", getUserIntolerances);
userMealPreference.on("submit", e => {
  e.preventDefault();
  handleUserMealPreferences();
});

$('button[type="reset"]').on("click", function() {
  diet = "vegetarian"; // by reset, make vegetarian as a default diet preference
  intolerances.splice(0);
  mealListId.splice(0);
  $("#meal-plan").addClass("d-none");
  resetLocalStorage();
});

function handleUserMealPreferences() {
  $("#meal-plan").removeClass("d-none");
  mealPlanDisplay.empty();
  totalNutrientsChart.empty();
  fetchMealPlan();
  location.href = '#meal-plan-container';
}

// functions to gather user's search query based on diet preference and intolerances and parse queries to API call
function getUserDiet(e) {
  if (this.checked) {
    diet = this.labels[0].innerText;
  }
  
  // set visual cues for vegan diet to include dairy and egg as intolerances by default. Since vegan diet parameter already returns results excluding dairy and egg, it's not needed to also set intolerance param in this case.
  if (diet === 'Vegan') {
    intoleranceList[0].checked = true;
    intoleranceList[1].checked = true;
    intoleranceList[0].disabled = true;
    intoleranceList[1].disabled = true;
  } else {
    intoleranceList[0].checked = false;
    intoleranceList[1].checked = false;
    intoleranceList[0].disabled = false;
    intoleranceList[1].disabled = false;
  }

  saveToLocalStorage('userDiet', diet);
  return diet;
}

function getUserIntolerances(e) {
  if (this.checked) {
    intolerances.push(this.labels[0].innerText);
  } else {
    intolerances.splice(intolerances.indexOf(this.labels[0].innerText), 1);
  }
  saveToLocalStorage('userIntolerances', intolerances);
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
      let mealList = results.meals;

      extractMealListId(mealList);
      generateCaloricBreakdownSection(results.nutrients, 'mealPlanData', 'drawPieChart');
      generateCaloricBreakdownSection(['calories', 'protein', 'fat', 'carbohydrates'], 'mealPlanData', 'writeAbsoluteData', results.nutrients);
      saveToLocalStorage('totalNutrientBreakdown', results.nutrients);
    })
    .done(function () {
      writeMealPlan(mealListId);
    });
}

function extractMealListId(mealList) {
  //empty previous mealListId array and then assign a new one for new meal plan
  mealListId = [];
  $.each(mealList, function (index, value) {
    mealListId.push(value.id);
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
      saveToLocalStorage('mealPlanData', dataArray);
      dataArray.forEach(data => {
        let mealCardHtml = "";
        mealCardHtml = `
      <div class="card mb-3">
          <div class="row row-cols-2 pt-3 pb-2">
              <h3 class="col my-auto ps-4 meal-type-title">${writeMealCardTitle(dataArray.indexOf(data))}</h3>
              <div class="col text-end pe-4">
                  <button class="btn btn-secondary find-new-meal-btn" aria-label="Find new meal" onclick="findNewMeal($(this));"><i class="fas fa-random"></i></button>
              </div>
          </div>
          <div class="meal-card-data">
            ${writeMealCard(data)}
          </div>
      </div>
      `;
        mealPlanDisplay.append(mealCardHtml);
        saveToLocalStorage('loadMealPlan', 'true');
        saveToLocalStorage('mealPlanDisplay', mealPlanDisplay[0].innerHTML);
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

function writeMealCard(data) {
  let mealCardHtml = '';
  mealCardHtml = `
      <a class="row g-0" href="recipe-details.html" id="${data.id}">
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
                        <span class="border py-2 px-3 d-block mb-2">Calories: ${findNutrientAbsoluteData('calories', data.nutrition.nutrients, 'mealData')}</span>
                        <span class="border py-2 px-3 d-block">Fat: ${findNutrientAbsoluteData('fat', data.nutrition.nutrients, 'mealData')}g</span>
                    </div>
                    <div class="col text-center">
                        <span class="border py-2 px-3 d-block mb-2">Protein: ${findNutrientAbsoluteData('protein', data.nutrition.nutrients, 'mealData')}g</span>
                        <span class="border py-2 px-3 d-block">Carbs: ${findNutrientAbsoluteData('carbohydrates', data.nutrition.nutrients, 'mealData')}g</span>
                    </div>
                </div>
            </div>
        </div>
      </a>
     `;
  return mealCardHtml;
}

// function to add 'click' event listener for meal card to store meal ID being clicked in order to load the correct data at recipe-details page
function viewRecipeDetails() {
  $('div.meal-card-data > a').each(function () {
    $(this).click(function () {
      saveToLocalStorage('recipeIdToDisplay', $(this).attr('id'));
    });
  });
}

// functions below to add click event to buttons to fetch new specific meal, and consequentially update nutrients data and caloric breakdown chart based on the new meal plan
function findNewMeal(btn) {
  let retrievedMealPlan = loadFromLocalStorage('mealPlanData');
  let mealCardData = $(btn).parents('div.card div.row').next();
  let oldMeal = retrievedMealPlan.find(meal => meal.id === Number(mealCardData[0].firstElementChild.id));
  mealCardData.empty();

  $.ajax({
    url: `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&diet=${diet}&intolerances=${intolerances.toString().toLowerCase()}&number=30&offset=3&addRecipeNutrition=true&type=${$(btn).closest('.meal-type-title').text().toLowerCase()}`,
    method: "GET"
  }).then(function (data) {
    let results = data.results;
    let newMeal = results[Math.floor(Math.random() * results.length)];
    saveToLocalStorage('newMeal', newMeal);
    mealCardData.html(writeMealCard(newMeal));  
    viewRecipeDetails();
  }).done(function () {
    let newMealFromStorage = loadFromLocalStorage('newMeal');
    retrievedMealPlan.splice(retrievedMealPlan.indexOf(oldMeal), 1, newMealFromStorage);
    saveToLocalStorage('mealPlanData', retrievedMealPlan);
    saveToLocalStorage('mealPlanDisplay', mealPlanDisplay[0].outerHTML);
  });
  updateNewMealPlanNutrients();
}

function updateNewMealPlanNutrients() {
  let newMealPlan = loadFromLocalStorage('mealPlanData');
  let newTotalCarbs = 0, newTotalProtein = 0, newTotalFat = 0, newTotalCalories = 0;
  let newMealPlanNutrients;

  newMealPlan.forEach(meal => {
    newTotalCarbs += findNutrientAbsoluteData('carbohydrates', meal.nutrition.nutrients, 'mealData');
    newTotalProtein += findNutrientAbsoluteData('protein', meal.nutrition.nutrients, 'mealData');
    newTotalFat += findNutrientAbsoluteData('fat', meal.nutrition.nutrients, 'mealData');
    newTotalCalories += findNutrientAbsoluteData('calories', meal.nutrition.nutrients, 'mealData');
  });

  newMealPlanNutrients = {
    carbohydrates: `${Math.round(newTotalCarbs)}`,
    protein: `${Math.round(newTotalProtein)}`,
    fat: `${Math.round(newTotalFat)}`,
    calories: `${Math.round(newTotalCalories)}`
  };
  saveToLocalStorage('totalNutrientBreakdown', newMealPlanNutrients);

  generateCaloricBreakdownSection(newMealPlanNutrients, 'mealPlanData', 'drawPieChart');
  generateCaloricBreakdownSection(['calories', 'protein', 'fat', 'carbohydrates'], 'mealPlanData', 'writeAbsoluteData', newMealPlanNutrients);
}