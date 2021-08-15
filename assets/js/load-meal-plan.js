// automatically load previously generated meal plan and user's diet and intolerances accordingly
$(window).ready(function () {
    if (loadFromLocalStorage('loadMealPlan') === 'true') {
        let mealPlanNutrients = loadFromLocalStorage('totalNutrientBreakdown');
        $("#meal-plan").removeClass("d-none");
        diet = loadFromLocalStorage('userDiet');
        intolerances = loadFromLocalStorage('userIntolerances');

        if (!diet) {
            diet = 'vegetarian'; // set to default diet
            dietPreferenceList[0].checked = true;
        } else {
            dietPreferenceList.each(function () {
                if (this.id === diet) {
                    this.checked = true;
                }
            })
        }

        if (!intolerances) {
            intolerances = []; // set to empty array as default to prevent intolerances variable being null
        } else {
            intoleranceList.each(function () {
                if (intolerances.includes(capitalizeFirstLetter(this.id))) {
                    this.checked = true;
                }
            })
        }

        mealPlanDisplay.html(loadFromLocalStorage('mealPlanDisplay'));
        viewRecipeDetails();
        
        generateCaloricBreakdown(mealPlanNutrients, 'mealPlanData', 'drawPieChart');
        generateCaloricBreakdown(['calories', 'protein', 'fat', 'carbohydrates'], 'mealPlanData', 'writeAbsoluteData', mealPlanNutrients);
    }
})