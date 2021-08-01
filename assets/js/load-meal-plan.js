// automatically load previously generated meal plan and user's diet and intolerances accordingly
$(window).ready(function () {
    if (loadFromLocalStorage('loadMealPlan') === 'true') {
        let mealPlanNutrients = loadFromLocalStorage('totalNutrientBreakdown');
        $("#meal-plan").removeClass("d-none");
        intolerances = loadFromLocalStorage('userIntolerances');

        if (!loadFromLocalStorage('userDiet')) {
            diet = 'vegetarian';
            dietPreferenceList[0].checked = true;
        } else {
            diet = loadFromLocalStorage('userDiet');
            dietPreferenceList.each(function() {
                if (this.id === loadFromLocalStorage('userDiet')) {
                    this.checked = true;
                }
            })    
        }

        intoleranceList.each(function() {
            if (intolerances.includes(capitalizeFirstLetter(this.id))) {
                this.checked = true;
            }
        })

        mealPlanDisplay.html(loadFromLocalStorage('mealPlanDisplay'));
        viewRecipeDetails();
        drawCaloricBreakdownChart(mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('calories', mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('protein', mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('fat', mealPlanNutrients, 'mealPlanData');
        writeNutrientsAbsolute('carbohydrates', mealPlanNutrients, 'mealPlanData');
    }
})