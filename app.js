var tasks = [];
var currentTask = null;
var second = 0;

function load() {
  tasks = JSON.parse(localStorage.getItem("tasks")) ?? [];
  renderTasks();
  sortTasks();
}

const addButton = document.querySelector(".input-box button");
const taskName = document.querySelector(".input-box input[type='text']");
const taskTime = document.querySelector(".input-box input[type='number']");
const tasksBox = document.querySelector("#tasks");
load();
taskTime.value = 20;
addButton.addEventListener("click", addTask);
taskTime.addEventListener("change", (e) => {
  e.target.value = clampTime(e.target.value, 30, 15);
});
tasksBox.addEventListener("click", (e) => {
  manageTaskEvents(e);
});

setInterval(() => {
  if (currentTask == null) {
    var playBtns = document.querySelectorAll("i[data-btn='play']");
    playBtns.forEach((b) => {
      b.className = "bi bi-play-circle";
    });

    return;
  }
  var task = document.querySelector(`[data-id="${currentTask.id}"]`);
  if (!task) return;
  currentTask.second -= 0.01;
  if (currentTask.second <= 0) {
    currentTask.time--;
    currentTask.second = 59;
  }

  if (currentTask.time < 0) {
    currentTask.time = 0;
    task.style.backgroundColor = "redorange";
  }

  task.querySelector("#time").innerHTML = `${Math.round(
    currentTask.time
  )} : ${Math.round(currentTask.second)}`;

  var bar = task.querySelector(".progress-bar");

  bar.style.width = `${(currentTask.second * 100) / 60}%`;
  var index = tasks.findIndex((t) => t.id === currentTask.id);
  tasks[index] = currentTask;
}, 10);

function renderTasks() {
  if (!tasks || tasks.length == 0) return;
  tasks.forEach((t) => {
    const task = document.createElement("div");
    task.backgroundColor = "white";
    task.classList.add("task");
    task.setAttribute("data-id", t.id);
    task.innerHTML = `
    <span id="name">${t.name}</span>
    <span id="name-input"><input/></span>
    <span id="time">${t.time} : ${Math.round(t.second)}</span>
    <span id="time-input" ><input type="number"/></span>
    <span>
     <span class="play-btn btn"><i data-btn="play" class="bi bi-play-circle"></i></span>
    <span class="edit-btn btn"><i data-btn="edit" class="bi bi-pencil-square"></i></span>
    <span class="close-btn btn" ><i data-btn="close" class="bi bi-x-circle-fill"></i></span>
     <span class="check-btn btn" ><i data-btn="check" class="bi bi-circle"></i></span>
    </span>
    <div class="progress-bar" ></div>`;
    tasksBox.append(task);
    if (!t.notDone) {
      task.style.backgroundColor = "seagreen";
      var check = task.querySelector("[data-btn='check']");
      check.className = "bi bi-check-circle";
    }
  });
}

function manageTaskEvents(e) {
  if (e.target.dataset.btn == "close") {
    var { taskEl, task } = getTask(e);

    taskEl.remove();
    tasks.splice(
      tasks.indexOf((t) => t.id == task.id),
      1
    );
    sortTasks();
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  if (e.target.dataset.btn == "play") {
    var { taskEl, task } = getTask(e);

    task.notDone = true;
    taskEl.style.backgroundColor = "white";
    var checkBtn = taskEl.querySelector("[data-btn='check']");
    checkBtn.className = "bi bi-circle";

    if (currentTask == null) {
      currentTask = task;
      e.target.className = "bi bi-pause-circle";
      console.log(currentTask);
    } else {
      currentTask = null;
      e.target.className = "bi bi-play-circle";
    }
    sortTasks();
  }

  if (e.target.dataset.btn == "check") {
    var { taskEl, task } = getTask(e);

    if (e.target.className == "bi bi-check-circle") {
      e.target.className = "bi bi-circle";
      task.notDone = true;

      taskEl.style.backgroundColor = "white";
    } else {
      currentTask = null;
      e.target.className = "bi bi-play-circle";
      e.target.className = "bi bi-check-circle";
      task.notDone = false;
      taskEl.style.backgroundColor = "seagreen";
    }

    sortTasks();
    var index = tasks.indexOf(task);
    tasks[index] = task;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  if (e.target.dataset.btn == "edit") {
    var { taskEl, task } = getTask(e);
    var play = taskEl.querySelector("[data-btn='play']");
    play.className = "bi bi-play-circle";
    currentTask = null;
    var time = taskEl.querySelector("#time");
    var timeInput = taskEl.querySelector("#time-input input");
    var name = taskEl.querySelector("#name");
    var nameInput = taskEl.querySelector("#name-input input");

    timeInput.addEventListener("change", (e) => {
      e.target.value = clampTime(timeInput.value, 30, 15);
    });

    if (time.style.display != "none") {
      nameInput.value = name.innerText;
      timeInput.value = parseInt(time.innerText);

      time.style.display = "none";
      timeInput.style.display = "block";
      name.style.display = "none";
      nameInput.style.display = "block";
    } else {
      if (tasks.find((t) => t.name == nameInput.value && t.id != task.id)) {
        nameInput.placeholder = `this name exist!`;
        nameInput.value = "";
        return;
      }
      if (nameInput.value == "") return;
      time.style.display = "block";
      timeInput.style.display = "none";
      name.style.display = "block";
      nameInput.style.display = "none";

      time.innerText = `${timeInput.value} : 00`;
      name.innerText = nameInput.value;
      task.time = parseInt(timeInput.value);
      task.second = 0;

      task.name = nameInput.value;
    }
    var index = tasks.indexOf(task);
    tasks[index] = { ...task };
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}
function sortTasks() {
  var tasksElements = [...tasksBox.children];
  tasksElements.sort(
    (a, b) =>
      a.style.backgroundColor.includes("green") -
      b.style.backgroundColor.includes("green")
  );
  tasksElements.forEach((t, index) => {
    t.style.setProperty("--order", index);
  });
}

function getTask(e) {
  var taskEl = upTo(e.target, "div");
  var task = tasks.find((t) => t.id == taskEl.dataset.id);
  return { taskEl, task };
}

function clampTime(value, max, min) {
  if (value > max) {
    value = max;
  } else if (value < min) {
    value = min;
  }

  return value;
}

function addTask() {
  const newTask = {
    id: new Date().getTime(),
    notDone: true,
    name: taskName.value,
    time: taskTime.value,
    second: 0,
  };

  if (
    tasks.find(
      (t) => t.name.toLowerCase() == newTask.name.toLowerCase() && !t.notDone
    )
  ) {
    taskName.value = null;
    taskName.placeholder = `"${newTask.name}" already exist!`;
    taskName.classList.add("error");
    return;
  }
  if (taskName.value == "") {
    taskName.value = null;
    taskName.placeholder = "Can't be empty!";
    taskName.classList.add("error");
    return;
  }
  taskName.classList.remove("error");
  tasks.push(newTask);
  tasksBox.innerHTML = "";
  renderTasks();

  taskName.value = "";
  taskName.placeholder = "Enter task name...";
  taskName.focus();
  sortTasks();
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function upTo(el, tagName) {
  tagName = tagName.toLowerCase();

  while (el && el.parentNode) {
    el = el.parentNode;
    if (el.tagName && el.tagName.toLowerCase() == tagName) {
      return el;
    }
  }

  return null;
}
