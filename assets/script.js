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
        unfinishedTasksListID: 'unfinished-tasks',
        listItemDragDots: 'drag-dots'
    };


    return {
        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItemToUI: function (listItem) {
            var unfinishedTasksList = document.querySelector('#' + DOMStrings.unfinishedTasksListID);
            var li = new DOMParser().parseFromString('<li id="task-' + listItem.id +'"><span class="drag-dots">&#8942;&#8942;</span>' + listItem.name + '<input type="checkbox" id="checkbox-' + listItem.id + '" /><label for="checkbox-' + listItem.id + '"></label></li>', 'text/html');
            li = li.getElementById("task-" + listItem.id);
            return unfinishedTasksList.insertAdjacentElement('beforeend', li);
        }
    };
})();

// App Controller Object
var AppController = (function (ListController, UIController) {
    var addEventListeners = function () {

        var addNewButton = document.getElementById(UIController.getDOMStrings().addNewButtonID);
        var listItemInputElement = document.getElementById(UIController.getDOMStrings().listItemNameInputID);

        // Adding New Element to the List on click on addNewButton
        if (addNewButton) {
            addNewButton.addEventListener('click', addItem);
        }

        // Adding New Element to the List on Enter KeyDown event fired
        listItemInputElement.onkeydown = function (e) {
            if(e.keyCode === 13){
                addItem();
            }
        };

        // Create a function that adds element to the List on the page and to the ListController
        function addItem () {
            var itemName = listItemInputElement.value;
            if(itemName){
                var newListItem = ListController.addListItem(itemName);
                var newListItemElement = UIController.addListItemToUI(newListItem);
                toggleDraggable(newListItemElement);
                // Adding OnChange listener to the new Element
                checkboxOnChange.call(document.getElementById('checkbox-' + newListItem.id));

                if(listItemInputElement.classList.contains('not-filled')){
                    listItemInputElement.classList.remove('not-filled');
                }
                listItemInputElement.value = "";
            } else {
                document.getElementById(UIController.getDOMStrings().listItemNameInputID).classList.add('not-filled');
            }
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

        // A function that makes the parent node of the
        var toggleDraggable = function(el){
            el.firstChild.onmouseover = function(){
                if(this){
                    this.parentNode.setAttribute("draggable", "true");
                }
            };
            el.firstChild.onmouseout = function () {
                if(this){
                    this.parentNode.setAttribute("draggable", 'false');
                }
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
