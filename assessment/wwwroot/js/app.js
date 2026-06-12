const API = "/api/objects";

const panels = {
  lookup: {
    title: "Lookup Object",
    subtitle: "Fetch an object from restful-api.dev by ID",
  },
  create: {
    title: "Create Object",
    subtitle: "Post a new object with name and price",
  },
  catalog: {
    title: "Local Catalog",
    subtitle: "Objects cached in the local SQLite database",
  },
};

// Navigation
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = btn.dataset.panel;
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`panel-${panel}`).classList.add("active");
    document.getElementById("pageTitle").textContent = panels[panel].title;
    document.getElementById("pageSubtitle").textContent = panels[panel].subtitle;
    if (panel === "catalog") loadCatalog();
  });
});

// Toast
function toast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// API status
async function checkStatus() {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error();
    dot.className = "status-dot online";
    text.textContent = "API online";
  } catch {
    dot.className = "status-dot offline";
    text.textContent = "API offline";
  }
}

// Lookup
document.getElementById("lookupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("lookupId").value.trim();
  const resultCard = document.getElementById("lookupResult");
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`);
    if (!res.ok) {
      resultCard.classList.add("hidden");
      toast(res.status === 404 ? `Object "${id}" not found` : `Request failed (${res.status})`, "error");
      return;
    }

    const data = await res.json();
    resultCard.classList.remove("hidden");
    document.getElementById("lookupBadge").textContent = `ID ${data.id}`;
    document.getElementById("lookupJson").textContent = JSON.stringify(data, null, 2);

    const details = document.getElementById("lookupDetails");
    details.innerHTML = `
      <div class="detail-item"><label>Name</label><span>${escapeHtml(data.name)}</span></div>
      <div class="detail-item"><label>Price</label><span>${formatPrice(data.data?.price)}</span></div>
      <div class="detail-item"><label>Year</label><span>${data.data?.year ?? "—"}</span></div>
      <div class="detail-item"><label>CPU</label><span>${escapeHtml(data.data?.["CPU model"] ?? "—")}</span></div>
      <div class="detail-item"><label>Storage</label><span>${escapeHtml(data.data?.["Hard disk size"] ?? "—")}</span></div>
    `;
    toast("Object fetched successfully", "success");
  } catch {
    toast("Could not reach the API", "error");
  } finally {
    btn.disabled = false;
  }
});

// Create
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("createName").value.trim();
  const price = parseFloat(document.getElementById("createPrice").value);
  const resultCard = document.getElementById("createResult");
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    if (!res.ok) {
      resultCard.classList.add("hidden");
      toast("Failed to create object. Check name and price.", "error");
      return;
    }

    const data = await res.json();
    resultCard.classList.remove("hidden");
    document.getElementById("createJson").textContent = JSON.stringify(data, null, 2);
    toast(`Created "${data.name}"`, "success");
    e.target.reset();
  } catch {
    toast("Could not reach the API", "error");
  } finally {
    btn.disabled = false;
  }
});

// Catalog
async function loadCatalog() {
  const tbody = document.getElementById("catalogBody");
  tbody.innerHTML = `<tr><td colspan="5" class="empty">Loading…</td></tr>`;

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error();
    const objects = await res.json();

    if (objects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty">No objects cached yet. Lookup or create one first.</td></tr>`;
      return;
    }

    tbody.innerHTML = objects
      .map(
        (o) => `
      <tr>
        <td><code>${escapeHtml(o.id)}</code></td>
        <td>${escapeHtml(o.name)}</td>
        <td>${formatPrice(o.price)}</td>
        <td>${formatDate(o.createdAt)}</td>
        <td><button class="btn-link" data-id="${escapeHtml(o.id)}">View</button></td>
      </tr>`
      )
      .join("");

    tbody.querySelectorAll(".btn-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector('[data-panel="lookup"]').click();
        document.getElementById("lookupId").value = btn.dataset.id;
        document.getElementById("lookupForm").requestSubmit();
      });
    });
  } catch {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">Failed to load catalog</td></tr>`;
    toast("Could not load catalog", "error");
  }
}

document.getElementById("refreshCatalog").addEventListener("click", loadCatalog);

// Helpers
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPrice(value) {
  if (value == null || value === "") return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

checkStatus();
