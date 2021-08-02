$(window).ready(function () {
    let retrievedGroceryList = loadFromLocalStorage('groceryList');
    console.log(retrievedGroceryList);

    if (retrievedGroceryList) {
        let itemRows = '';
        retrievedGroceryList.forEach(item => {
            itemRows += `
                <div class="row g-0 align-items-start">
                    <div class="col-2 text-center">
                        <input class="item-checkbox" type="checkbox">
                    </div>
                    <div class="col-5">
                        <p class="grocery-item">${capitalizeFirstLetter(item[0])}</p>
                    </div>
                    <div class="col-3">
                        <p class="grocery-item-qty">${item[1]} ${item[2]}</p>
                    </div>
                    <div class="col-2 ps-0">
                        <i class="fas fa-edit"></i>
                        <i class="fas fa-trash-alt"></i>
                    </div>
                </div>
                `;
        });
        $('#grocery-list-data').append(itemRows);
    }

    let checkboxes = $('.item-checkbox');
    checkboxes.each(function() {
        $(this).on('click', function() {
            console.log($(this).parent().siblings());
            $(this).parent().siblings().toggleClass('strikethrough');
        })
    })
})