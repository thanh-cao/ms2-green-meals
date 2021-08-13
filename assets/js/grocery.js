$(document).ready(function () {
    let retrievedGroceryList = loadFromLocalStorage('groceryList');
    console.log(retrievedGroceryList);

    if (!retrievedGroceryList) {
        $('.section-card-wrapper.grocery').html(`
        <h5 class="text-center">Grocery list is empty</h5>
        <img src="assets/img/empty-grocery-list.jpg" class="w-100 h-auto" alt="Empty grocery cart">
        `);
    } else {
        let itemRows = '';
        retrievedGroceryList.forEach(item => {
            itemRows += `
                <div class="row g-0 mb-3 align-items-center">
                    <div class="col-2 text-center">
                        <input class="item-checkbox" type="checkbox">
                    </div>
                    <div class="col-5 grocery-item">
                        ${item.name}
                    </div>
                    <div class="col-4 pe-2 d-flex justify-content-between">
                        <span class="grocery-item-qty d-inline w-75" contenteditable>${item.quantity}</span>
                    </div>
                    <div class="col-1">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                </div>
                `;
        });
        $('#grocery-list-data').append(itemRows);
    }

    activateButtons();
})

function activateButtons() {
    let checkboxes = $('.item-checkbox');
    let qtyEditable = $('span.grocery-item-qty');
    let removeBtns = $('i.fa-trash-alt');

    checkboxes.each(function () {
        $(this).on('click', function () {
            $(this).parent().next().toggleClass('strikethrough').next().toggleClass('strikethrough');
        })
    })

    qtyEditable.each(function () {
        $(this).mouseenter(function () {
            $(this).parent().append('<i class="fas fa-edit d-inline"></i>');
        })
        $(this).mouseleave(function () {
            $(this).siblings('i').remove();
        })
    })

    removeBtns.each(function () {
        $(this).on('click', function () {
            console.log($(this).parents()[1]);
            $(this).parents()[1].remove();
        })
    })

    $('button.btn-reset').on('click', function () {
        $('.section-card-wrapper.grocery').html(`
        <h5 class="text-center">Grocery list is empty</h5>
        <img src="assets/img/empty-grocery-list.jpg" class="w-100 h-auto" alt="Empty grocery cart">
        `);
        localStorage.removeItem('groceryList');
    })
}