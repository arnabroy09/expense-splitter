const body = document.body;

const themeToggleBtn = document.getElementById("themeToggleBtn");
const printBtn = document.getElementById("printBtn");
const toastContainer = document.getElementById("toastContainer");

const trackerTabBtn = document.getElementById("trackerTabBtn");
const calculatorTabBtn = document.getElementById("calculatorTabBtn");
const trackerSection = document.getElementById("trackerSection");
const calculatorSection = document.getElementById("calculatorSection");

const trackerTitleInput = document.getElementById("trackerTitle");
const trackerPeopleCountInput = document.getElementById("trackerPeopleCount");
const generateTrackerBtn = document.getElementById("generateTrackerBtn");
const clearTrackerBtn = document.getElementById("clearTrackerBtn");
const trackerInputs = document.getElementById("trackerInputs");

const peopleCountInput = document.getElementById("peopleCount");
const downloadBtn = document.getElementById("downloadBtn");
const peopleInputs = document.getElementById("peopleInputs");
const calculateBtn = document.getElementById("calculateBtn");
const resultSection = document.getElementById("result");
const warningBox = document.getElementById("warningBox");
const equalSplitBtn = document.getElementById("equalSplitBtn");
const customSplitBtn = document.getElementById("customSplitBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const historyList = document.getElementById("historyList");

const topExpenseHighlight = document.getElementById("topExpenseHighlight");
const topExpenseValue = document.getElementById("topExpenseValue");
const tripTitleHighlight = document.getElementById("tripTitleHighlight");
const tripTitleValue = document.getElementById("tripTitleValue");

const trackerExpenseHero = document.getElementById("trackerExpenseHero");
const liveTrackerTotalValue = document.getElementById("liveTrackerTotalValue");

let splitMode = localStorage.getItem("splitMode") || "equal";
let latestTrackerData = null;
let latestResultData = null;
let latestResultText = "";
let latestSettlementText = "";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "info", duration = 2500) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.35s ease forwards";
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

function getTheme() {
  return localStorage.getItem("theme") || "light";
}

function applyTheme(theme) {
  body.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "Switch to Light" : "Switch to Dark";
  localStorage.setItem("theme", theme);
}

themeToggleBtn.addEventListener("click", () => {
  const nextTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});

function switchTab(tab) {
  if (tab === "tracker") {
    trackerTabBtn.classList.add("active-tab");
    calculatorTabBtn.classList.remove("active-tab");
    trackerSection.classList.add("active-section");
    calculatorSection.classList.remove("active-section");
  } else {
    calculatorTabBtn.classList.add("active-tab");
    trackerTabBtn.classList.remove("active-tab");
    calculatorSection.classList.add("active-section");
    trackerSection.classList.remove("active-section");
  }
}

trackerTabBtn.addEventListener("click", () => switchTab("tracker"));
calculatorTabBtn.addEventListener("click", () => switchTab("calculator"));

function updateSplitModeButtons() {
  if (splitMode === "equal") {
    equalSplitBtn.classList.add("active-mode");
    customSplitBtn.classList.remove("active-mode");
  } else {
    customSplitBtn.classList.add("active-mode");
    equalSplitBtn.classList.remove("active-mode");
  }
}

equalSplitBtn.addEventListener("click", () => {
  splitMode = "equal";
  localStorage.setItem("splitMode", splitMode);
  updateSplitModeButtons();
  toggleCustomShareFields();
});

customSplitBtn.addEventListener("click", () => {
  splitMode = "custom";
  localStorage.setItem("splitMode", splitMode);
  updateSplitModeButtons();
  toggleCustomShareFields();
});

function toggleCustomShareFields() {
  document.querySelectorAll(".custom-share-group").forEach(group => {
    if (splitMode === "custom") {
      group.classList.remove("hidden");
    } else {
      group.classList.add("hidden");
    }
  });
}

function animateCountUp() {
  const amountEls = document.querySelectorAll("[data-amount]");
  amountEls.forEach((el) => {
    const target = parseFloat(el.dataset.amount || "0");
    const duration = 800;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatINR(target * eased);

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatINR(target);
    }

    requestAnimationFrame(step);
  });
}

function renderDefaultResult() {
  resultSection.innerHTML = `
    <div class="result-header no-print">
      <h2>Result</h2>
      <div class="result-actions">
        <button id="copyBtn" class="secondary-btn">Copy Result</button>
        <button id="copySettlementBtn" class="secondary-btn">Copy Settlement Summary</button>
      </div>
    </div>
    <p>Calculation result will appear here.</p>
  `;
}

function updateLiveTrackerTotal() {
  const count = parseInt(trackerPeopleCountInput.value);

  if (!count || trackerInputs.children.length === 0) {
    trackerExpenseHero.classList.add("hidden");
    liveTrackerTotalValue.textContent = formatINR(0);
    latestTrackerData = null;
    return;
  }

  let total = 0;
  const people = [];
  const title = trackerTitleInput.value.trim() || "Untitled Trip";

  for (let i = 1; i <= count; i++) {
    const name = document.getElementById(`tracker-name-${i}`)?.value.trim() || `Person ${i}`;
    const carried = parseFloat(document.getElementById(`carried-${i}`)?.value) || 0;
    const remaining = parseFloat(document.getElementById(`remaining-${i}`)?.value) || 0;
    const expense = Math.max(carried - remaining, 0);

    total += expense;
    people.push({ name, carried, remaining, expense });
  }

  latestTrackerData = {
    title,
    people,
    totalExpense: total
  };

  trackerExpenseHero.classList.remove("hidden");
  liveTrackerTotalValue.textContent = formatINR(total);
}

function generateTrackerInputs(count, data = []) {
  trackerInputs.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const person = data[i - 1] || {};
    const row = document.createElement("div");
    row.className = "person-row";

    row.innerHTML = `
      <h3>Person ${i}</h3>
      <div class="tracker-fields">
        <div class="form-group">
          <label for="tracker-name-${i}">Name</label>
          <input type="text" id="tracker-name-${i}" placeholder="Enter name" value="${escapeHtml(person.name || "")}">
        </div>

        <div class="form-group">
          <label for="carried-${i}">Amount Carried</label>
          <input type="number" id="carried-${i}" min="0" step="0.01" placeholder="Carried" value="${person.carried ?? ""}">
        </div>

        <div class="form-group">
          <label for="remaining-${i}">Amount Remaining</label>
          <input type="number" id="remaining-${i}" min="0" step="0.01" placeholder="Remaining" value="${person.remaining ?? ""}">
        </div>

        <div class="form-group">
          <label>Expense</label>
          <div class="expense-readonly" id="expense-display-${i}">${formatINR(person.expense || 0)}</div>
        </div>
      </div>
    `;

    trackerInputs.appendChild(row);
  }

  attachTrackerAutoCalculation(count);
  updateLiveTrackerTotal();
}

function attachTrackerAutoCalculation(count) {
  for (let i = 1; i <= count; i++) {
    const nameInput = document.getElementById(`tracker-name-${i}`);
    const carriedInput = document.getElementById(`carried-${i}`);
    const remainingInput = document.getElementById(`remaining-${i}`);
    const display = document.getElementById(`expense-display-${i}`);

    const updateExpense = () => {
      const carried = parseFloat(carriedInput.value) || 0;
      const remaining = parseFloat(remainingInput.value) || 0;
      const expense = Math.max(carried - remaining, 0);
      display.textContent = formatINR(expense);
      updateLiveTrackerTotal();
    };

    nameInput.addEventListener("input", updateLiveTrackerTotal);
    carriedInput.addEventListener("input", updateExpense);
    remainingInput.addEventListener("input", updateExpense);
  }
}

generateTrackerBtn.addEventListener("click", () => {
  const count = parseInt(trackerPeopleCountInput.value);

  if (!count || count < 1) {
    showToast("Please enter a valid number of people.", "error");
    return;
  }

  generateTrackerInputs(count);
  showToast("Tracker inputs generated", "success");
});

document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "useInCalculatorBtn") {
    if (!latestTrackerData || latestTrackerData.people.length === 0) {
      showToast("Please enter tracker values first.", "error");
      return;
    }

    for (const person of latestTrackerData.people) {
      if (person.remaining > person.carried) {
        showToast(`Remaining cannot be more than carried for ${person.name}`, "error");
        return;
      }
    }

    peopleCountInput.value = latestTrackerData.people.length;
    generatePersonInputs(
      latestTrackerData.people.length,
      latestTrackerData.people.map(person => ({
        name: person.name,
        paid: person.expense
      }))
    );

    topExpenseHighlight.classList.remove("hidden");
    topExpenseValue.textContent = formatINR(latestTrackerData.totalExpense);

    tripTitleHighlight.classList.remove("hidden");
    tripTitleValue.textContent = latestTrackerData.title;

    switchTab("calculator");
    showToast("Expense data transferred to Split Calculator", "success");
  }

  if (e.target && e.target.id === "copyBtn") {
    if (!latestResultText) {
      showToast("No result to copy.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(latestResultText);
      showToast("Result copied", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  }

  if (e.target && e.target.id === "copySettlementBtn") {
    if (!latestSettlementText) {
      showToast("No settlement summary to copy.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(latestSettlementText);
      showToast("Settlement summary copied", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  }

  if (e.target && e.target.classList.contains("load-history-btn")) {
    const index = Number(e.target.dataset.index);
    const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];
    const item = history[index];
    if (!item) return;

    peopleCountInput.value = item.peopleCount;
    splitMode = item.splitMode || "equal";
    updateSplitModeButtons();

    generatePersonInputs(item.peopleCount, item.people);
    toggleCustomShareFields();

    topExpenseHighlight.classList.remove("hidden");
    topExpenseValue.textContent = formatINR(item.totalPaid);

    if (item.tripTitle) {
      tripTitleHighlight.classList.remove("hidden");
      tripTitleValue.textContent = item.tripTitle;
    } else {
      tripTitleHighlight.classList.add("hidden");
    }

    latestResultData = item;
    latestResultText = buildResultText(item);
    latestSettlementText = buildSettlementText(item);
    renderResult(item);
    switchTab("calculator");
  }

  if (e.target && e.target.classList.contains("delete-history-btn")) {
    const index = Number(e.target.dataset.index);
    const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("expenseHistory", JSON.stringify(history));
    renderHistory();
    showToast("History deleted", "info");
  }
});

function generatePersonInputs(count, data = []) {
  peopleInputs.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const person = data[i - 1] || {};
    const row = document.createElement("div");
    row.className = "person-row";

    row.innerHTML = `
      <h3>Person ${i}</h3>
      <div class="person-fields">
        <div class="form-group">
          <label for="name-${i}">Name</label>
          <input type="text" id="name-${i}" placeholder="Enter name" value="${escapeHtml(person.name || "")}">
        </div>

        <div class="form-group">
          <label for="paid-${i}">Amount Paid</label>
          <input type="number" id="paid-${i}" min="0" step="0.01" placeholder="Paid" value="${person.paid ?? ""}">
        </div>

        <div class="form-group custom-share-group ${splitMode === "equal" ? "hidden" : ""}">
          <label for="share-${i}">Custom Share</label>
          <input type="number" id="share-${i}" min="0" step="0.01" placeholder="Share" value="${person.share ?? ""}">
        </div>
      </div>
    `;

    peopleInputs.appendChild(row);
  }
}

function buildSettlementText(data) {
  if (!data.settlements || data.settlements.length === 0) {
    return "Everyone is already settled.";
  }

  return data.settlements
    .map(item => `${item.from} pays ${item.to} ${formatINR(item.amount)}`)
    .join("\n");
}

function buildResultText(data) {
  return `Expense Splitter Result
Trip: ${data.tripTitle || "-"}
Total: ${formatINR(data.totalPaid)}
Mode: ${data.splitMode}

Balances:
${data.people.map(person => {
  if (person.balance > 0.01) return `${person.name} should receive ${formatINR(person.balance)}`;
  if (person.balance < -0.01) return `${person.name} should pay ${formatINR(Math.abs(person.balance))}`;
  return `${person.name} is settled`;
}).join("\n")}

Settlement Summary:
${buildSettlementText(data)}
`;
}

function renderResult(data) {
  resultSection.innerHTML = `
    <div class="result-header no-print">
      <h2>Result</h2>
      <div class="result-actions">
        <button id="copyBtn" class="secondary-btn">Copy Result</button>
        <button id="copySettlementBtn" class="secondary-btn">Copy Settlement Summary</button>
      </div>
    </div>

    <div class="result-block">
      <div class="summary-grid">
        <div class="summary-pill"><strong>Total Expense:</strong> <span class="amount-animated" data-amount="${data.totalPaid}">${formatINR(0)}</span></div>
        <div class="summary-pill"><strong>${data.splitMode === "custom" ? "Total Share" : "Fair Share / Person"}:</strong> <span class="amount-animated" data-amount="${data.splitMode === "custom" ? data.totalShare : data.perPersonShare}">${formatINR(0)}</span></div>
      </div>
    </div>

    <div class="result-two-column">
      <div class="result-block">
        <h3>Balances</h3>
        <ul>
          ${data.people.map(person => {
            if (person.balance > 0.01) {
              return `<li>🟢 ${escapeHtml(person.name)} should receive <span class="amount-animated" data-amount="${person.balance}">${formatINR(0)}</span></li>`;
            } else if (person.balance < -0.01) {
              return `<li>🔴 ${escapeHtml(person.name)} should pay <span class="amount-animated" data-amount="${Math.abs(person.balance)}">${formatINR(0)}</span></li>`;
            }
            return `<li>✅ ${escapeHtml(person.name)} is settled</li>`;
          }).join("")}
        </ul>
      </div>

      <div class="result-block settlement-card">
        <h3>Settlement Summary</h3>
        ${
          data.settlements.length === 0
            ? "<p>Everyone is already settled.</p>"
            : `<ul class="settlement-list">
                ${data.settlements.map(item => `
                  <li>💸 ${escapeHtml(item.from)} pays ${escapeHtml(item.to)} <span class="amount-animated" data-amount="${item.amount}">${formatINR(0)}</span></li>
                `).join("")}
              </ul>`
        }
      </div>
    </div>
  `;

  animateCountUp();
}

calculateBtn.addEventListener("click", () => {
  const count = parseInt(peopleCountInput.value);

  if (!count || count < 1) {
    showToast("Please enter valid people count.", "error");
    return;
  }

  if (peopleInputs.children.length === 0) {
    showToast("Tracker থেকে data transfer করো first.", "error");
    return;
  }

  const people = [];
  let totalPaid = 0;
  let totalShare = 0;

  for (let i = 1; i <= count; i++) {
    const name = document.getElementById(`name-${i}`).value.trim() || `Person ${i}`;
    const paid = parseFloat(document.getElementById(`paid-${i}`).value);

    if (isNaN(paid) || paid < 0) {
      showToast(`Invalid paid amount for ${name}`, "error");
      return;
    }

    people.push({ name, paid, share: 0, balance: 0 });
    totalPaid += paid;
  }

  const perPersonShare = totalPaid / count;

  if (splitMode === "equal") {
    people.forEach(person => {
      person.share = perPersonShare;
      person.balance = person.paid - person.share;
      totalShare += person.share;
    });
    warningBox.classList.add("hidden");
  } else {
    for (let i = 1; i <= count; i++) {
      const share = parseFloat(document.getElementById(`share-${i}`).value);
      const person = people[i - 1];

      if (isNaN(share) || share < 0) {
        showToast(`Invalid custom share for ${person.name}`, "error");
        return;
      }

      person.share = share;
      person.balance = person.paid - share;
      totalShare += share;
    }

    if (Math.abs(totalShare - totalPaid) > 0.01) {
      warningBox.classList.remove("hidden");
      warningBox.textContent = `Warning: Total custom share (${formatINR(totalShare)}) does not match total expense (${formatINR(totalPaid)}).`;
    } else {
      warningBox.classList.add("hidden");
    }
  }

  const creditors = [];
  const debtors = [];

  people.forEach(person => {
    if (person.balance > 0.01) creditors.push({ name: person.name, amount: person.balance });
    else if (person.balance < -0.01) debtors.push({ name: person.name, amount: Math.abs(person.balance) });
  });

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);

    settlements.push({
      from: debtors[i].name,
      to: creditors[j].name,
      amount
    });

    debtors[i].amount -= amount;
    creditors[j].amount -= amount;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  latestResultData = {
    tripTitle: latestTrackerData?.title || tripTitleValue.textContent || "",
    splitMode,
    totalPaid,
    totalShare,
    peopleCount: count,
    perPersonShare,
    people,
    settlements,
    date: new Date().toLocaleString()
  };

  latestResultText = buildResultText(latestResultData);
  latestSettlementText = buildSettlementText(latestResultData);

  renderResult(latestResultData);
  saveHistory(latestResultData);
  showToast("Split calculated successfully", "success");
});

function saveHistory(data) {
  const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];
  history.unshift(data);
  localStorage.setItem("expenseHistory", JSON.stringify(history.slice(0, 10)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];

  if (history.length === 0) {
    historyList.innerHTML = "<p>No history yet.</p>";
    return;
  }

  historyList.innerHTML = history.map((item, index) => `
    <div class="history-item">
      <div class="history-item-title">${escapeHtml(item.tripTitle || "Untitled Trip")}</div>
      <div class="history-meta">
        Total ${formatINR(item.totalPaid)} | ${item.splitMode} split | ${item.peopleCount} people | ${item.date}
      </div>
      <div class="history-actions">
        <button class="secondary-btn small-btn load-history-btn" data-index="${index}">Load</button>
        <button class="secondary-btn small-btn delete-history-btn" data-index="${index}">Delete</button>
      </div>
    </div>
  `).join("");
}

clearTrackerBtn.addEventListener("click", () => {
  trackerTitleInput.value = "";
  trackerPeopleCountInput.value = "";
  trackerInputs.innerHTML = "";
  latestTrackerData = null;
  trackerExpenseHero.classList.add("hidden");
  liveTrackerTotalValue.textContent = formatINR(0);
  showToast("Tracker cleared", "info");
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("expenseHistory");
  renderHistory();
  showToast("History cleared", "info");
});

downloadBtn.addEventListener("click", () => {
  if (!latestResultText) {
    showToast("No result to download", "error");
    return;
  }

  const blob = new Blob([latestResultText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expense-summary.txt";
  a.click();
  URL.revokeObjectURL(url);
});

printBtn.addEventListener("click", () => {
  window.print();
});

applyTheme(getTheme());
updateSplitModeButtons();
renderDefaultResult();
renderHistory();
