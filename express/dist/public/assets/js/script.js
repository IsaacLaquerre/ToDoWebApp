function updateTaskList() {
  let tasks = query('#tasks');
  if (!tasks) return;
  let taskChildren = tasks.children;
  if (!taskChildren || taskChildren === undefined) return;
  let lastChild = taskChildren[taskChildren.length - 1];
  if (!lastChild || lastChild === undefined) return;
  let taskTitle = tasks.children[tasks.children.length - 1].children[2];
  if (!taskTitle || taskTitle === undefined);
  if (taskTitle.value === '' || taskTitle.value.length === 0) return;
  if (taskTitle.tagName === "INPUT") {
    let newTask = newEl('li');
    newTask.classList.add('task');
    if (lastChild.children[0].checked) newTask.classList.add('checked');
    newTask.setAttribute('onclick', 'check(this);');
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
    newTask.appendChild(checkSpan);

    let newTaskTitle = newEl('span');
    newTaskTitle.classList.add('task-title');
    newTaskTitle.innerHTML = taskTitle.value;
    newTask.appendChild(newTaskTitle);
  }
}

function check(task) {
  for (let i = 0; i < task.children.length; i++) {
    let child = task.children[0];
    if (child === undefined || child.classList === undefined || child.checked === undefined) return;
    if (child.classList.contains('task-checkbox')) {
      task.classList.toggle('checked');
      child.checked = !child.checked;
      let textChild = task.children[2];
      if (textChild === undefined || textChild.tagName === undefined) return;
      if (textChild.tagName !== "INPUT") {
        if (child.checked) {
            move(task, query('#completedTasks'));
            task.title = 'Unmark "' + task.children[2].innerHTML + '" as completed'
          } else {
            moveBefore(task, query("#tasks"), query('#newTask'));
            task.title = 'Mark "' + task.children[2].innerHTML + '" as completed';
          }
      }
    }
  }
}

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