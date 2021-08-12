$(document).ready(function () {
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

    $('.back-to-meal-plan').on('click', function () {
        history.back();
    })

    activateAddRemoveButton();
})

function activateAddRemoveButton() {
    $('span.add').on('click', function () {
        if ($(this).hasClass('remove')) {
            $(this).removeClass('remove');
            $(this).text('+');
            $(this).addClass('add');
            addOrRemoveFromGroceryList($(this), 'remove');
        } else {
            $(this).removeClass('add');
            $(this).text('-');
            $(this).addClass('remove');
            addOrRemoveFromGroceryList($(this), 'add');
        }
    })
}

function addOrRemoveFromGroceryList(item, action) {
    const name = item.closest('li.row').find('.ingredient-name').text();
    const quantity = item.closest('li.row').find('.ingredient-qty').text();

    if (action === 'add' && !loadFromLocalStorage('groceryList')) {
        saveToLocalStorage('groceryList', [{name, quantity}]);
    } else if (action === 'add' && loadFromLocalStorage('groceryList')) {
        let retrievedGroceryList = loadFromLocalStorage('groceryList');
        retrievedGroceryList.push({name, quantity});
        saveToLocalStorage('groceryList', retrievedGroceryList);
    } else if (action === 'remove') {
        let retrievedGroceryList = loadFromLocalStorage('groceryList');
        const itemIndex = retrievedGroceryList.findIndex(element => element.name === name && element.quantity === quantity);
        retrievedGroceryList.splice(itemIndex, 1);
        saveToLocalStorage('groceryList', retrievedGroceryList);
    }
}

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
            <li class="row mb-3 align-items-center">
                <span class="col-1"><span class="add">+</span></span>
                <span class="ingredient-img col-3"><img src="${ingredientImgBaseUrl}${ingredient.image}" width="50" height="50"></span>
                <span class="ingredient-name col-5 my-auto">${capitalizeFirstLetter(ingredient.name)}</span>
                <span class="ingredient-qty col-3 my-auto">${ingredient.amount} ${ingredient.unit}</span>
            </li>
            `;
        })        
        return ingredientRows;
    } else {
        // $('.add-to-list-btn').hide();
        return `<p>Ingredient list can be found at <a href="${recipeData.sourceUrl}" target="_blank">${recipeData.sourceName}</a></p>`
    }
}