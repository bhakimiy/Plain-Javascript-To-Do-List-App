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

        // Create a function that adds an element to the List on the page and to the ListController
        function addItem () {
            var itemName = listItemInputElement.value;
            if(itemName){
                var newListItem = ListController.addListItem(itemName);
                var newListItemElement = UIController.addListItemToUI(newListItem);

                /* All the Dragging related operations made here */
                toggleDraggable(newListItemElement);    // Making an Element draggable only when drag dots hover
                DragController.attachDragEventListeners(newListItemElement);    // Attaching all the needed drag event listeners to new created Element
                /* End Dragging related operations */

                checkboxOnChange.call(document.getElementById('checkbox-' + newListItem.id));   // Adding OnChange listener to the new Element

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
        
        var DragController = (function () {
            var cur = null, isTmpCreated = false, tmpLi = null;     // Saving current moving element to edit the classes after drag finishes, and creating helper variables

            var handleDragStart = function (e) {
                this.classList.add('moving');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.innerHTML);
                cur = this;
            };

            var handleDragOver = function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                if(cur !== this){
                    var thisRect = this.getBoundingClientRect();    // getBoundingClientRect() gives api where we can get the X, Y position and the height of the element on viewport
                    var mouseYOnObject = thisRect.top + thisRect.height - e.pageY;
                    var currentMousePositionRelativeToElement, mousePositionAtFirstPlaceholderCreated;




                    function createPlaceholder() {
                        tmpLi = document.createElement('li');       // Creating plain Li placeholder element
                        tmpLi.classList.add('tmp-li');              // Adding the prepared css class
                        tmpLi.style.height = thisRect.height;       // Setting the height of the element equal to other li elements' height.
                        isTmpCreated = true;

                        if(!isTmpCreated){                          // Check if li placeholder is created. And li placeholder create only if it was not created earlier
                            if((thisRect.height / 2) < mouseYOnObject){     // If user drags the object on top half of the element, the placeholder is created before that element
                                this.parentNode.insertBefore(tmpLi, this);
                                mousePositionAtFirstPlaceholderCreated = 'top';
                            } else {
                                this.parentNode.insertBefore(tmpLi, this.nextSibling);  // Otherwise, it will be created after the element
                                mousePositionAtFirstPlaceholderCreated = 'bottom';
                            }
                        }
                    }
                }


                return false;
            };

            var handleDragEnter = function (e) {
                if(isTmpCreated){

                }
            };

            var handleDragLeave = function (e) {

            };

            var handleDragEnd = function (e) {
                cur.classList.remove('moving');
                if(tmpLi){
                    tmpLi.remove();     // Removing the li placeholder
                    tmpLi = null;
                    isTmpCreated = false;   // Telling the drag controller that there is no any temporary li placeholder left, and it can be created if needed
                }
            };

            return {
                attachDragEventListeners: function (item) {
                    item.addEventListener('dragstart', handleDragStart);
                    item.addEventListener('dragover', handleDragOver);
                    item.addEventListener('dragleave', handleDragLeave);
                    item.addEventListener('dragend', handleDragEnd);
                }
            };
        })();
        
        // A function that makes the parent node of the element draggable
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
