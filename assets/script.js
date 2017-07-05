// List Controller Object
var ListController = (function () {
    var List = [];
    var ListItem = function (name) {
        this.id = List.length + 1;
        this.name = name;
        this.isDone = false;
        this.children = [];
    };

    return {
        getList: function () {
            return List;
        },

        assignParent: function () {

        },

        addListItem: function (itemName) {
            var newListItem = new ListItem(itemName);
            List.push(newListItem);
            return newListItem;
        }
    };
})();

// UI Controller Object
var UIController = (function () {
    var DOMStrings = {
        addNewButtonID: 'new',
        listItemNameInputID: 'new-task-name',
        finishedTasksListID: 'finished-tasks',
        unfinishedTasksListID: 'unfinished-tasks'
    };


    return {
        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItemToUI: function (listItem) {
            document.querySelector('#' + DOMStrings.unfinishedTasksListID).insertAdjacentHTML('beforeend', '<li>' + listItem.name + '<input type="checkbox" id="task-' + listItem.id + '"><label for="task-' + listItem.id + '"></label></li>');
        }
    };
})();

// App Controller Object
var AppController = (function (ListController, UIController) {
    var addEventListeners = function () {
        // Adding New Element to the List
        var addNewButton = document.getElementById(UIController.getDOMStrings().addNewButtonID);
        var listItemInputElement = document.getElementById(UIController.getDOMStrings().listItemNameInputID);
        if (addNewButton) {
            addNewButton.addEventListener('click', function () {
                var itemName = listItemInputElement.value;
                if(itemName){
                    var newIListItem = ListController.addListItem(itemName);
                    UIController.addListItemToUI(newIListItem);

                    // Adding OnChange listener to the new Element
                    checkboxOnChange.call(document.getElementById('task-' + newIListItem.id));

                    if(listItemInputElement.classList.contains('not-filled')){
                        listItemInputElement.classList.remove('not-filled');
                    }
                    listItemInputElement.value = "";
                } else {
                    document.getElementById(UIController.getDOMStrings().listItemNameInputID).classList.add('not-filled');
                }
            });
        }

        // Add OnChange event listener to checkbox input
        var checkboxOnChange = function () {
            var finishedTasksList = document.querySelector('#' + UIController.getDOMStrings().finishedTasksListID);
            var unfinishedTasksList = document.querySelector('#' + UIController.getDOMStrings().unfinishedTasksListID);
            if(this){
                this.addEventListener('change', function () {
                    if(this.checked){
                        finishedTasksList.appendChild(this.parentNode);
                    } else {
                        unfinishedTasksList.appendChild(this.parentNode);
                    }
                })
            }
        };
    };

    return {
        init: function () {
            addEventListeners();
        }
    };
})(ListController, UIController);

// Initialize App
AppController.init();
