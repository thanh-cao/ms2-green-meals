$(document).ready(function () {
    let retrievedGroceryList = loadFromLocalStorage('groceryList');
    console.log(retrievedGroceryList);

    if (!retrievedGroceryList || retrievedGroceryList.length === 0) {
        $('.section-card-wrapper.grocery').html(`
        <h5 class="text-center">Grocery list is empty</h5>
        <img src="assets/img/empty-grocery-list.jpg" class="w-100 h-auto" alt="Empty grocery cart">
        `);
    } else {
        let itemRows = '';
        retrievedGroceryList.forEach(item => {
            itemRows += `
                <div class="row g-0 mb-3 align-items-center" data-index="${retrievedGroceryList.indexOf(item)}">
                    <div class="col-2 text-center">
                        <input class="item-checkbox" type="checkbox">
                    </div>
                    <div class="col-5 d-flex justify-content-between grocery-item" contenteditable>
                        ${item.name}
                    </div>
                    <div class="col-4 d-flex justify-content-between grocery-item-qty" contenteditable>
                        ${item.quantity}
                    </div>
                    <div class="col-1">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                </div>
                `;
        });
        $('#grocery-list-data').append(itemRows);
    }

    activateButtons(); // activate actions for grocery list items
    showReturningUserModal();
})

function activateButtons() {
    let checkboxes = $('.item-checkbox');
    let itemEditable = $('.grocery-item');
    let qtyEditable = $('div.grocery-item-qty');
    let removeBtns = $('i.fa-trash-alt');

    checkboxes.each(function () {
        $(this).on('click', function () {
            $(this).parent().next().toggleClass('strikethrough').next().toggleClass('strikethrough');
        })
    })

    itemEditable.each(handleContentEditable);
    qtyEditable.each(handleContentEditable);

    removeBtns.each(function () {
        $(this).on('click', function () {
            const itemIndex = Number($(this).closest('div[data-index]').attr('data-index'));

            updateGroceryList(itemIndex, 'remove');
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

function handleContentEditable() {
    $(this).mouseenter(function() {
        $(this).append('<i class="fas fa-edit d-inline"></i>');
    })
    $(this).mouseleave(function() {
        $(this).children('i').remove();
    })
    $(this).blur(function() {
        const itemIndex = Number($(this).closest('div[data-index]').attr('data-index'));

        if ($(this).hasClass('grocery-item')) {
            updateGroceryList(itemIndex, 'edit', 'name', this.innerText);
        } else if ($(this).hasClass('grocery-item-qty')) {
            updateGroceryList(itemIndex, 'edit', 'quantity',this.innerText);
        }
    })
}

function updateGroceryList(index, action, key, value) {
    const retrievedGroceryList = loadFromLocalStorage('groceryList');

    if (action === 'edit' && key === 'name'){
        retrievedGroceryList[index].name = value;
        saveToLocalStorage('groceryList', retrievedGroceryList);
    } else if (action === 'edit' && key === 'quantity') {
        retrievedGroceryList[index].quantity = value;
        saveToLocalStorage('groceryList', retrievedGroceryList);
    } else if (action === 'remove') {
        retrievedGroceryList.splice(index, 1);
        saveToLocalStorage('groceryList', retrievedGroceryList);
    }
}