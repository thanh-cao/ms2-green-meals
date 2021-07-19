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
    $('.recipe-instructions').html(recipeInstructions);
    writeNutrientsAbsolute('calories', recipeData.nutrition.nutrients[0].amount);
    writeNutrientsAbsolute('protein', recipeData.nutrition.nutrients[8].amount);
    writeNutrientsAbsolute('fat', recipeData.nutrition.nutrients[1].amount);
    writeNutrientsAbsolute('carbs', recipeData.nutrition.nutrients[3].amount);
    drawCaloricBreakdownChart(recipeData.nutrition.caloricBreakdown);
})

function generateOrderedRecipeInstructions(recipeData) {
    let stepsArray = recipeData.analyzedInstructions[0].steps;
    if (stepsArray) {
        let instructionSteps = '<ol>';
        stepsArray.forEach(step => {
            instructionSteps += `<li>${step.step}</li>`;
        })
        instructionSteps += '</ol>';
        return instructionSteps;
    } else if (recipeData.sourceUrl) {
        return `<p>Detailed instructions can be found at <a href="${recipeData.sourceUrl}" target="_blank">${recipeData.sourceName}</a></p>`
    } else {
        return `<p>No detailed instructions found</p>`;
    }
}

function generateIngredientList(recipeData) {
    let ingredientImgBaseUrl = 'https://spoonacular.com/cdn/ingredients_100x100/';
    let ingredientRows = '';
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
}

function writeNutrientsAbsolute(nutrient, amount) {
    $(`.${nutrient}`).each(function () {
        $(this).text(amount);
    })
}

function drawCaloricBreakdownChart(nutrients) {
    let ctx = $('.recipe-nutrients-chart');
    let carbsCalories = nutrients.percentCarbs;
    let proteinCalories = nutrients.percentProtein;
    let fatCalories = nutrients.percentFat;
    
    const data = {
        labels: ['Carbs', 'Fat', 'Protein'],
        datasets: [{
            label: 'Caloric Breakdown',
            data: [Number(carbsCalories), Number(fatCalories), Number(proteinCalories)],
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
    };

    const config = {
        type: 'pie',
        data: data,
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

    ctx.each(function () {
        let caloricChart = new Chart($(this), config, data);
    })
}