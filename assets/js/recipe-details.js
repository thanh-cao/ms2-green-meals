$(window).ready(function () {
    const recipeId = Number(loadFromLocalStorage('recipeIdToDisplay')); // convert Id from being a string loaded from localStorage to number
    const mealPlanData = loadFromLocalStorage('mealPlanData');
    console.log(recipeId);
    console.log(mealPlanData);

    const recipeData = mealPlanData.find(meal => meal.id === recipeId);
    console.log(recipeData);

    let recipeInstructions = generateOrderedRecipeInstructions(recipeData);
    let ingredientList = generateIngredientList(recipeData);

    $('.recipe-title').text(recipeData.title);
    $('#cooking-duration').text(recipeData.readyInMinutes);
    $('.ingredient-list').html(ingredientList);
    $('#servings').text(recipeData.servings);
    $('.recipe-img').attr('src', recipeData.image);
    $('.recipe-img').attr('alt', recipeData.title);
    $('#recipe-instructions').html(recipeInstructions);
    writeNutrientsAbsolute('calories', recipeData.nutrition.nutrients, 'mealData');
    writeNutrientsAbsolute('protein', recipeData.nutrition.nutrients, 'mealData');
    writeNutrientsAbsolute('fat', recipeData.nutrition.nutrients, 'mealData');
    writeNutrientsAbsolute('carbohydrates', recipeData.nutrition.nutrients, 'mealData');
    drawCaloricBreakdownChart(recipeData.nutrition.caloricBreakdown, 'mealData');
})

$('.back-to-meal-plan').on('click', function () {
    history.back();
    saveToLocalStorage('loadMealPlan', 'true');
})

function generateOrderedRecipeInstructions(recipeData) {
    let instructionArray = recipeData.analyzedInstructions;
    if (instructionArray.length !== 0) {
        let instructionSteps = '<ol>';
        instructionArray[0].steps.forEach(step => {
            instructionSteps += `<li>${step.step}</li>`;
        })
        instructionSteps += '</ol>';
        return instructionSteps;
    } else if (instructionArray.length === 0 && recipeData.sourceUrl) {
        return `<p>Detailed instructions can be found at <a href="${recipeData.sourceUrl}" target="_blank">${recipeData.sourceName}</a></p>`
    } else {
        return `<p>No detailed instructions found</p>`;
    }
}

function generateIngredientList(recipeData) {
    let ingredientImgBaseUrl = 'https://spoonacular.com/cdn/ingredients_100x100/';
    let ingredientRows = '';

    if (recipeData.extendedIngredients) {
        recipeData.extendedIngredients.forEach(ingredient => {
            ingredientRows += `
            <li class="row mb-3">
                <span class="ingredient-img col-3"><img src="${ingredientImgBaseUrl}${ingredient.image}" width="50" height="50"></span>
                <span class="ingredient-name col-6 my-auto">${capitalizeFirstLetter(ingredient.name)}</span>
                <span class="ingredient-qty col-3 my-auto">${ingredient.amount} ${ingredient.unit}</span>
            </li>
            `;
        })
        return ingredientRows;
    } else {
        return `<p>Ingredient list can be found at <a href="${recipeData.sourceUrl}" target="_blank">${recipeData.sourceName}</a></p>`
    }
}

// function to add to list in localStorage
// when the button is clicked, declare an ingredientArray and push in new arrays of ingredients
// let ingredientArray = [];
// recipeData.extendedIngredients.forEach(ingredient => {
//     ingredientArray.push([ingredient.name, ingredient.amount, ingredient.unit]);         
// })
// 
// save that ingredient array to localStorage
//
// need to check if localStorage already have some ingredient list saved in there
// if yes, load from storage and save as a variable
// when button is clicked, create a new ingredient array and then add it to the loaded variable and then save

// var a = [];
// a.push(JSON.parse(localStorage.getItem('session')));
// localStorage.setItem('session', JSON.stringify(a));

// function SaveDataToLocalStorage(data)
// {
//     var a = [];
//     // Parse the serialized data back into an aray of objects
//     a = JSON.parse(localStorage.getItem('session')) || [];
//     // Push the new data (whether it be an object or anything else) onto the array
//     a.push(data);
//     // Alert the array value
//     alert(a);  // Should be something like [Object array]
//     // Re-serialize the array back into a string and store it in localStorage
//     localStorage.setItem('session', JSON.stringify(a));
// }
