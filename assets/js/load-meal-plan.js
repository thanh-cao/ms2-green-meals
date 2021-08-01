// automatically load previously generated meal plan
$(window).ready(function () {
    if (loadFromLocalStorage('loadMealPlan') === 'true') {
        let mealPlanNutrients = loadFromLocalStorage('totalNutrientBreakdown');
        $("#meal-plan").removeClass("d-none");

        mealPlanDisplay.html(loadFromLocalStorage('mealPlanDisplay'));
        viewRecipeDetails();
        drawCaloricBreakdownChart(mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('calories', mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('protein', mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('fat', mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('carbohydrates', mealPlanNutrients, 'mealPlanData');
    }
})