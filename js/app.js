var tasks = [];
var isEditing = false;

var addBtn = document.getElementById("add-btn");
var taskNameInput = document.getElementById("task-name");
var tasksBox = document.getElementById("tasks-box");

load();

addEventListener("click", (e) => {
  save();
  if (e.target.dataset.btn === "edit") return;
  exitEdit();
  isEditing = false;
});

addBtn.onclick = () => {
  handelAddTaskEvent();
};

tasksBox.addEventListener("click", (e) => {
  manageTaskBoxEvents(e);
});

function handelAddTaskEvent() {
  if (taskNameInput.value == "") return;
  const newTask = {
    id: new Date().getTime(),
    name: taskNameInput.value,
    isDon: false,
  };

  tasks.push(newTask);

  renderTasks();
  sortTasks();
  taskNameInput.value = "";
  taskNameInput.focus();
}

function manageTaskBoxEvents(e) {
  if (e.target.dataset.btn === "close") {
    remove(e.target);
  } else if (e.target.dataset.btn === "edit") {
    if (!isEditing) {
      edit(e.target);
      isEditing = true;
    } else {
      exitEdit();
      isEditing = false;
    }
  } else if (e.target.dataset.btn === "checkbox") {
    toggleIsDon(e.target);
  }
}

function renderTasks() {
  tasksBox.innerHTML = "";
  tasks.forEach((t, index) => {
    const element = document.createElement("div");
    element.style.setProperty("--order", index);
    element.className = "task";
    element.setAttribute("data-id", t.id);

    element.innerHTML = `
    <span class="task-input" id="task-input"><input/></span>
    <span id="name">${t.name}</span>
    <span class="icons">
     <i data-btn="edit" class="bi bi-pencil-square"></i>
     <i data-btn="close"  class="bi bi-x-circle"></i>
     <i data-btn="checkbox"  class="bi bi-circle"></i>
    </span>
    `;

    element.children[0].onclick = (e) => {
      e.stopPropagation();
    };

    const checkBox = element.children[2].children[2];

    if (t.isDon) {
      checkBox.className = "bi bi-check-circle";
    } else {
      checkBox.className = "bi bi-circle";
    }

    tasksBox.append(element);
  });
}
function edit(target) {
  const taskDiv = getTaskDiv(target);
  const inputSpan = taskDiv.querySelector("#task-input");
  inputSpan.style.display = "inline";
  const name = taskDiv.querySelector("#name");
  name.style.display = "none";

  const input = inputSpan.querySelector("input");
  const index = getTaskIndex(taskDiv);
  input.onchange = (e) => {
    name.innerText = e.target.value;
    tasks[index].name = e.target.value;
  };
}
function remove(target) {
  var taskDiv = getTaskDiv(target);
  var index = getTaskIndex(taskDiv);
  tasks.splice(index, 1);
  renderTasks();
}
function getTaskIndex(taskDiv) {
  const task = tasks.find((t) => t.id == taskDiv.dataset.id);
  const index = tasks.indexOf(task);
  return index;
}

function getTaskDiv(target) {
  if (!target) return null;
  return target.parentElement.parentElement;
}

function exitEdit() {
  var inputs = tasksBox.querySelectorAll("#task-input");
  var names = tasksBox.querySelectorAll("#name");
  inputs.forEach((i) => {
    i.style.display = "none";
  });
  names.forEach((n) => {
    n.style.display = "inline";
  });
}

function toggleIsDon(target) {
  const taskDiv = getTaskDiv(target);
  const index = getTaskIndex(taskDiv);

  if (target.className == "bi bi-circle") {
    target.className = "bi bi-check-circle";
    tasks[index].isDon = true;
  } else {
    target.className = "bi bi-circle";
    tasks[index].isDon = false;
  }
  sortTasks();
  renderTasks();
}

function sortTasks() {
  tasks = tasks.sort((x, y) => {
    return Number(x.isDon) - Number(y.isDon);
  });
  tasks.forEach((t, index) => {
    const element = tasksBox.querySelector(`[data-id="${t.id}"]`);
    console.log(element);
    element.style.setProperty("--order", index);
  });
}

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function load() {
  tasks = JSON.parse(localStorage.getItem("tasks")) ?? [];
  tasks = tasks.filter((t) => t.isDon == false);
  renderTasks();
  sortTasks();
}
