const STORAGE_KEY = "roam-travel-planner-v1";

const form = document.querySelector("#tripForm");
const destinationInput = document.querySelector("#destination");
const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");
const activityNameInput = document.querySelector("#activityName");
const activityCostInput = document.querySelector("#activityCost");
const activitiesList = document.querySelector("#activities");
const emptyState = document.querySelector("#emptyState");
const totalCost = document.querySelector("#totalCost");
const clearButton = document.querySelector("#clearButton");
const savedNote = document.querySelector("#savedNote");

let trip = loadTrip();

function loadTrip() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      return {
        destination: typeof saved.destination === "string" ? saved.destination : "",
        startDate: typeof saved.startDate === "string" ? saved.startDate : "",
        endDate: typeof saved.endDate === "string" ? saved.endDate : "",
        activities: Array.isArray(saved.activities) ? saved.activities : []
      };
    }
  } catch (error) {
    console.warn("Could not load saved trip.", error);
  }
  return { destination: "", startDate: "", endDate: "", activities: [] };
}

function saveTrip() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    savedNote.textContent = "Saved on this device";
  } catch (error) {
    savedNote.textContent = "Could not save in this browser";
    console.warn("Could not save trip.", error);
  }
}

function render() {
  destinationInput.value = trip.destination;
  startDateInput.value = trip.startDate;
  endDateInput.value = trip.endDate;

  activitiesList.replaceChildren();
  let sum = 0;

  trip.activities.forEach((activity, index) => {
    const item = document.createElement("li");
    item.className = "activity-item";

    const name = document.createElement("span");
    name.className = "activity-name";
    name.textContent = activity.name;

    const rightSide = document.createElement("span");
    rightSide.style.display = "flex";
    rightSide.style.alignItems = "center";
    rightSide.style.gap = "10px";

    const cost = document.createElement("span");
    cost.className = "activity-cost";
    cost.textContent = formatMoney(activity.cost);
    sum += Number(activity.cost) || 0;

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${activity.name}`);
    remove.addEventListener("click", () => {
      trip.activities.splice(index, 1);
      saveTrip();
      render();
    });

    rightSide.append(cost, remove);
    item.append(name, rightSide);
    activitiesList.append(item);
  });

  emptyState.hidden = trip.activities.length > 0;
  totalCost.textContent = formatMoney(sum);
}

function formatMoney(amount) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR"
  }).format(Number(amount) || 0);
}

form.addEventListener("input", () => {
  trip.destination = destinationInput.value;
  trip.startDate = startDateInput.value;
  trip.endDate = endDateInput.value;
  saveTrip();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = activityNameInput.value.trim();
  const cost = Number(activityCostInput.value);

  if (!name) {
    activityNameInput.focus();
    return;
  }
  if (activityCostInput.value && (!Number.isFinite(cost) || cost < 0)) {
    activityCostInput.focus();
    return;
  }

  trip.activities.push({ name, cost: cost || 0 });
  activityNameInput.value = "";
  activityCostInput.value = "";
  saveTrip();
  render();
  activityNameInput.focus();
});

clearButton.addEventListener("click", () => {
  if (!window.confirm("Start a new trip? This will remove the trip saved in this browser.")) return;
  trip = { destination: "", startDate: "", endDate: "", activities: [] };
  saveTrip();
  render();
});

render();
