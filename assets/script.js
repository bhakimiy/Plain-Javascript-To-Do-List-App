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
        },
        
        removeItem: function (itemId) {
            for (var i = 0; List.length > i; i++){
                var cur = List[i];
            }
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

        addListItemToUI: function (listItem) {  // Adding List Item to the DOM
            var unfinishedTasksList = document.querySelector('#' + DOMStrings.unfinishedTasksListID); // &#8942;&#8942;
            var li = new DOMParser().parseFromString('<li id="task-' + listItem.id +'" data-depth="1"><span class="drag-dots fa fa-bars"></span><span class="text-content">' + listItem.name + '</span><span class="icons"><i class="fa fa-pencil icon edit" onclick="AppController.edit(event)" aria-hidden="true"></i><i class="fa fa-trash icon trash" onclick="AppController.remove(event)" aria-hidden="true"></i></span><input type="checkbox" id="checkbox-' + listItem.id + '" /><label for="checkbox-' + listItem.id + '"></label></li>', 'text/html');
            li = li.getElementById("task-" + listItem.id);
            return unfinishedTasksList.insertAdjacentElement('beforeend', li);
        },

        removeListItem: function (itemId) {
            document.getElementById(itemId).remove();
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
                        if(this.parentNode.dataset.isparent === 'true'){
                            moveChildElements(this.parentNode, true);       // Check the moveChildElements function
                        }
                    } else {
                        unfinishedTasksList.appendChild(this.parentNode);
                        if(this.parentNode.dataset.isparent === 'true'){
                            moveChildElements(this.parentNode, false);      // Check the moveChildElements function
                        }
                    }
                })
            }

            function moveChildElements(parentElement, isChecked) {      // This function was created to not repeating the code when moving the child elements with its parent
                var parentId = parseInt(parentElement.id.split('-')[1]);
                var taskList = ListController.getList();
                for(var i = 0; taskList.length > i; i++){
                    if(taskList[i].id === parentId){            // Getting the parent node in the ListController
                        var children = taskList[i].children;    // and getting its children array
                        children.forEach(function (t) {         // here starts manipulation with its child elements
                            var childElement = document.getElementById('checkbox-' + t);    // Finding the child element in the DOM
                            childElement.checked = isChecked;   // isChecked parameter is sent when the method was called
                            if(isChecked){
                                finishedTasksList.appendChild(childElement.parentNode);     // moving the element into finishedTasksList if the isChecked is true
                            } else {
                                unfinishedTasksList.appendChild(childElement.parentNode);   // otherwise into unfinishedTasksList
                            }
                        });
                    }
                }
            }
        };
        
        var DragController = (function () {
            var cur = null, isTmpCreated = false, tmpLi, placeholderPosition, currentMousePosition;     // Saving current moving element to edit the classes after drag finishes, and creating helper variables
            var dragStartMouseXPosition;                                                 // It used to check if user is trying to make the element child element.
                                                                                         // If user tries to drag to right side, the dragging element will be moved as a child element

            var handleDragStart = function (e) {
                this.classList.add('moving');                           // --
                e.dataTransfer.effectAllowed = 'move';                  //  Basic drag and drop initialization
                e.dataTransfer.setData('text/xml', this);    // --

                cur = this;                                             // Saving the dragging element to manipulate with it in the future
            };

            var handleDragOver = function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                if(cur !== this){
                    var thisRect = this.getBoundingClientRect();    // getBoundingClientRect() gives api where we can get the X, Y position and the height of the element on viewport
                    var mouseYOnObject = thisRect.top + thisRect.height - e.pageY;
                    currentMousePosition = ((thisRect.height / 2) < mouseYOnObject) ? 'top' : 'bottom';


                    if(typeof placeholderPosition === 'undefined'){     // placeholderPosition is declared in a scope of DragController. It used to check the created position placeholder
                        createPlaceholder();
                    } else if(placeholderPosition !== currentMousePosition){
                        tmpLi.remove();
                        isTmpCreated = false;
                        createPlaceholder();
                    }

                    function createPlaceholder() {
                        if(!isTmpCreated){       // Check if li placeholder is created. And create li placeholder only if it was not created earlier

                            tmpLi = document.createElement('li');       // Creating plain Li placeholder element
                            tmpLi.classList.add('tmp-li');              // Adding the prepared css class
                            tmpLi.style.height = thisRect.height;       // Setting the height of the element equal to other li elements' height.
                            tmpLi.addEventListener('dragover', placeholderDragOverHandler, false);
                            tmpLi.addEventListener('drop', handleDrop, false); // Making the placeholder able to receive drop elements

                            if((thisRect.height / 2) < mouseYOnObject){     // If user drags the object on top half of the element, the placeholder is created before that element
                                e.target.parentNode.insertBefore(tmpLi, e.target);
                                placeholderPosition = 'top';
                            } else {
                                e.target.parentNode.insertBefore(tmpLi, e.target.nextSibling);  // Otherwise, it will be created after the element
                                placeholderPosition = 'bottom';
                            }
                            isTmpCreated = true;
                        }
                    }

                    function placeholderDragOverHandler(e) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    }

                }


                return false;
            };

            var handleDragEnter = function (e) {
                e.preventDefault();
                dragStartMouseXPosition = e.pageX;                      // Saving the initial horizontal mouse position
            };

            var handleDrag = function (e) {
                setDepth();

                /**
                 * This function checks if user is dragging the element to the right or the left side.
                 * If the element will be pulled into the right side it will get the left margin which
                 * indicates that in case if he will drop the element it will become a child element of the element
                 * into which the dragging element was dragged on.
                 * */
                function setDepth() {
                    if(typeof tmpLi !== 'undefined' && placeholderPosition === 'bottom'){   // Checks if the placeholder is created and it is bottom placeholder
                        var depth = parseInt(e.target.dataset.depth) + 1;   // Using HTML 5 data attributes to manipulate with depth

                        if((e.pageX - dragStartMouseXPosition) > 40){
                            tmpLi.classList.add('depth-' + depth);
                            tmpLi.dataset.depth = depth;
                        } else if (tmpLi.classList.contains('depth-' + depth)) {
                            tmpLi.classList.remove('depth-' + depth);
                            tmpLi.dataset.depth = '';
                        }
                    }
                }
            };

            var handleDragLeave = function (e) {

            };

            var handleDrop = function (e) {
                if(e.stopPropagation){
                    e.stopPropagation();        // stops browser from redirecting
                }

                if(cur !== this){
                    var dropElement = cur.cloneNode(true);              // Cloning current dragging element to make move effect
                    dropElement.removeAttribute('class');               // Cleaning all the classes inherited from current dragging element, including 'moving' class
                    dropElement.removeAttribute('draggable');           // Cleaning draggable attribute to prevent unexpected behaviour
                    toggleDraggable(dropElement);                       // Making element draggable on hover the dragging dots
                    attachDragEventListeners(dropElement);              // Setting up all the needed drag and drop listeners to make it draggable
                    checkboxOnChange.call(dropElement.getElementsByTagName('input')[0]);    // Making the element to change its status from finished to unfinished or vice versa on check/uncheck the checkbox

                    if(this.dataset.depth){
                        var depth = this.dataset.depth;
                        dropElement.classList.add('depth-' + depth);
                        dropElement.dataset.depth = depth;

                        /* <-- Attaching the parent */
                        var parent = findParent(this);
                        parent.dataset.isparent = true;
                        var parentId = parseInt(parent.id.split('-')[1]);
                        var taskList = ListController.getList();
                        for(var i = 0; taskList.length > i; i++){
                            if(taskList[i].id === parentId){
                                var dropElementId = parseInt(dropElement.id.split('-')[1]);
                                taskList[i].children.push(dropElementId);
                            }
                        }
                        /* --> End parent attaching */
                    } else {
                        cur.dataset.depth = 1;
                    }

                    cur.remove();
                    this.parentNode.insertBefore(dropElement, this);
                }

                /* This function finds the nearest LI element with lover depth level */
                function findParent(el) {
                    var previous = el.previousElementSibling;
                    if(previous.nodeName.toUpperCase() === 'LI'){   // Checking if the previous sibling element is LI
                        if((parseInt(previous.dataset.depth) + 1) === parseInt(el.dataset.depth)){  // ONLY If the depth of sibling element is higher for 1, than the placeholder's depth, it will be the parent
                            return previous;                                                        // and will it be returned
                        } else {
                            return findParent(previous);                                            // otherwise, the search will continue
                        }
                    } else {
                        return -1;  // If proper element not found, return -1
                    }
                }

                return false;
            };

            var handleDragEnd = function (e) {
                cur.classList.remove('moving');
                if(tmpLi){
                    tmpLi.remove();         // Removing the li placeholder
                    tmpLi = undefined;
                    isTmpCreated = false;   // Telling the drag controller that there is no any temporary li placeholder left, and it can be created if needed
                    placeholderPosition = currentMousePosition = undefined;
                }
            };

            function attachDragEventListeners(item) {
                item.addEventListener('dragstart', handleDragStart, false);
                item.addEventListener('drag', handleDrag, false);
                item.addEventListener('dragenter', handleDragEnter, false);
                item.addEventListener('dragover', handleDragOver, false);
                item.addEventListener('dragleave', handleDragLeave, false);
                item.addEventListener('dragend', handleDragEnd, false);
            }

            return {
                attachDragEventListeners: function (item) {
                    attachDragEventListeners(item);
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
        },
        
        edit: function (e) {
            var editingListElement = e.target.parentNode.parentNode;                        // Getting the list item which should be edited
            var editingListElementOnViewport = editingListElement.getBoundingClientRect();  // Getting the object which holds all needed information about dimensions of list item on viewport
            var inputBox = document.createElement('input');                                 // Creating the the input which will be used to edit the text by user
            var saveButton = document.createElement('button');                              // Creating the save button
            var cancelButton = document.createElement('button');                            // Creating the cancel button to reset all the changes

            editingListElement.classList.add('editing');                                    // Adding .editing class to list element to prevent hover effect. Check style.css line 89
            inputBox.setAttribute('type', 'text');                                          // Making input element text input element
            inputBox.value = editingListElement.textContent;                                // Setting the text which holds the list element into text input
            inputBox.style.height = editingListElementOnViewport.height;                    // setting the height and -->
            inputBox.style.width = editingListElementOnViewport.width;                      // --> width of input as the size of the list item on viewport to fully cover the list item
            inputBox.style.position = 'absolute';                                           // --
            inputBox.style.left = editingListElementOnViewport.left;                        //  Here input element is being placed on top of list item on viewport
            inputBox.style.top = editingListElementOnViewport.top;                          // --

            saveButton.textContent = 'Save';
            saveButton.classList.add('buttons');
            saveButton.style.position = 'absolute';
            saveButton.style.top = editingListElementOnViewport.top + editingListElementOnViewport.height;
            saveButton.style.left = editingListElementOnViewport.left + (editingListElementOnViewport.width / 2) - 70;  // Placing the button just under the input text and aligning it --
                                                                                                                        // -- in the middle relative to text input. 70 is the width of button
                                                                                                                        // check style.css line 332
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('buttons');
            cancelButton.style.position = 'absolute';
            cancelButton.style.top = editingListElementOnViewport.top + editingListElementOnViewport.height;
            cancelButton.style.left = editingListElementOnViewport.left + (editingListElementOnViewport.width / 2);     // Placing the button just under the input text and aligning it --
                                                                                                                        // -- in the middle relative to text input after save button

            document.body.appendChild(inputBox);        //
            document.body.appendChild(saveButton);      //  Placing created elements in the document
            document.body.appendChild(cancelButton);    //

            saveButton.onclick = function (e) {
                editingListElement.getElementsByClassName('text-content')[0].textContent = inputBox.value;
                editingListElement.classList.remove('editing');
                removeCreatedElements();
            };

            function removeCreatedElements() {
                saveButton.remove();
                cancelButton.remove();
                inputBox.remove();
            }
        },
        
        remove: function (e) {
            var listItem = e.target.parentNode.parentNode;
            UIController.removeListItem(listItem.id);
        }
    };
})(ListController, UIController);

// Initialize App
AppController.init();