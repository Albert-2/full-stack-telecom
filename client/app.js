
// ── AUTHENTICATION ───────────────────────────────────────────────────────────
const STORAGE_KEY = "nexgen5g_user";
 
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%-]+@(?=.*[a-zA-Z])[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
 
function validatePassword(password) {
  return password.length >= 7 && password.length <= 14;
}
 
function authenticateUser(email, password, isSignup) {
  email = email.trim().toLowerCase();
  if (!validateEmail(email)) {
    showAuthError("Please enter a valid email address (e.g., user@example.com)");
    highlightField("authEmail");
    return false;
  }
  if (!validatePassword(password)) {
    showAuthError("Password must be 7-14 characters long.");
    return false;
  }
  const users = JSON.parse(localStorage.getItem("nexgen5g_users") || "{}");
  if (isSignup) {
    if (users[email]) { showAuthError("This email is already registered. Please sign in instead."); return false; }
    users[email] = { email, password, createdAt: new Date().toISOString() };
    localStorage.setItem("nexgen5g_users", JSON.stringify(users));
    showAuthSuccess("Account created successfully! Signing you in...");
    setTimeout(() => setCurrentUser(email, false), 1000);
    return true;
  } else {
    if (!users[email]) { showAuthError("Email not found. Please sign up first."); return false; }
    if (users[email].password !== password) { showAuthError("Incorrect password. Please try again."); return false; }
    setCurrentUser(email, false);
    return true;
  }
}
 
function setCurrentUser(email, isGuest = false) {
  const user = { email, isGuest, isAuthenticated: true, loginTime: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  state.user = user;
  hideAuthModal();
  updateUserDisplay();
  startSimulation();
}
 
function guestMode() {
  const user = { email: "guest@example.com", isGuest: true, isAuthenticated: true, loginTime: new Date().toISOString() };
  state.user = user;
  hideAuthModal();
  updateUserDisplay();
  showToast("👤 Welcome, Guest User!", "toast-5g");
  startSimulation();
}
 
function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}
 
function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  state.user = { email: null, isGuest: false, isAuthenticated: false };
  stopSimulation();
  stopLiveMetrics();
  state.used4g = 0; state.used5g = 0; state.events = []; state.alerts = [];
  state.alertCount = 0; state.lastNetwork = null; state.currentNetwork = null; state.warned75 = false;
  state.trafficHistory = { labels: [], fiveG: [], fourG: [] };
  $("eventFeed").innerHTML = '<div class="feed-empty">Waiting for network events...</div>';
  $("alertList").innerHTML = '<div class="feed-empty">No alerts yet.</div>';
  $("alertBadge").textContent = "0";
  renderStats();
  updateSignalPill("--");
  showLandingPage();
  hideAuthModal();
  clearAuthForm();
}
 
let simulationInterval = null;
 
function startSimulation() {
  if (simulationInterval) return;
  initGeolocation();
  startLiveMetrics();
  initTrafficChart();
  renderTowerStatus();
  setTimeout(() => {
    simulateEvent();
    simulationInterval = setInterval(simulateEvent, SIMULATE_INTERVAL_MS);
  }, 1500);
}
 
function stopSimulation() {
  if (simulationInterval) { clearInterval(simulationInterval); simulationInterval = null; }
}
 
function showAuthModal() { $("authModal").classList.remove("hidden"); }
function hideAuthModal() { $("authModal").classList.add("hidden"); }
 
function clearAuthForm() {
  $("authForm").reset();
  $("authEmail").classList.remove("error");
  $("authPassword").classList.remove("error");
  $("emailError").textContent = "";
  $("passwordError").textContent = "";
  $("authError").textContent = "";
  $("authSuccess").textContent = "";
  $("authTitle").textContent = "Sign In";
  $("toggleText").textContent = "Don't have an account?";
  $("authSubmitBtn").textContent = "Sign In";
}
 
function showAuthError(msg) { $("authError").textContent = msg; $("authError").style.display = "block"; $("authSuccess").textContent = ""; }
function showAuthSuccess(msg) { $("authSuccess").textContent = msg; $("authSuccess").style.display = "block"; $("authError").textContent = ""; }
 
function highlightField(fieldId) {
  const field = $(fieldId);
  if (field) { field.classList.add("error"); setTimeout(() => field.classList.remove("error"), 3000); }
}
 
function updateUserDisplay() {
  const user = state.user;
  if (user && user.isAuthenticated) {
    const displayName = user.isGuest ? "Guest User" : user.email;
    const status = user.isGuest ? "👤 Guest Access" : "✓ Logged In";
    $("userName").textContent = displayName;
    $("userStatus").textContent = status;
  }
}
 
function showLandingPage() {
  if ($("landingPage")) $("landingPage").classList.remove("hidden");
  if ($("appContainer")) $("appContainer").classList.add("hidden");
}
 
function hideLandingPage() {
  if ($("landingPage")) $("landingPage").classList.add("hidden");
  if ($("appContainer")) $("appContainer").classList.remove("hidden");
}
 
// ── CONFIG ───────────────────────────────────────────────────────────────────
const DAILY_QUOTA_MB = 1500;
const SIMULATE_INTERVAL_MS = 8000;
const APPS = ["YouTube", "Netflix", "Instagram", "WhatsApp", "Chrome", "Hotstar", "Spotify"];
 
// ── TOWER DATA ───────────────────────────────────────────────────────────────
const TOWERS = [
  { id: "T-001", name: "Alpha Tower", sector: "North", type: "5G NR", band: "n78 (3.5GHz)", maxSpeed: "1.8 Gbps", users: 0, load: 0, status: "online", lat: 0, lng: 0 },
  { id: "T-002", name: "Beta Tower",  sector: "East",  type: "5G NR", band: "n41 (2.5GHz)", maxSpeed: "1.2 Gbps", users: 0, load: 0, status: "online", lat: 0, lng: 0 },
  { id: "T-003", name: "Gamma Node",  sector: "South", type: "LTE-A",  band: "B3 (1.8GHz)", maxSpeed: "150 Mbps", users: 0, load: 0, status: "online", lat: 0, lng: 0 },
  { id: "T-004", name: "Delta Node",  sector: "West",  type: "LTE",    band: "B40 (2.3GHz)", maxSpeed: "100 Mbps", users: 0, load: 0, status: "maintenance", lat: 0, lng: 0 },
  { id: "T-005", name: "Epsilon Hub", sector: "Central", type: "5G NR", band: "n1 (2.1GHz)", maxSpeed: "2.1 Gbps", users: 0, load: 0, status: "online", lat: 0, lng: 0 },
];
 
// ── STATE ────────────────────────────────────────────────────────────────────
let state = {
  currentNetwork: null, used4g: 0, used5g: 0,
  events: [], alerts: [], alertCount: 0,
  userLat: null, userLng: null, map: null, userMarker: null,
  simulatedZoneMarkers: [], lastNetwork: null, warned75: false,
  user: { email: null, isGuest: false, isAuthenticated: false },
  trafficHistory: { labels: [], fiveG: [], fourG: [] },
  liveMetrics: { dl: 0, ul: 0, latency: 0 },
  trafficChart: null,
  liveMetricsInterval: null,
  activeTower: null,
  towerMarkers: [],
};
 
const $ = (id) => document.getElementById(id);
 
// ── CLOCK ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString("en-IN", { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();
 
// ── AUDIO ────────────────────────────────────────────────────────────────────
let audioContext = null;
function initAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}
function playNotificationSound() {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(1000, now); gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } catch(e) {}
}
 
// ── NAVIGATION ───────────────────────────────────────────────────────────────
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const sec = item.dataset.section;
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
    $("sec-" + sec).classList.add("active");
    $("pageTitle").textContent = item.querySelector("span").textContent.trim();
    if (sec === "map" && !state.map) initMap();
    if (window.innerWidth <= 768) $("sidebar").classList.remove("open");
  });
});
 
$("menuToggle").addEventListener("click", () => {
  const sidebar = $("sidebar");
  const isOpen = sidebar.classList.toggle("open");
  if (window.innerWidth > 768) document.body.classList.toggle("sidebar-collapsed", !isOpen);
});
 
// ── TOAST ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 4000);
}
 
// ── ALERTS ───────────────────────────────────────────────────────────────────
function pushAlert(msg, type = "a-4g", icon = "fa-exclamation-triangle") {
  const list = $("alertList");
  const empty = list.querySelector(".feed-empty");
  if (empty) empty.remove();
  state.alertCount++;
  $("alertBadge").textContent = state.alertCount;
  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const div = document.createElement("div");
  div.className = `alert-item ${type}`;
  div.innerHTML = `<i class="fas ${icon} alert-icon"></i><span class="alert-msg">${msg}</span><span class="alert-time">${time}</span>`;
  list.prepend(div);
  state.alerts.unshift({ msg, type, time });
  return div;
}
$("clearAlerts").addEventListener("click", () => {
  $("alertList").innerHTML = '<div class="feed-empty">No alerts yet.</div>';
  state.alertCount = 0; state.alerts = [];
  $("alertBadge").textContent = "0";
});
 
// ── STATS ────────────────────────────────────────────────────────────────────
function renderStats() {
  const used4g = Math.min(state.used4g, DAILY_QUOTA_MB);
  const quotaRemaining = DAILY_QUOTA_MB - used4g;
  const percentage = ((used4g / DAILY_QUOTA_MB) * 100).toFixed(1);
  $("total5g").textContent = formatMB(state.used5g);
  $("total4g").textContent = formatMB(used4g);
  $("quotaLeft").textContent = formatMB(quotaRemaining);
  $("quotaPercent").textContent = percentage + "%";
  const fill = $("quotaFill");
  fill.style.width = percentage + "%";
  fill.classList.toggle("danger", percentage >= 70);
  const events = state.events;
  $("sumEvents").textContent = events.length;
  $("sum5gEvents").textContent = events.filter((e) => e.net === "5G").length;
  $("sum4gEvents").textContent = events.filter((e) => e.net === "4G").length;
  $("sumFallbacks").textContent = state.alerts.filter((a) => a.type === "a-4g").length;
}
 
function formatMB(mb) {
  return mb >= 1000 ? (mb / 1000).toFixed(2) + " GB" : mb.toFixed(1) + " MB";
}
 
function updateSignalPill(net) {
  const dot = $("pulseDot"); const label = $("signalLabel"); const pill = $("signalPill");
  $("currentNetwork").textContent = net === "--" ? "--" : net;
  if (net === "5G") {
    dot.className = "pulse-dot on5g"; label.textContent = "5G Active";
    pill.style.borderColor = "rgba(0,255,153,0.4)"; label.style.color = "var(--accent-green)";
  } else if (net === "4G") {
    dot.className = "pulse-dot on4g"; label.textContent = "4G Fallback";
    pill.style.borderColor = "rgba(255,140,0,0.4)"; label.style.color = "var(--accent-orange)";
  } else {
    dot.className = "pulse-dot"; label.textContent = "Detecting...";
    pill.style.borderColor = ""; label.style.color = "";
  }
}
 
// ── FEED ─────────────────────────────────────────────────────────────────────
function addFeedItem(ev) {
  const feed = $("eventFeed");
  const empty = feed.querySelector(".feed-empty");
  if (empty) empty.remove();
  const div = document.createElement("div");
  div.className = `feed-item ${ev.net === "5G" ? "f5g" : "f4g"}`;
  div.innerHTML = `
    <span class="feed-tag ${ev.net === "5G" ? "tag-5g" : "tag-4g"}">${ev.net}</span>
    <span class="feed-app">${ev.app}</span>
    <span class="feed-data">${ev.data.toFixed(1)} MB</span>
    <span class="feed-loc"><i class="fas fa-map-pin"></i> ${ev.loc}</span>
    <span class="feed-time">${ev.time}</span>`;
  feed.prepend(div);
  while (feed.children.length > 30) feed.removeChild(feed.lastChild);
}
 
function refreshTable() {
  const tbody = $("usageTbody");
  const recent = state.events.slice(-10).reverse();
  if (recent.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No history yet.</td></tr>'; return; }
  tbody.innerHTML = recent.map((ev, i) => `
    <tr>
      <td>${i + 1}</td><td>${ev.time}</td>
      <td><span class="chip ${ev.net === "5G" ? "chip-5g" : "chip-4g"}">${ev.net}</span></td>
      <td>${ev.app}</td><td>${ev.data.toFixed(1)}</td><td>${ev.loc}</td>
      <td><span class="chip ${ev.net === "5G" ? "chip-ok" : "chip-warn"}">${ev.net === "5G" ? "Free" : "Quota"}</span></td>
    </tr>`).join("");
}
 
// ── SIMULATE ─────────────────────────────────────────────────────────────────
function simulateEvent() {
  const net = Math.random() < 0.6 ? "5G" : "4G";
  const app = APPS[Math.floor(Math.random() * APPS.length)];
  const data = +(Math.random() * 20 + 20).toFixed(1);
  let lat = state.userLat, lng = state.userLng;
  if (lat && lng) { const j = 0.0002; lat += (Math.random() - 0.5) * j; lng += (Math.random() - 0.5) * j; }
  const loc = lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Unknown";
  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const ev = { net, app, data, lat, lng, loc, time };
  state.events.push(ev);
 
  if (net === "5G") { state.used5g += data; }
  else {
    const remaining = DAILY_QUOTA_MB - state.used4g;
    if (remaining > 0) {
      state.used4g += Math.min(data, remaining);
      if (data > remaining) pushAlert(`⚠️ 4G quota exhausted. Extra ${(data - remaining).toFixed(1)} MB ignored.`, "a-warn", "fa-ban");
    }
  }
 
  if (state.lastNetwork === "5G" && net === "4G") {
    playNotificationSound();
    showToast(`⚠️ Fallback! Switched to 4G at ${loc} — ${app} now using quota.`, "toast-4g");
    const ai = pushAlert(`Fallback to 4G detected at <strong>${loc}</strong> while using <strong>${app}</strong>. ${data.toFixed(1)} MB deducted from quota.`, "a-4g", "fa-exclamation-triangle");
    if (ai) ai.classList.add("ring-effect");
  } else if (state.lastNetwork === "4G" && net === "5G") {
    showToast(`✅ Back on 5G at ${loc}! Data is now unlimited.`, "toast-5g");
    pushAlert(`Restored to 5G at <strong>${loc}</strong>. Enjoy unlimited data!`, "a-5g", "fa-check-circle");
  }
 
  const pct = (state.used4g / DAILY_QUOTA_MB) * 100;
  if (pct >= 90 && state.lastNetwork !== "4G_WARN90") {
    showToast("🚨 90% of your 4G quota used!", "toast-warn");
    pushAlert("You have used <strong>90%</strong> of your daily 4G quota. Consider switching to Wi-Fi.", "a-warn", "fa-radiation");
    state.lastNetwork = "4G_WARN90";
  } else if (pct >= 75 && !state.warned75) {
    showToast("⚠️ 75% of your 4G quota used!", "toast-warn");
    pushAlert("You have used <strong>75%</strong> of your daily 4G quota.", "a-warn", "fa-exclamation-circle");
    state.warned75 = true;
  }
 
  state.lastNetwork = net; state.currentNetwork = net;
  updateSignalPill(net);
  addFeedItem(ev);
  refreshTable();
  renderStats();
  updateUserMapMarker(net);
  updateTrafficHistory(net, data);
  updateTowerLoad(net);
}
 
// ═══════════════════════════════════════════════════════════════════════════
// ── NEW FEATURE 1: LIVE SPEED & LATENCY ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function startLiveMetrics() {
  stopLiveMetrics();
  updateLiveMetrics();
  state.liveMetricsInterval = setInterval(updateLiveMetrics, 2000);
}
 
function stopLiveMetrics() {
  if (state.liveMetricsInterval) { clearInterval(state.liveMetricsInterval); state.liveMetricsInterval = null; }
}
 
function updateLiveMetrics() {
  const is5G = state.currentNetwork === "5G";
  const dl = is5G ? (600 + Math.random() * 1200) : (30 + Math.random() * 120);
  const ul = is5G ? (80 + Math.random() * 200) : (10 + Math.random() * 40);
  const latency = is5G ? (3 + Math.random() * 12) : (25 + Math.random() * 60);
  state.liveMetrics = { dl, ul, latency };
 
  const dlEl = $("liveDownload"); const ulEl = $("liveUpload"); const latEl = $("liveLatency"); const qualEl = $("liveQuality");
  if (!dlEl) return;
 
  dlEl.textContent = dl >= 1000 ? (dl / 1000).toFixed(2) + " Gbps" : Math.round(dl) + " Mbps";
  ulEl.textContent = Math.round(ul) + " Mbps";
  latEl.textContent = Math.round(latency) + " ms";
 
  // Signal quality bars
  const sigBars = $("signalBars");
  if (sigBars) {
    const quality = is5G ? (latency < 10 ? 5 : latency < 20 ? 4 : 3) : (latency < 40 ? 3 : latency < 60 ? 2 : 1);
    sigBars.innerHTML = Array.from({ length: 5 }, (_, i) => {
      const active = i < quality;
      const color = quality >= 4 ? "var(--accent-green)" : quality >= 3 ? "var(--accent-orange)" : "var(--accent-red)";
      return `<div style="width:6px;border-radius:2px;background:${active ? color : "var(--border)"};height:${(i + 1) * 5 + 5}px;transition:all 0.4s"></div>`;
    }).join("");
  }
 
  if (qualEl) {
    const label = latency < 10 ? "Excellent" : latency < 25 ? "Good" : latency < 50 ? "Fair" : "Poor";
    const color = latency < 10 ? "var(--accent-green)" : latency < 25 ? "var(--accent-blue)" : latency < 50 ? "var(--accent-orange)" : "var(--accent-red)";
    qualEl.textContent = label;
    qualEl.style.color = color;
  }
}
 
// ═══════════════════════════════════════════════════════════════════════════
// ── NEW FEATURE 2: 24H TRAFFIC CHART ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function initTrafficChart() {
  const canvas = $("trafficChart");
  if (!canvas || !window.Chart) return;
 
  // Pre-populate last 24 hours with realistic simulated data
  const now = new Date();
  const labels = [];
  const fiveGData = [];
  const fourGData = [];
 
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    labels.push(d.getHours().toString().padStart(2, "0") + ":00");
    const hr = d.getHours();
    const base = hr < 6 ? 10 : hr < 9 ? 55 : hr < 12 ? 85 : hr < 14 ? 70 : hr < 18 ? 88 : hr < 22 ? 75 : 25;
    fiveGData.push(+(base + Math.random() * 20).toFixed(1));
    fourGData.push(+(base * 0.35 + Math.random() * 15).toFixed(1));
  }
 
  state.trafficHistory = { labels, fiveG: fiveGData, fourG: fourGData };
 
  if (state.trafficChart) { state.trafficChart.destroy(); state.trafficChart = null; }
 
  state.trafficChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "5G Traffic (MB/min)",
          data: fiveGData,
          borderColor: "#107c10",
          backgroundColor: "rgba(16,124,16,0.08)",
          borderWidth: 2, fill: true, tension: 0.4, pointRadius: 2,
          pointBackgroundColor: "#107c10",
        },
        {
          label: "4G Traffic (MB/min)",
          data: fourGData,
          borderColor: "#ff8c00",
          backgroundColor: "rgba(255,140,0,0.07)",
          borderWidth: 2, fill: true, tension: 0.4, pointRadius: 2,
          pointBackgroundColor: "#ff8c00",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#677382", font: { size: 11, family: "Inter" },
            boxWidth: 12, boxHeight: 12, usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "#f8fafb",
          titleColor: "#1a1a1a", bodyColor: "#677382",
          borderColor: "rgba(0,102,204,0.2)", borderWidth: 1,
          titleFont: { family: "Orbitron", size: 11 },
          bodyFont: { family: "Inter", size: 11 },
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} MB`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#677382", font: { size: 10, family: "Inter" }, maxTicksLimit: 12, maxRotation: 0 },
          grid: { color: "rgba(0,102,204,0.06)" },
          border: { color: "rgba(0,102,204,0.1)" },
        },
        y: {
          ticks: { color: "#677382", font: { size: 10, family: "Inter" }, callback: (v) => v + " MB" },
          grid: { color: "rgba(0,102,204,0.06)" },
          border: { color: "rgba(0,102,204,0.1)" },
          beginAtZero: true,
        },
      },
    },
  });
}
 
function updateTrafficHistory(net, dataMB) {
  if (!state.trafficChart) return;
  const now = new Date();
  const label = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const lastLabel = state.trafficHistory.labels[state.trafficHistory.labels.length - 1];
 
  // Update the last data point for current hour or add new minute entry
  if (lastLabel && lastLabel.startsWith(now.getHours().toString().padStart(2, "0"))) {
    const idx = state.trafficHistory.labels.length - 1;
    if (net === "5G") state.trafficHistory.fiveG[idx] = +(state.trafficHistory.fiveG[idx] + dataMB * 0.1).toFixed(1);
    else state.trafficHistory.fourG[idx] = +(state.trafficHistory.fourG[idx] + dataMB * 0.1).toFixed(1);
  } else {
    state.trafficHistory.labels.push(label);
    state.trafficHistory.fiveG.push(net === "5G" ? +(dataMB * 0.1).toFixed(1) : 0);
    state.trafficHistory.fourG.push(net === "4G" ? +(dataMB * 0.1).toFixed(1) : 0);
    if (state.trafficHistory.labels.length > 48) {
      state.trafficHistory.labels.shift();
      state.trafficHistory.fiveG.shift();
      state.trafficHistory.fourG.shift();
    }
  }
 
  state.trafficChart.data.labels = state.trafficHistory.labels;
  state.trafficChart.data.datasets[0].data = state.trafficHistory.fiveG;
  state.trafficChart.data.datasets[1].data = state.trafficHistory.fourG;
  state.trafficChart.update("none");
}
 
// ═══════════════════════════════════════════════════════════════════════════
// ── NEW FEATURE 3: TOWER STATUS LIST ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function renderTowerStatus() {
  const container = $("towerStatusList");
  if (!container) return;
 
  // Randomise initial tower state
  TOWERS.forEach(t => {
    if (t.status === "online") {
      t.users = Math.floor(Math.random() * 150 + 20);
      t.load = Math.floor(Math.random() * 70 + 15);
    }
  });
 
  container.innerHTML = TOWERS.map(tower => buildTowerRow(tower)).join("");
 
  // Attach click listeners
  container.querySelectorAll(".tower-row-item").forEach(row => {
    row.addEventListener("click", () => {
      const id = row.dataset.towerId;
      const tower = TOWERS.find(t => t.id === id);
      if (tower) showTowerDetail(tower, row);
    });
  });
}
 
function buildTowerRow(tower) {
  const is5G = tower.type.includes("5G");
  const isOnline = tower.status === "online";
  const loadColor = tower.load > 80 ? "var(--accent-red)" : tower.load > 55 ? "var(--accent-orange)" : "var(--accent-green)";
  const statusColor = isOnline ? "var(--accent-green)" : "var(--accent-orange)";
  const chipClass = is5G ? "chip-5g" : "chip-4g";
  const bars = Array.from({ length: 5 }, (_, i) => {
    const threshold = Math.round((tower.load / 100) * 5);
    const on = isOnline && i < threshold;
    return `<div style="width:5px;border-radius:2px;background:${on ? loadColor : "var(--border)"};height:${(i + 1) * 4 + 4}px;display:inline-block;margin-right:1px;vertical-align:bottom;transition:all 0.5s"></div>`;
  }).join("");
 
  return `
    <div class="tower-row-item" data-tower-id="${tower.id}" style="
      display:flex;align-items:center;gap:12px;padding:11px 14px;
      background:var(--bg-card2);border-radius:10px;border:1px solid var(--border);
      cursor:pointer;transition:all 0.25s;margin-bottom:8px;position:relative;
    " onmouseenter="this.style.borderColor='rgba(0,102,204,0.35)';this.style.transform='translateX(3px)'"
       onmouseleave="this.style.borderColor='var(--border)';this.style.transform='translateX(0)'">
      <div style="width:8px;height:8px;border-radius:50%;background:${statusColor};box-shadow:0 0 6px ${statusColor};flex-shrink:0"></div>
      <span class="chip ${chipClass}" style="font-size:10px;padding:2px 7px">${tower.type}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tower.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${tower.sector} · ${tower.band}</div>
      </div>
      <div style="display:flex;align-items:flex-end;gap:1px;height:24px">${bars}</div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:12px;font-weight:600;color:${loadColor}">${isOnline ? tower.load + "%" : "–"}</div>
        <div style="font-size:10px;color:var(--text-muted)">${isOnline ? tower.users + " users" : tower.status}</div>
      </div>
      <div style="font-size:10px;color:var(--accent-blue);font-weight:500;flex-shrink:0">›</div>
    </div>`;
}
 
// ── TOWER DETAIL PANEL ────────────────────────────────────────────────────────
function showTowerDetail(tower, rowEl) {
  // Close existing if same tower
  const existing = $("towerDetailPanel");
  if (existing && existing.dataset.towerId === tower.id) {
    existing.remove(); return;
  }
  if (existing) existing.remove();
 
  const is5G = tower.type.includes("5G");
  const isOnline = tower.status === "online";
  const loadColor = tower.load > 80 ? "var(--accent-red)" : tower.load > 55 ? "var(--accent-orange)" : "var(--accent-green)";
  const statusLabel = isOnline ? "Online" : "Maintenance";
  const statusColor = isOnline ? "var(--accent-green)" : "var(--accent-orange)";
 
  const panel = document.createElement("div");
  panel.id = "towerDetailPanel";
  panel.dataset.towerId = tower.id;
  panel.style.cssText = `
    margin:0 0 8px 0;background:var(--bg-card);border:1px solid rgba(0,102,204,0.25);
    border-radius:12px;padding:16px 18px;animation:slideIn 0.25s ease;
    border-left:3px solid ${is5G ? "var(--accent-green)" : "var(--accent-orange)"};
  `;
 
  const uptime = isOnline ? (97 + Math.random() * 2.9).toFixed(2) : "N/A";
  const ping = is5G ? (2 + Math.random() * 8).toFixed(1) : (20 + Math.random() * 40).toFixed(1);
  const tempC = (38 + Math.random() * 20).toFixed(1);
  const txPow = is5G ? (38 + Math.random() * 4).toFixed(1) : (33 + Math.random() * 4).toFixed(1);
 
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:13px;font-weight:700;color:var(--accent-blue);font-family:'Orbitron',sans-serif;letter-spacing:0.5px">${tower.name} — ${tower.id}</div>
      <button onclick="document.getElementById('towerDetailPanel').remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:2px 6px;border-radius:6px" onmouseenter="this.style.color='var(--accent-red)'" onmouseleave="this.style.color='var(--text-muted)'">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
      ${detailStat("Status", statusLabel, statusColor)}
      ${detailStat("Technology", tower.type, is5G ? "var(--accent-green)" : "var(--accent-orange)")}
      ${detailStat("Band", tower.band, "var(--accent-blue)")}
      ${detailStat("Peak Speed", tower.maxSpeed, "var(--accent-blue)")}
      ${detailStat("Active Users", isOnline ? tower.users : "–", loadColor)}
      ${detailStat("Load", isOnline ? tower.load + "%" : "–", loadColor)}
    </div>
    <div style="background:var(--bg-card2);border-radius:8px;padding:12px;margin-bottom:10px">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Live Diagnostics</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:12px">
        ${diagStat("Uptime", uptime + "%")}
        ${diagStat("Ping", ping + " ms")}
        ${diagStat("Temp", tempC + "°C")}
        ${diagStat("TX Power", txPow + " dBm")}
      </div>
    </div>
    <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px">
      <i class="fas fa-map-pin" style="color:var(--accent-blue)"></i>
      Sector: ${tower.sector} &nbsp;·&nbsp; Click tower again to collapse
    </div>
  `;
 
  rowEl.insertAdjacentElement("afterend", panel);
 
  // Highlight on map if map is open
  if (state.map && tower.lat && tower.lng) {
    state.map.setView([tower.lat, tower.lng], 14);
  }
}
 
function detailStat(label, value, color) {
  return `<div style="background:var(--bg-card2);border-radius:8px;padding:10px;text-align:center">
    <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">${label}</div>
    <div style="font-size:13px;font-weight:700;color:${color}">${value}</div>
  </div>`;
}
 
function diagStat(label, value) {
  return `<div style="text-align:center">
    <div style="color:var(--text-muted);font-size:10px;margin-bottom:2px">${label}</div>
    <div style="color:var(--text-primary);font-weight:600">${value}</div>
  </div>`;
}
 
function updateTowerLoad(net) {
  TOWERS.forEach(t => {
    if (t.status !== "online") return;
    const is5G = t.type.includes("5G");
    const relevant = (is5G && net === "5G") || (!is5G && net === "4G");
    if (relevant) {
      t.users = Math.max(5, t.users + Math.floor(Math.random() * 7 - 3));
      t.load = Math.min(99, Math.max(5, t.load + Math.floor(Math.random() * 5 - 2)));
    }
  });
  // Re-render only the rows (not the detail panel)
  const container = $("towerStatusList");
  if (!container) return;
  container.querySelectorAll(".tower-row-item").forEach(row => {
    const id = row.dataset.towerId;
    const tower = TOWERS.find(t => t.id === id);
    if (!tower) return;
    const temp = document.createElement("div");
    temp.innerHTML = buildTowerRow(tower);
    const newRow = temp.firstElementChild;
    newRow.addEventListener("click", () => {
      const t = TOWERS.find(t => t.id === id);
      if (t) showTowerDetail(t, newRow);
    });
    row.replaceWith(newRow);
  });
}
 
// ═══════════════════════════════════════════════════════════════════════════
// ── NEW FEATURE 4: MAP TOWER HOVER/CLICK DETAILS ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function addTowerMarkersToMap() {
  if (!state.map || !state.userLat) return;
 
  const offsets = [
    [0.015, 0.01], [-0.01, 0.02], [0.02, -0.015],
    [-0.018, -0.01], [0.005, 0.025],
  ];
 
  TOWERS.forEach((tower, i) => {
    const lat = state.userLat + offsets[i][0];
    const lng = state.userLng + offsets[i][1];
    tower.lat = lat; tower.lng = lng;
 
    const is5G = tower.type.includes("5G");
    const isOnline = tower.status === "online";
    const color = isOnline ? (is5G ? "#00ff99" : "#ff8c00") : "#888";
 
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        width:28px;height:28px;border-radius:50%;
        background:${color}22;border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        font-size:13px;cursor:pointer;
        box-shadow:0 0 10px ${color}88;
        transition:all 0.2s;
      " title="${tower.name}">🗼</div>`,
      iconSize: [28, 28], iconAnchor: [14, 14],
    });
 
    const loadColor = tower.load > 80 ? "#e74c3c" : tower.load > 55 ? "#ff8c00" : "#107c10";
    const ping = is5G ? (2 + Math.random() * 8).toFixed(1) : (20 + Math.random() * 40).toFixed(1);
 
    const marker = L.marker([lat, lng], { icon }).addTo(state.map);
    marker.bindPopup(`
      <div style="font-family:Inter,sans-serif;font-size:13px;min-width:180px">
        <div style="font-family:Orbitron,sans-serif;font-size:12px;font-weight:700;color:${color};margin-bottom:8px">
          🗼 ${tower.name} (${tower.id})
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <tr><td style="color:#677382;padding:2px 0">Type</td><td style="color:#1a1a1a;font-weight:600;text-align:right">${tower.type}</td></tr>
          <tr><td style="color:#677382;padding:2px 0">Band</td><td style="color:#1a1a1a;font-weight:600;text-align:right">${tower.band}</td></tr>
          <tr><td style="color:#677382;padding:2px 0">Max Speed</td><td style="color:${color};font-weight:600;text-align:right">${tower.maxSpeed}</td></tr>
          <tr><td style="color:#677382;padding:2px 0">Users</td><td style="color:#1a1a1a;font-weight:600;text-align:right">${tower.users}</td></tr>
          <tr><td style="color:#677382;padding:2px 0">Load</td><td style="color:${loadColor};font-weight:600;text-align:right">${tower.load}%</td></tr>
          <tr><td style="color:#677382;padding:2px 0">Ping</td><td style="color:#1a1a1a;font-weight:600;text-align:right">${ping} ms</td></tr>
          <tr><td style="color:#677382;padding:2px 0">Status</td><td style="color:${isOnline ? "#107c10" : "#ff8c00"};font-weight:600;text-align:right">${tower.status}</td></tr>
        </table>
        <div style="margin-top:8px;font-size:10px;color:#677382">Sector: ${tower.sector}</div>
      </div>
    `, { maxWidth: 220 });
 
    state.towerMarkers.push(marker);
  });
}
 
// ── MAP ───────────────────────────────────────────────────────────────────────
function initMap() {
  const lat = state.userLat || 20.5937;
  const lng = state.userLng || 78.9629;
  state.map = L.map("map", { zoomControl: true }).setView([lat, lng], state.userLat ? 13 : 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors", maxZoom: 18,
  }).addTo(state.map);
  generateSimulatedZones(lat, lng);
  if (state.userLat) {
    placeUserMarker(lat, lng, state.currentNetwork || "5G");
    addTowerMarkersToMap();
  }
}
 
function generateSimulatedZones(centerLat, centerLng) {
  const zones = [
    { type: "5G", offsetLat: 0, offsetLng: 0, label: "City Center — 5G Zone" },
    { type: "5G", offsetLat: 0.03, offsetLng: 0.04, label: "Tech Park — 5G Zone" },
    { type: "5G", offsetLat: -0.02, offsetLng: 0.05, label: "Business Hub — 5G Zone" },
    { type: "4G", offsetLat: 0.06, offsetLng: -0.04, label: "Suburbs — 4G Zone" },
    { type: "4G", offsetLat: -0.05, offsetLng: -0.03, label: "Outskirts — 4G Zone" },
    { type: "4G", offsetLat: 0.07, offsetLng: 0.07, label: "Industrial Area — 4G" },
    { type: "5G", offsetLat: -0.04, offsetLng: 0.08, label: "Airport Zone — 5G" },
    { type: "4G", offsetLat: 0.09, offsetLng: -0.07, label: "Rural Edge — 4G Zone" },
  ];
  zones.forEach(z => {
    const lat = centerLat + z.offsetLat, lng = centerLng + z.offsetLng;
    const color = z.type === "5G" ? "#00ff99" : "#ff8c00";
    const radius = z.type === "5G" ? 1800 : 2500;
    const circle = L.circle([lat, lng], { color, fillColor: color, fillOpacity: 0.12, weight: 2, radius }).addTo(state.map);
    circle.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:13px">
      <strong style="color:${color}">${z.type} Coverage Zone</strong><br/>
      <span style="color:#8a9bc5">${z.label}</span><br/>
      <span style="color:#8a9bc5;font-size:11px">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</span>
    </div>`);
    state.simulatedZoneMarkers.push(circle);
  });
}
 
function placeUserMarker(lat, lng, network) {
  if (state.userMarker) state.map.removeLayer(state.userMarker);
  const color = network === "5G" ? "#00ff99" : "#ff8c00";
  const icon = L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 16px ${color}"></div>`,
    iconSize: [20, 20], iconAnchor: [10, 10],
  });
  state.userMarker = L.marker([lat, lng], { icon }).addTo(state.map)
    .bindPopup(`<strong style="color:${color}">📍 You are here</strong><br/>
      <span style="color:#8a9bc5">Network: ${network}</span><br/>
      <span style="color:#8a9bc5;font-size:11px">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>`)
    .openPopup();
}
 
function updateUserMapMarker(network) {
  if (state.map && state.userLat) placeUserMarker(state.userLat, state.userLng, network);
}
 
// ── GEOLOCATION ──────────────────────────────────────────────────────────────
function initGeolocation() {
  if (!navigator.geolocation) {
    $("mapInfoBar").innerHTML = '<i class="fas fa-exclamation-triangle"></i> Geolocation not supported. Using simulated India center.';
    state.userLat = 20.5937; state.userLng = 78.9629; return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userLat = pos.coords.latitude; state.userLng = pos.coords.longitude;
      const acc = pos.coords.accuracy.toFixed(0);
      $("mapInfoBar").innerHTML = `<i class="fas fa-location-dot"></i> Location acquired — Lat: ${state.userLat.toFixed(5)}, Lng: ${state.userLng.toFixed(5)} (±${acc}m accuracy)`;
      showToast("📍 Location acquired! Map initialised with your position.", "toast-5g");
      pushAlert(`Your location was detected at <strong>${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)}</strong>. Map zones loaded.`, "a-5g", "fa-location-dot");
      if (state.map) {
        state.map.setView([state.userLat, state.userLng], 13);
        generateSimulatedZones(state.userLat, state.userLng);
        placeUserMarker(state.userLat, state.userLng, state.currentNetwork || "5G");
        addTowerMarkersToMap();
      }
    },
    (err) => {
      $("mapInfoBar").innerHTML = `<i class="fas fa-triangle-exclamation"></i> Location access denied (${err.message}). Using simulated center.`;
      state.userLat = 20.5937; state.userLng = 78.9629;
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
  navigator.geolocation.watchPosition(
    (pos) => {
      const newLat = pos.coords.latitude, newLng = pos.coords.longitude;
      const dist = getDistanceM(state.userLat, state.userLng, newLat, newLng);
      if (dist > 50) {
        state.userLat = newLat; state.userLng = newLng;
        $("mapInfoBar").innerHTML = `<i class="fas fa-location-dot"></i> Location updated — Lat: ${newLat.toFixed(5)}, Lng: ${newLng.toFixed(5)}`;
        updateUserMapMarker(state.currentNetwork || "5G");
        checkZoneEntry(newLat, newLng);
      }
    }, null, { enableHighAccuracy: true },
  );
}
 
function getDistanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
 
let lastZoneType = null;
function checkZoneEntry(lat, lng) {
  state.simulatedZoneMarkers.forEach(circle => {
    const dist = getDistanceM(lat, lng, circle.getLatLng().lat, circle.getLatLng().lng);
    if (dist < circle.getRadius()) {
      const type = circle.options.color === "#00ff99" ? "5G" : "4G";
      if (type !== lastZoneType) {
        lastZoneType = type;
        if (type === "5G") {
          showToast("📶 You entered a 5G zone! Unlimited data active.", "toast-5g");
          pushAlert("You have entered a <strong>5G coverage zone</strong>. Unlimited data is now active!", "a-5g", "fa-signal");
        } else {
          showToast("📉 You entered a 4G zone. Quota will be consumed.", "toast-4g");
          pushAlert("You have entered a <strong>4G-only zone</strong>. Data usage will deduct from your quota.", "a-4g", "fa-triangle-exclamation");
        }
      }
    }
  });
}
 
// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  const user = getCurrentUser();
  if (user && user.isAuthenticated) {
    state.user = user;
    hideLandingPage();
    hideAuthModal();
    updateUserDisplay();
    startSimulation();
  } else {
    showLandingPage();
    hideAuthModal();
  }
  renderStats();
}
 
// ── AUTH EVENTS ───────────────────────────────────────────────────────────────
let isSignupMode = false;
 
$("authForm").addEventListener("submit", (e) => {
  e.preventDefault();
  authenticateUser($("authEmail").value, $("authPassword").value, isSignupMode);
});
 
$("authEmail").addEventListener("blur", () => {
  const email = $("authEmail").value.trim();
  if (email && !validateEmail(email)) $("authEmail").classList.add("error");
  else $("authEmail").classList.remove("error");
});
 
$("authEmail").addEventListener("input", () => {
  const email = $("authEmail").value.trim();
  if (!email || validateEmail(email)) $("authEmail").classList.remove("error");
});
 
$("toggleLink").addEventListener("click", (e) => {
  e.preventDefault();
  isSignupMode = !isSignupMode;
  $("authTitle").textContent = isSignupMode ? "Sign Up" : "Sign In";
  $("toggleText").textContent = isSignupMode ? "Already have an account?" : "Don't have an account?";
  $("authSubmitBtn").textContent = isSignupMode ? "Sign Up" : "Sign In";
  clearAuthForm();
});
 
$("guestBtn").addEventListener("click", (e) => { e.preventDefault(); guestMode(); });
$("logoutBtn").addEventListener("click", (e) => { e.preventDefault(); logoutUser(); });
 
if ($("getStartedBtn")) {
  $("getStartedBtn").addEventListener("click", () => { hideLandingPage(); showAuthModal(); clearAuthForm(); });
}
if ($("guestAccessBtn")) {
  $("guestAccessBtn").addEventListener("click", () => { hideLandingPage(); guestMode(); });
}
 
document.addEventListener("DOMContentLoaded", init);