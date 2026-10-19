// Éléments stables de la page
const form = document.querySelector("#todo-add");
const list = document.querySelector("#todo-list");
const emptyMessage = document.querySelector("#todo-empty");
const template = document.querySelector("#todo-item-template");

// L'état : la seule source de vérité
const tasks = [];

// Outils
let nextId = 1;
const uid = () => String(nextId++);
const findTask = (id) => tasks.find((task) => task.id === id);
// Date locale au format AAAA-MM-JJ, comparable à la valeur d'un <input type="date">
const today = () => new Date().toLocaleDateString("en-CA");

// --- Ajout ---------------------------------------------------------------
const getTitle = (data) => (data.get("title") ?? "").toString().trim();
const getTags = (data) => (data.get("tags") ?? "").toString().split(",").map((tag) => tag.trim()).filter(Boolean);
const getDueDate = (data) => (data.get("dueDate") ?? "").toString();
const isEmpty = (value) => value.trim() === "";

function createTask(title, tags, dueDate) {
  return { id: uid(), title, tags, dueDate, status: "todo", completed: false };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  const title = getTitle(data);
  if (isEmpty(title)) return; // précondition

  const task = createTask(title, getTags(data), getDueDate(data));
  tasks.push(task);

  form.reset();
  render();
});

// --- Dupliquer, supprimer : un clic délégué et une table de dispatch -------
function createTaskFrom(task) {
  return { ...task, id: uid(), tags: [...task.tags], title: task.title + " (copie)" };
}

function duplicateHandler(task) {
  const copy = createTaskFrom(task);
  tasks.splice(tasks.indexOf(task) + 1, 0, copy);
}

function deleteHandler(task) {
  tasks.splice(tasks.indexOf(task), 1);
}

const handlers = {
  delete: deleteHandler,
  duplicate: duplicateHandler,
};

function actionHandler(action, task) {
  if (!Object.hasOwn(handlers, action)) return;
  handlers[action](task);
}

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const item = button.closest(".todo-item");
  const task = item && findTask(item.dataset.id);
  if (!task) return;

  actionHandler(button.dataset.action, task);
  render();
});

// --- Compléter, changer le statut : un change délégué ----------------------
list.addEventListener("change", (event) => {
  const item = event.target.closest(".todo-item");
  const task = item && findTask(item.dataset.id);
  if (!task) return;

  if (event.target.matches(".todo-item__check")) task.completed = event.target.checked;
  if (event.target.matches(".todo-item__status")) task.status = event.target.value;
  render();
});

// --- Éditer le titre : dblclick, puis focusout -----------------------------
list.addEventListener("dblclick", (event) => {
  const title = event.target.closest(".todo-item__title");
  if (!title) return;
  title.contentEditable = "true";
  title.focus();
});

// Entrée valide la saisie plutôt que d'ajouter un saut de ligne
list.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.isContentEditable) {
    event.preventDefault();
    event.target.blur();
  }
});

// blur ne bouillonne pas : pour déléguer, on écoute focusout, qui bouillonne
list.addEventListener("focusout", (event) => {
  const title = event.target.closest(".todo-item__title");
  if (!title || !title.isContentEditable) return;

  const task = findTask(title.closest(".todo-item").dataset.id);
  const value = title.textContent.trim();
  if (task && !isEmpty(value)) task.title = value; // précondition : titre non vide
  render();
});

// --- Rendu -----------------------------------------------------------------
function createTaskItem(template, task) {
  const node = template.content.cloneNode(true);

  const item = node.querySelector(".todo-item");
  item.dataset.id = task.id;
  item.dataset.status = task.status;
  item.classList.toggle("is-done", task.completed);

  node.querySelector(".todo-item__check").checked = task.completed;
  node.querySelector(".todo-item__title").textContent = task.title;
  node.querySelector(".todo-item__status").value = task.status;

  const due = node.querySelector(".todo-item__due");
  if (task.dueDate) {
    due.textContent = "📅 " + task.dueDate;
    due.classList.toggle("is-late", !task.completed && task.dueDate < today());
  } else {
    due.remove();
  }

  const tagsBox = node.querySelector(".todo-item__tags");
  for (const label of task.tags) {
    const chip = document.createElement("span");
    chip.className = "todo-tag";
    chip.textContent = label;
    tagsBox.appendChild(chip);
  }

  return node;
}

function updateUI() {
  emptyMessage.hidden = tasks.length > 0;
}

function emptyList() {
  list.textContent = "";
  updateUI();
}

function render() {
  emptyList();

  for (const task of tasks) {
    const node = createTaskItem(template, task);
    list.appendChild(node);
  }
}

render();
