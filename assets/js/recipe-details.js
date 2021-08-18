$(document).ready(function() {
    const recipeId = Number(loadFromLocalStorage('recipeIdToDisplay')); // convert Id from being a string loaded from localStorage to number
    const mealPlanData = loadFromLocalStorage('mealPlanData');
    const recipeData = mealPlanData.find(meal => meal.id === recipeId);
    let recipeInstructions = generateOrderedRecipeInstructions(recipeData);
    let ingredientList = generateIngredientList(recipeData);

    $('.recipe-title').text(recipeData.title);
    $('#cooking-duration').text(recipeData.readyInMinutes);
    $('.ingredient-list').html(ingredientList);
    $('#servings').text(recipeData.servings);
    $('.recipe-img').attr('src', recipeData.image);
    $('.recipe-img').attr('alt', recipeData.title);
    $('#recipe-instructions').html(recipeInstructions);

    generateCaloricBreakdownSection(recipeData.nutrition.caloricBreakdown, 'mealData', 'drawPieChart');
    generateCaloricBreakdownSection(['calories', 'protein', 'fat', 'carbohydrates'], 'mealData', 'writeAbsoluteData', recipeData.nutrition.nutrients);

    $('.back-to-meal-plan').on('click', function() {
        history.back();
    });
    activateAddRemoveButton();
    showReturningUserModal();
});

function activateAddRemoveButton() {
    checkIfItemsAreAlreadyAdded(); // by default, an ingredient item has "add" action to add the item to grocery list. If an item is already added in the list, give it 'remove' action

    $('button.add-remove-item').on('click', function() {
        let action = $(this).children();

        if (action.hasClass('bi-dash-circle')) {
            action.removeClass('bi-dash-circle');
            action.addClass('bi-plus-circle');
            action.attr('aria-label', 'add item to grocery list');
            addOrRemoveFromGroceryList(action, 'remove');
        } else {
            action.removeClass('bi-plus-circle');
            action.addClass('bi-dash-circle');
            action.attr('aria-label', 'remove item from grocery list');
            addOrRemoveFromGroceryList(action, 'add');
        }
    });
}

function checkIfItemsAreAlreadyAdded() {
    const retrievedGroceryList = loadFromLocalStorage('groceryList');

    if (retrievedGroceryList) {
        $('.ingredient-name').each(function() {
            let name = $(this).text();
            let quantity = $(this).next().text();
            let ingredientItem = { name, quantity };
            let foundIndex = retrievedGroceryList.findIndex(groceryItem => {
                if (groceryItem.name === ingredientItem.name && groceryItem.quantity === ingredientItem.quantity)
                    return true;
            });

            if (foundIndex !== -1) {
                $(this).prev().prev().find('i.bi').removeClass('bi-plus-circle');
                $(this).prev().prev().find('i.bi').addClass('bi-dash-circle');
                $(this).prev().prev().find('i.bi').attr('aria-label', 'remove item from grocery list');
            }
        });
    }
}

function addOrRemoveFromGroceryList(item, action) {
    const name = item.closest('li.row').find('.ingredient-name').text();
    const quantity = item.closest('li.row').find('.ingredient-qty').text();

    if (action === 'add' && !loadFromLocalStorage('groceryList')) {
        saveToLocalStorage('groceryList', [{ name, quantity }]);
    } else if (action === 'add' && loadFromLocalStorage('groceryList')) {
        let retrievedGroceryList = loadFromLocalStorage('groceryList');
        retrievedGroceryList.push({ name, quantity });
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
        });
        instructionSteps += '</ol>';
        return instructionSteps;
    } else if (instructionArray.length === 0 && recipeData.sourceUrl) {
        return `<p>Detailed instructions can be found at <a href="${recipeData.sourceUrl}" target="_blank" rel="noopener">${recipeData.sourceName}</a></p>`;
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
            <li class="row mb-3 g-0 align-items-center">
                <span class="col-1">
                    <button class="add-remove-item">
                        <i class="bi bi-plus-circle" aria-label="add item to grocery list"></i>    
                    </button>
                </span>
                <span class="ingredient-img col-3">
                    <img src="${ingredientImgBaseUrl}${ingredient.image}" width="50" alt="${ingredient.name}">
                </span>
                <span class="ingredient-name col-5 my-auto">${capitalizeFirstLetter(ingredient.name)}</span>
                <span class="ingredient-qty col-3 my-auto">${ingredient.amount} ${ingredient.unit}</span>
            </li>
            `;
        });
        return ingredientRows;
    } else {
        return `<p>Ingredient list can be found at <a href="${recipeData.sourceUrl}" target="_blank" rel="noopener">${recipeData.sourceName}</a></p>`;
    }
}