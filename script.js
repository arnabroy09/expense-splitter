console.log("Expense Splitter Loaded");

const body = document.body;
const titleInput = document.getElementById("title");
const generateBtn = document.getElementById("generateBtn");
const calculateBtn = document.getElementById("calculateBtn");
const clearBtn = document.getElementById("clearBtn");
const peopleCountInput = document.getElementById("peopleCount");
const peopleInputs = document.getElementById("peopleInputs");
const resultSection = document.getElementById("result");
const warningBox = document.getElementById("warningBox");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const downloadBtn = document.getElementById("downloadBtn");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const equalSplitBtn = document.getElementById("equalSplitBtn");
const customSplitBtn = document.getElementById("customSplitBtn");
const toastContainer = document.getElementById("toastContainer");
const printBtn = document.getElementById("printBtn");

let latestResultText = "";
let latestResultData = null;
let splitMode = localStorage.getItem("splitMode") || "equal";

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

function showToast(message, type = "info", duration = 2600) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.35s ease forwards";
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

function showWarning(message) {
  warningBox.textContent = message;
  warningBox.classList.remove("hidden");
  showToast(message, "warning", 3200);
}

function hideWarning() {
  warningBox.textContent = "";
  warningBox.classList.add("hidden");
}

function renderDefaultResult() {
  resultSection.innerHTML = `
    <div class="result-header no-print">
      <h2>Result</h2>
      <button id="copyBtn" class="secondary-btn">Copy Result</button>
    </div>
    <p>Calculation result will appear here.</p>
  `;
}

function getCurrentTheme() {
  return localStorage.getItem("theme") || "dark";
}

function applyTheme(theme) {
  body.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "Switch to Light" : "Switch to Dark";
  localStorage.setItem("theme", theme);
}

function updateSplitModeButtons() {
  if (splitMode === "equal") {
    equalSplitBtn.classList.add("active-mode");
    customSplitBtn.classList.remove("active-mode");
  } else {
    customSplitBtn.classList.add("active-mode");
    equalSplitBtn.classList.remove("active-mode");
  }
}

function toggleCustomShareFields() {
  const shareGroups = document.querySelectorAll(".custom-share-group");
  shareGroups.forEach((group) => {
    if (splitMode === "custom") {
      group.classList.remove("hidden-share");
    } else {
      group.classList.add("hidden-share");
    }
  });
}

function animateCountUp() {
  const amountEls = document.querySelectorAll("[data-amount]");
  amountEls.forEach((el) => {
    const target = parseFloat(el.dataset.amount || "0");
    const duration = 900;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = formatINR(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatINR(target);
      }
    }

    requestAnimationFrame(step);
  });
}

function animateBars() {
  const bars = document.querySelectorAll(".bar-fill");
  requestAnimationFrame(() => {
    bars.forEach((bar) => {
      const width = bar.dataset.width || "0";
      bar.style.width = `${width}%`;
      bar.style.setProperty("--print-width", `${width}%`);
    });
  });
}

themeToggleBtn.addEventListener("click", () => {
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme} mode`, "info");
});

equalSplitBtn.addEventListener("click", () => {
  splitMode = "equal";
  localStorage.setItem("splitMode", splitMode);
  updateSplitModeButtons();
  toggleCustomShareFields();
  showToast("Equal split selected", "info");
});

customSplitBtn.addEventListener("click", () => {
  splitMode = "custom";
  localStorage.setItem("splitMode", splitMode);
  updateSplitModeButtons();
  toggleCustomShareFields();
  showToast("Custom split selected", "info");
});

function generatePersonInputs(count, peopleData = []) {
  peopleInputs.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const existing = peopleData[i - 1] || {};
    const row = document.createElement("div");
    row.className = "person-row";

    row.innerHTML = `
      <h3>Person ${i}</h3>
      <div class="person-fields">
        <div class="form-group">
          <label for="name-${i}">Name</label>
          <input type="text" id="name-${i}" placeholder="Enter name" value="${escapeHtml(existing.name || "")}" />
        </div>

        <div class="form-group">
          <label for="paid-${i}">Amount Paid</label>
          <input type="number" id="paid-${i}" min="0" step="0.01" placeholder="Paid" value="${existing.paid ?? ""}" />
        </div>

        <div class="form-group custom-share-group ${splitMode === "equal" ? "hidden-share" : ""}">
          <label for="share-${i}">Custom Share</label>
          <input type="number" id="share-${i}" min="0" step="0.01" placeholder="Share" value="${existing.share ?? ""}" />
        </div>
      </div>
    `;

    peopleInputs.appendChild(row);
  }
}

generateBtn.addEventListener("click", () => {
  hideWarning();

  const peopleCount = parseInt(peopleCountInput.value);

  if (!peopleCount || peopleCount < 1) {
    showToast("Please enter a valid number of people.", "error");
    return;
  }

  generatePersonInputs(peopleCount);
  showToast("Person inputs generated", "success");
});

function saveToHistory(data) {
  const existingHistory = JSON.parse(localStorage.getItem("expenseHistory")) || [];
  existingHistory.unshift(data);
  localStorage.setItem("expenseHistory", JSON.stringify(existingHistory.slice(0, 10)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];

  if (history.length === 0) {
    historyList.innerHTML = `<p>No history yet.</p>`;
    return;
  }

  historyList.innerHTML = history.map((item, index) => `
    <div class="history-item">
      <div class="history-item-title">${escapeHtml(item.title)}</div>
      <div class="history-meta">
        ${item.splitMode === "custom" ? "Custom Split" : "Equal Split"} |
        Total: ${formatINR(item.totalPaid)} |
        People: ${item.peopleCount} |
        ${escapeHtml(item.date)}
      </div>
      <div>
        ${item.settlements.length === 0
          ? "Everyone is already settled."
          : item.settlements.map(s => `${escapeHtml(s.from)} pays ${escapeHtml(s.to)} ${formatINR(s.amount)}`).join("<br>")}
      </div>
      <div class="history-actions">
        <button class="secondary-btn small-btn load-history-btn" data-index="${index}">Load</button>
        <button class="secondary-btn small-btn delete-history-btn" data-index="${index}">Delete</button>
      </div>
    </div>
  `).join("");
}

function buildChartHtml(people) {
  const maxValue = Math.max(
    ...people.flatMap(person => [person.paid, person.share]),
    1
  );

  return `
    <div class="result-block">
      <h3>Visual Breakdown</h3>
      <div class="chart-legend">
        <div><span class="legend-dot paid-dot"></span>Paid</div>
        <div><span class="legend-dot share-dot"></span>Share</div>
      </div>

      <div class="chart-list">
        ${people.map((person) => {
          const paidWidth = (person.paid / maxValue) * 100;
          const shareWidth = (person.share / maxValue) * 100;

          return `
            <div class="chart-row">
              <div class="chart-name">${escapeHtml(person.name)}</div>

              <div class="chart-bars">
                <div class="bar-line">
                  <div class="bar-label">Paid</div>
                  <div class="bar-track">
                    <div class="bar-fill paid" data-width="${paidWidth}"></div>
                  </div>
                  <div class="bar-value">${formatINR(person.paid)}</div>
                </div>

                <div class="bar-line">
                  <div class="bar-label">Share</div>
                  <div class="bar-track">
                    <div class="bar-fill share" data-width="${shareWidth}"></div>
                  </div>
                  <div class="bar-value">${formatINR(person.share)}</div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function buildResultText(data) {
  return `Expense Splitter Result
Title: ${data.title}
Split Mode: ${data.splitMode === "custom" ? "Custom Split" : "Equal Split"}
Total: ${formatINR(data.totalPaid)}

${data.splitMode === "equal"
  ? `Fair Share Per Person: ${formatINR(data.perPersonShare)}`
  : `Custom Shares Total: ${formatINR(data.totalShare)}`}

Balances:
${data.people.map((person) => {
  const shareLine = data.splitMode === "custom"
    ? ` | Share: ${formatINR(person.share)}`
    : "";
  if (person.balance > 0.01) {
    return `${person.name}${shareLine} | should receive ${formatINR(person.balance)}`;
  } else if (person.balance < -0.01) {
    return `${person.name}${shareLine} | should pay ${formatINR(Math.abs(person.balance))}`;
  } else {
    return `${person.name}${shareLine} | is settled`;
  }
}).join("\n")}

Settlement Summary:
${data.settlements.length === 0
  ? "Everyone is already settled."
  : data.settlements.map((item) => `${item.from} pays ${item.to} ${formatINR(item.amount)}`).join("\n")
}`;
}

function renderResult(data) {
  let output = `
    <div class="result-header no-print">
      <h2>Result</h2>
      <button id="copyBtn" class="secondary-btn">Copy Result</button>
    </div>
  `;

  output += `
    <div class="result-block">
      <p><strong>Title:</strong> <span class="highlight">${escapeHtml(data.title)}</span></p>
      <div class="summary-grid">
        <div class="summary-pill"><strong>Mode:</strong> ${data.splitMode === "custom" ? "Custom Split" : "Equal Split"}</div>
        <div class="summary-pill"><strong>Total:</strong> <span class="amount-animated" data-amount="${data.totalPaid}">${formatINR(0)}</span></div>
        <div class="summary-pill">
          <strong>${data.splitMode === "custom" ? "Total Share" : "Fair Share / Person"}:</strong>
          <span class="amount-animated" data-amount="${data.splitMode === "custom" ? data.totalShare : data.perPersonShare}">${formatINR(0)}</span>
        </div>
        <div class="summary-pill"><strong>People:</strong> ${data.peopleCount}</div>
      </div>
    </div>
  `;

  output += `
    <div class="result-block">
      <h3>Balances</h3>
      <ul>
        ${data.people.map((person) => {
          const shareText = data.splitMode === "custom"
            ? ` (Share: <span class="amount-animated" data-amount="${person.share}">${formatINR(0)}</span>)`
            : "";

          if (person.balance > 0.01) {
            return `<li>🟢 ${escapeHtml(person.name)}${shareText} should receive <span class="amount-animated" data-amount="${person.balance}">${formatINR(0)}</span></li>`;
          } else if (person.balance < -0.01) {
            return `<li>🔴 ${escapeHtml(person.name)}${shareText} should pay <span class="amount-animated" data-amount="${Math.abs(person.balance)}">${formatINR(0)}</span></li>`;
          } else {
            return `<li>✅ ${escapeHtml(person.name)}${shareText} is settled</li>`;
          }
        }).join("")}
      </ul>
    </div>
  `;

  output += buildChartHtml(data.people);

  output += `
    <div class="result-block">
      <h3>Settlement Summary</h3>
      ${
        data.settlements.length === 0
          ? `<p>Everyone is already settled.</p>`
          : `<ul>
              ${data.settlements.map((item) => `
                <li>💸 ${escapeHtml(item.from)} pays ${escapeHtml(item.to)} <span class="amount-animated" data-amount="${item.amount}">${formatINR(0)}</span></li>
              `).join("")}
            </ul>`
      }
    </div>
  `;

  resultSection.innerHTML = output;
  animateCountUp();
  animateBars();
}

calculateBtn.addEventListener("click", () => {
  hideWarning();

  const peopleCount = parseInt(peopleCountInput.value);
  const title = titleInput.value.trim() || "Untitled Expense";

  if (!peopleCount || peopleCount < 1) {
    showToast("Please enter a valid number of people.", "error");
    return;
  }

  if (peopleInputs.children.length === 0) {
    showToast("Please generate person inputs first.", "error");
    return;
  }

  const people = [];
  let totalPaid = 0;
  let totalShare = 0;

  for (let i = 1; i <= peopleCount; i++) {
    const nameInput = document.getElementById(`name-${i}`);
    const paidInput = document.getElementById(`paid-${i}`);

    if (!nameInput || !paidInput) {
      showToast("Please generate person inputs first.", "error");
      return;
    }

    const name = nameInput.value.trim() || `Person ${i}`;
    const paidValue = paidInput.value.trim();

    if (paidValue === "") {
      showToast(`Please enter amount paid for ${name}.`, "error");
      return;
    }

    const paid = parseFloat(paidValue);

    if (isNaN(paid) || paid < 0) {
      showToast(`Invalid paid amount for ${name}.`, "error");
      return;
    }

    totalPaid += paid;

    people.push({
      name,
      paid,
      share: 0,
      balance: 0
    });
  }

  const perPersonShare = totalPaid / peopleCount;

  if (splitMode === "equal") {
    people.forEach((person) => {
      person.share = perPersonShare;
      person.balance = person.paid - person.share;
      totalShare += person.share;
    });
  } else {
    totalShare = 0;

    for (let i = 1; i <= peopleCount; i++) {
      const shareInput = document.getElementById(`share-${i}`);
      const person = people[i - 1];

      if (!shareInput || shareInput.value.trim() === "") {
        showToast(`Please enter custom share for ${person.name}.`, "error");
        return;
      }

      const share = parseFloat(shareInput.value);

      if (isNaN(share) || share < 0) {
        showToast(`Invalid custom share for ${person.name}.`, "error");
        return;
      }

      person.share = share;
      person.balance = person.paid - person.share;
      totalShare += share;
    }

    const shareDifference = Math.abs(totalShare - totalPaid);
    if (shareDifference > 0.01) {
      showWarning(`Warning: Total custom share (${formatINR(totalShare)}) does not match total paid (${formatINR(totalPaid)}).`);
    }
  }

  const creditors = [];
  const debtors = [];

  people.forEach((person) => {
    if (person.balance > 0.01) {
      creditors.push({ name: person.name, amount: person.balance });
    } else if (person.balance < -0.01) {
      debtors.push({ name: person.name, amount: Math.abs(person.balance) });
    }
  });

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: settledAmount
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  const resultData = {
    title,
    splitMode,
    totalPaid,
    totalShare,
    peopleCount,
    perPersonShare,
    people,
    settlements,
    date: new Date().toLocaleString()
  };

  latestResultData = resultData;
  latestResultText = buildResultText(resultData);

  renderResult(resultData);
  saveToHistory(resultData);
  showToast("Split calculated successfully", "success");
});

clearBtn.addEventListener("click", () => {
  titleInput.value = "";
  peopleCountInput.value = "";
  peopleInputs.innerHTML = "";
  latestResultText = "";
  latestResultData = null;
  hideWarning();
  renderDefaultResult();
  showToast("All fields cleared", "info");
});

document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "copyBtn") {
    if (!latestResultText) {
      showToast("No result to copy yet.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(latestResultText);
      showToast("Result copied to clipboard!", "success");
    } catch (error) {
      showToast("Copy failed. Please copy manually.", "error");
    }
  }

  if (e.target && e.target.classList.contains("load-history-btn")) {
    const index = Number(e.target.dataset.index);
    const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];
    const item = history[index];
    if (!item) return;

    titleInput.value = item.title;
    peopleCountInput.value = item.peopleCount;
    splitMode = item.splitMode || "equal";
    localStorage.setItem("splitMode", splitMode);
    updateSplitModeButtons();

    generatePersonInputs(item.peopleCount, item.people);
    toggleCustomShareFields();

    latestResultData = item;
    latestResultText = buildResultText(item);
    renderResult(item);
    hideWarning();
    showToast("History loaded", "success");
  }

  if (e.target && e.target.classList.contains("delete-history-btn")) {
    const index = Number(e.target.dataset.index);
    const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("expenseHistory", JSON.stringify(history));
    renderHistory();
    showToast("History item deleted", "info");
  }
});

downloadBtn.addEventListener("click", () => {
  if (!latestResultText) {
    showToast("No result to download yet.", "error");
    return;
  }

  const blob = new Blob([latestResultText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeTitle = (latestResultData?.title || "expense-summary")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();

  link.href = url;
  link.download = `${safeTitle}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Summary downloaded", "success");
});

clearHistoryBtn.addEventListener("click", () => {
  const history = JSON.parse(localStorage.getItem("expenseHistory")) || [];
  if (history.length === 0) {
    showToast("History is already empty.", "info");
    return;
  }

  localStorage.removeItem("expenseHistory");
  renderHistory();
  showToast("All history cleared", "success");
});

printBtn.addEventListener("click", () => {
  if (!latestResultText) {
    showToast("Please calculate a result before printing.", "error");
    return;
  }

  window.print();
});

applyTheme(getCurrentTheme());
updateSplitModeButtons();
renderDefaultResult();
renderHistory();