const placeholders = [
  'Do my laundry',
  'Walk the dog',
  'Buy groceries',
  'Make my bed',
  'Read 30 minutes',
  'Fold and put away clean clothes',
  'Clean and organize my desk',
  'Plan meals for the week',
  'Empty trash',
  'Take recycling out',
  'Wash dishes',
  'Sweep and mop kitchen floor',
  'Change bed sheets',
  'Review monthly budget',
  'Organize desktop files',
  'Refill windshield washer fluid',
  'Prepare lunch for tomorrow',
  'Clean litter box',
  'Mow the lawn',
  'Rake leaves',
  'Shovel snow',
  'Water plants'
];

let totalTasks = 0;
let completedTasks = 0;

function load() {
  setPlaceholder();

  setInterval(() => {
    setPlaceholder();
  }, 5_000)
}

function setPlaceholder() {
  let oldPlaceholder = query('#newTask').children[2].placeholder;
  let newPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
  if (newPlaceholder === oldPlaceholder) return setPlaceholder();
  query('#newTask').children[2].setAttribute('placeholder', newPlaceholder);
}

function updatePercentage() {
  totalTasks = Array.from(document.querySelectorAll('span.task-title')).filter(el => el.id !== "newTask").length;
  completedTasks = Array.from(document.querySelectorAll('li.task.checked')).filter(el => el.id !== "newTask").length;
  query('#percentage').innerHTML = `${completedTasks}/${totalTasks} completed`
}

function updateTaskList() {
  let tasks = query('#tasks');
  if (!tasks) return;
  let taskChildren = tasks.children;
  if (!taskChildren || taskChildren === undefined) return;
  let lastChild = taskChildren[taskChildren.length - 1];
  if (!lastChild || lastChild === undefined) return;
  let taskTitle = tasks.children[tasks.children.length - 1].children[2];
  if (!taskTitle || taskTitle === undefined);
  if (taskTitle.value === '' || taskTitle.value.length === 0) taskTitle.value = taskTitle.placeholder;
  if (taskTitle.tagName === 'INPUT') {
    let newTask = newEl('li');
    newTask.classList.add('task');
    if (lastChild.children[0].checked) newTask.classList.add('checked');
    if (!lastChild.children[0].checked) tasks.insertBefore(newTask, lastChild);
    else query('#completedTasks').appendChild(newTask);

    let newTaskCheck = newEl('input');
    newTaskCheck.setAttribute('type', 'checkbox');
    newTaskCheck.classList.add('task-checkbox');
    newTaskCheck.checked = lastChild.children[0].checked;
    newTask.title = !lastChild.children[0].checked ? 'Mark "' + taskTitle.value + '" as completed' : 'Unmark "' + taskTitle.value + '" as completed';
    newTask.appendChild(newTaskCheck);

    let checkSpan = newEl('span');
    checkSpan.classList.add('checkmark');
    checkSpan.setAttribute('onclick', 'check(this.parentNode);');
    newTask.appendChild(checkSpan);

    let newTaskTitle = newEl('span');
    newTaskTitle.classList.add('task-title');
    newTaskTitle.innerHTML = taskTitle.value;
    newTask.appendChild(newTaskTitle);

    let newTaskDelete = newEl('span');
    newTaskDelete.classList.add('task-delete');
    newTaskDelete.setAttribute('onclick', 'deleteTask(this.parentNode);');
    newTaskDelete.innerHTML = 'x';
    newTask.appendChild(newTaskDelete);

    taskTitle.value = '';
    setPlaceholder();
    totalTasks = document.querySelectorAll('span.task-title').length;
    
    updatePercentage();
  }
}

function check(task) {
  let child = task.children[0];
  if (child === undefined || child.classList === undefined || child.checked === undefined) return;
  if (child.classList.contains('task-checkbox')) {
    task.classList.toggle('checked');
    child.checked = !child.checked;
    let textChild = task.children[2];
    if (textChild === undefined || textChild.tagName === undefined) return;
    if (textChild.tagName !== 'INPUT') {
      if (child.checked) {
          move(task, query('#completedTasks'));
          task.title = 'Unmark "' + task.children[2].innerHTML + '" as completed'
        } else {
          moveBefore(task, query('#tasks'), query('#newTask'));
          task.title = 'Mark "' + task.children[2].innerHTML + '" as completed';
        }
    }
  }

  updatePercentage();
}

function deleteTask(task) {
  task.remove();

  updatePercentage();
}

// Utils

function query(selector) {
  return document.querySelector(selector);
}

function newEl(tag) {
  return document.createElement(tag);
}

function move(toBeMoved, moveTo) {
  return moveTo.appendChild(toBeMoved);
}

function moveBefore(toBeMoved, moveTo, anchor) {
  return moveTo.insertBefore(toBeMoved, anchor);
}