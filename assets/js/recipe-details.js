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

    $('.add-to-list-btn').on('mousedown', function (e) {
        e.preventDefault();  // remove button's :focus state on mousedown
        let ingredientArray = [];
    
        recipeData.extendedIngredients.forEach(ingredient => {
            ingredientArray.push([ingredient.name, ingredient.amount, ingredient.unit]);
        });
    
        if (!loadFromLocalStorage('groceryList')) {
            saveToLocalStorage('groceryList', ingredientArray);
            $('.add-to-list-btn').text('Added');
        } else {
            let retrievedIngredientArray = loadFromLocalStorage('groceryList');
            console.log(retrievedIngredientArray);
    
            if ($('.add-to-list-btn').text() === 'Add to grocery list') {
                ('groceryList');
                retrievedIngredientArray.push(...ingredientArray);
                console.log(retrievedIngredientArray);
                saveToLocalStorage('groceryList', retrievedIngredientArray);
                $('.add-to-list-btn').text('Added');
            } else {
                console.log(retrievedIngredientArray);
                console.log(ingredientArray);
                console.log(retrievedIngredientArray.indexOf(ingredientArray[0]));
                retrievedIngredientArray.splice(retrievedIngredientArray.indexOf(ingredientArray[0]));
                console.log('New array ' + retrievedIngredientArray);
                saveToLocalStorage('groceryList', retrievedIngredientArray);
                $('.add-to-list-btn').text('Add to grocery list');
            }
        }
    })
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
        $('.add-to-list-btn').hide();
        return `<p>Ingredient list can be found at <a href="${recipeData.sourceUrl}" target="_blank">${recipeData.sourceName}</a></p>`
    }
}