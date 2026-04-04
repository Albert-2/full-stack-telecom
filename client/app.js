// /* =========================================
// NexGen 5G Auditor — app.js
// ========================================= */
// // ── AUTHENTICATION ───────────────────────────────────────────────────────────
// const STORAGE_KEY = 'nexgen5g_user';

// function validateEmail(email) {
//   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return regex.test(email);
// }

// function validatePassword(password) {
//   return password.length >= 7 && password.length <= 14;
// }

// function authenticateUser(email, password, isSignup) {
//   email = email.trim().toLowerCase();

//   if (!validateEmail(email)) {
//     showAuthError('Please enter a valid email address.');
//     return false;
//   }

//   if (!validatePassword(password)) {
//     showAuthError('Password must be 7-14 characters long.');
//     return false;
//   }

//   const users = JSON.parse(localStorage.getItem('nexgen5g_users') || '{}');

//   if (isSignup) {
//     // Sign up
//     if (users[email]) {
//       showAuthError('This email is already registered. Please sign in instead.');
//       return false;
//     }
//     users[email] = {
//       email,
//       password,
//       createdAt: new Date().toISOString(),
//     };
//     localStorage.setItem('nexgen5g_users', JSON.stringify(users));
//     showAuthSuccess('Account created successfully! Signing you in...');
//     setTimeout(() => setCurrentUser(email, false), 1000);
//     return true;
//   } else {
//     // Sign in
//     if (!users[email]) {
//       showAuthError('Email not found. Please sign up first.');
//       return false;
//     }
//     if (users[email].password !== password) {
//       showAuthError('Incorrect password. Please try again.');
//       return false;
//     }
//     setCurrentUser(email, false);
//     return true;
//   }
// }

// function setCurrentUser(email, isGuest = false) {
//   const user = {
//     email,
//     isGuest,
//     isAuthenticated: true,
//     loginTime: new Date().toISOString(),
//   };
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
//   state.user = user;
//   hideAuthModal();
//   updateUserDisplay();
// }

// function guestMode() {
//   const user = {
//     email: 'guest@example.com',
//     isGuest: true,
//     isAuthenticated: true,
//     loginTime: new Date().toISOString(),
//   };
//   state.user = user;
//   hideAuthModal();
//   updateUserDisplay();
//   showToast('👤 Welcome, Guest User!', 'toast-5g');
// }

// function getCurrentUser() {
//   const stored = localStorage.getItem(STORAGE_KEY);
//   return stored ? JSON.parse(stored) : null;
// }

// function logoutUser() {
//   localStorage.removeItem(STORAGE_KEY);
//   state.user = { email: null, isGuest: false, isAuthenticated: false };
//   showAuthModal();
//   clearAuthForm();
// }

// function showAuthModal() {
//   $('authModal').classList.remove('hidden');
// }

// function hideAuthModal() {
//   $('authModal').classList.add('hidden');
// }

// function clearAuthForm() {
//   $('authForm').reset();
//   $('authEmail').classList.remove('error');
//   $('authPassword').classList.remove('error');
//   $('emailError').textContent = '';
//   $('passwordError').textContent = '';
//   $('authError').textContent = '';
//   $('authSuccess').textContent = '';
//   $('authTitle').textContent = 'Sign In';
//   $('toggleText').textContent = "Don't have an account?";
//   $('authSubmitBtn').textContent = 'Sign In';
// }

// function showAuthError(msg) {
//   $('authError').textContent = msg;
//   $('authError').style.display = 'block';
//   $('authSuccess').textContent = '';
// }

// function showAuthSuccess(msg) {
//   $('authSuccess').textContent = msg;
//   $('authSuccess').style.display = 'block';
//   $('authError').textContent = '';
// }

// function updateUserDisplay() {
//   const user = state.user;
//   if (user && user.isAuthenticated) {
//     const displayName = user.isGuest ? 'Guest User' : user.email;
//     const status = user.isGuest ? '👤 Guest Access' : '✓ Logged In';
//     $('userName').textContent = displayName;
//     $('userStatus').textContent = status;
//   }
// }

// // ── CONFIG ──────────────────────────────────────────────────────────────────
// const DAILY_QUOTA_MB = 1500;
// const SIMULATE_INTERVAL_MS = 4000; // new event every 4s
// const APPS = [
//   "YouTube",
//   "Netflix",
//   "Instagram",
//   "WhatsApp",
//   "Chrome",
//   "Hotstar",
//   "Spotify",
// ];
// const LOCS = ["Home", "Office", "Mall", "Metro", "Cafe", "Outdoor", "Basement"];
// // ── STATE ────────────────────────────────────────────────────────────────────
// let state = {
//   currentNetwork: null,
//   used4g: 0,
//   used5g: 0,
//   events: [],
//   alerts: [],
//   alertCount: 0,
//   userLat: null,
//   userLng: null,
//   map: null,
//   userMarker: null,
//   simulatedZoneMarkers: [],
//   lastNetwork: null,
//   user: {
//     email: null,
//     isGuest: false,
//     isAuthenticated: false,
//   },
// };
// // ── DOM SHORTCUTS ─────────────────────────────────────────────────────────────
// const $ = (id) => document.getElementById(id);
// // ── CLOCK ────────────────────────────────────────────────────────────────────
// function updateClock() {
//   const now = new Date();
//   $("clock").textContent = now.toLocaleTimeString("en-IN", { hour12: false });
// }
// setInterval(updateClock, 1000);
// updateClock();
// // ── NOTIFICATION SOUND ──────────────────────────────────────────────────────
// let audioContext = null;

// function initAudioContext() {
//   if (!audioContext) {
//     audioContext = new (window.AudioContext || window.webkitAudioContext)();
//   }
//   return audioContext;
// }

// function playNotificationSound() {
//   try {
//     const ctx = initAudioContext();
//     const now = ctx.currentTime;

//     // Create oscillator
//     const osc = ctx.createOscillator();
//     const gain = ctx.createGain();

//     osc.connect(gain);
//     gain.connect(ctx.destination);

//     // Ring tone: two beeps
//     osc.frequency.setValueAtTime(1000, now); // First beep at 1000Hz
//     gain.gain.setValueAtTime(0.3, now);
//     gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

//     osc.start(now);
//     osc.stop(now + 0.3);

//     // Second beep
//     osc.frequency.setValueAtTime(1200, now + 0.4);
//     gain.gain.setValueAtTime(0.3, now + 0.4);
//     gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

//     osc.start(now + 0.4);
//     osc.stop(now + 0.7);
//   } catch (e) {
//     console.log('Audio playback not available');
//   }
// }

// // ── NAVIGATION ───────────────────────────────────────────────────────────────
// document.querySelectorAll(".nav-item").forEach((item) => {
//   item.addEventListener("click", (e) => {
//     e.preventDefault();
//     const sec = item.dataset.section;
//     document
//       .querySelectorAll(".nav-item")
//       .forEach((n) => n.classList.remove("active"));
//     item.classList.add("active");
//     document
//       .querySelectorAll(".section")
//       .forEach((s) => s.classList.remove("active"));
//     $("sec-" + sec).classList.add("active");
//     $("pageTitle").textContent = item.querySelector("span").textContent.trim();
//     // init map on first visit

//     if (sec === "map" && !state.map) initMap();
//     // close sidebar on mobile
//     if (window.innerWidth <= 768) $("sidebar").classList.remove("open");
//   });
// });
// $("menuToggle").addEventListener("click", () => {
//   $("sidebar").classList.toggle("open");
// });
// // ── TOAST NOTIFICATIONS ───────────────────────────────────────────────────────
// let toastTimer;
// function showToast(msg, type = "") {
//   const t = $("toast");
//   t.textContent = msg;
//   t.className = "toast show " + type;
//   clearTimeout(toastTimer);
//   toastTimer = setTimeout(() => t.classList.remove("show"), 4000);
// }
// // ── PUSH ALERT ────────────────────────────────────────────────────────────────
// function pushAlert(msg, type = "a-4g", icon = "fa-exclamation-triangle") {
//   const list = $("alertList");
//   const empty = list.querySelector(".feed-empty");
//   if (empty) empty.remove();
//   state.alertCount++;
//   $("alertBadge").textContent = state.alertCount;
//   const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
//   const div = document.createElement("div");
//   div.className = `alert-item ${type}`;
//   div.innerHTML = `
// <i class="fas ${icon} alert-icon"></i>
// <span class="alert-msg">${msg}</span>
// <span class="alert-time">${time}</span>`;
//   list.prepend(div);
//   state.alerts.unshift({ msg, type, time });
//   return div;
// }
// $("clearAlerts").addEventListener("click", () => {
//   $("alertList").innerHTML = '<div class="feed-empty">No alerts yet.</div>';
//   state.alertCount = 0;
//   state.alerts = [];
//   $("alertBadge").textContent = "0";
// });
// // ── RENDER STAT CARDS ─────────────────────────────────────────────────────────
// function renderStats() {
//   const left = Math.max(0, DAILY_QUOTA_MB - state.used4g);
//   const pct = Math.min(100, (state.used4g / DAILY_QUOTA_MB) * 100).toFixed(1);
//   $("total5g").textContent = formatMB(state.used5g);
//   $("total4g").textContent = formatMB(state.used4g);
//   $("quotaLeft").textContent = formatMB(left);
//   $("quotaPercent").textContent = pct + "%";
//   const fill = $("quotaFill");
//   fill.style.width = pct + "%";
//   fill.classList.toggle("danger", pct >= 70);
//   // Summary
//   const events = state.events;
//   $("sumEvents").textContent = events.length;
//   $("sum5gEvents").textContent = events.filter((e) => e.net === "5G").length;
//   $("sum4gEvents").textContent = events.filter((e) => e.net === "4G").length;
//   $("sumFallbacks").textContent = state.alerts.filter(
//     (a) => a.type === "a-4g",
//   ).length;
// }
// function formatMB(mb) {
//   return mb >= 1000 ? (mb / 1000).toFixed(2) + " GB" : mb.toFixed(1) + " MB";
// }
// // ── SIGNAL PILL UPDATE ────────────────────────────────────────────────────────
// function updateSignalPill(net) {
//   const pill = $("signalPill");
//   const dot = $("pulseDot");
//   const label = $("signalLabel");
//   $("currentNetwork").textContent = net;
//   if (net === "5G") {
//     dot.className = "pulse-dot on5g";
//     label.textContent = "5G Active";
//     pill.style.borderColor = "rgba(0,255,153,0.4)";
//     label.style.color = "var(--accent-green)";
//   } else {
//     dot.className = "pulse-dot on4g";
//     label.textContent = "4G Fallback";
//     pill.style.borderColor = "rgba(255,140,0,0.4)";
//     label.style.color = "var(--accent-orange)";
//   }
// }
// // ── EVENT FEED ─────────────────────────────────────────────────────────────────
// function addFeedItem(ev) {
//   const feed = $("eventFeed");
//   const empty = feed.querySelector(".feed-empty");
//   if (empty) empty.remove();

//   const div = document.createElement("div");
//   div.className = `feed-item ${ev.net === "5G" ? "f5g" : "f4g"}`;
//   div.innerHTML = `
// <span class="feed-tag ${ev.net === "5G" ? "tag-5g" : "tag-4g"}">${ev.net}</span>
// <span class="feed-app">${ev.app}</span>
// <span class="feed-data">${ev.data.toFixed(1)} MB</span>
// <span class="feed-loc"><i class="fas fa-map-pin"></i> ${ev.loc}</span>
// <span class="feed-time">${ev.time}</span>`;
//   feed.prepend(div);
//   // Keep max 30 items in feed
//   while (feed.children.length > 30) feed.removeChild(feed.lastChild);
// }
// // ── USAGE TABLE ────────────────────────────────────────────────────────────────
// function refreshTable() {
//   const tbody = $("usageTbody");
//   const recent = state.events.slice(-10).reverse();
//   if (recent.length === 0) {
//     tbody.innerHTML =
//       '<tr><td colspan="7" class="empty-row">No history yet.</td></tr>';
//     return;
//   }
//   tbody.innerHTML = recent
//     .map(
//       (ev, i) => `
// <tr>
// <td>${i + 1}</td>
// <td>${ev.time}</td>
// <td><span class="chip ${ev.net === "5G" ? "chip-5g" : "chip-4g"}">${ev.net}</span></td>
// <td>${ev.app}</td>
// <td>${ev.data.toFixed(1)}</td>
// <td>${ev.loc}</td>
// <td><span class="chip ${ev.net === "5G" ? "chip-ok" : "chip-warn"}">${
//         ev.net === "5G" ? "Free" : "Quota"
//       }</span></td>
// </tr>`,
//     )
//     .join("");
// }
// // ── SIMULATE NETWORK EVENTS ───────────────────────────────────────────────────
// function simulateEvent() {
//   // Weighted: ~60% 5G, 40% 4G
//   const net = Math.random() < 0.6 ? "5G" : "4G";
//   const app = APPS[Math.floor(Math.random() * APPS.length)];
//   const data = +(Math.random() * 480 + 20).toFixed(1); // 20–500 MB
//   const loc = state.userLat
//     ? LOCS[Math.floor(Math.random() * LOCS.length)]
//     : "Unknown";
//   const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
//   const ev = { net, app, data, loc, time };
//   state.events.push(ev);
//   // Accumulate data
//   if (net === "5G") {
//     state.used5g += data;
//   } else {
//     state.used4g += data;
//   }
//   // Detect fallback
//   if (state.lastNetwork === "5G" && net === "4G") {
//     playNotificationSound();
//     showToast(
//       `⚠️ Fallback! Switched to 4G at ${loc} — ${app} now using quota.`,
//       "toast-4g",
//     );
//     const alertItem = pushAlert(
//       `Fallback to 4G detected at <strong>${loc}</strong> while using <strong>${app}
// </strong>. ${data.toFixed(1)} MB deducted from quota.`,
//       "a-4g",
//       "fa-exclamation-triangle",
//     );
//     if (alertItem) {
//       alertItem.classList.add('ring-effect');
//     }
//   } else if (state.lastNetwork === "4G" && net === "5G") {
//     showToast(`✅ Back on 5G at ${loc}! Data is now unlimited.`, "toast-5g");

//     pushAlert(
//       `Restored to 5G at <strong>${loc}</strong>. Enjoy unlimited data!`,
//       "a-5g",
//       "fa-check-circle",
//     );
//   }
//   // Quota warnings
//   const used4gPct = (state.used4g / DAILY_QUOTA_MB) * 100;
//   if (used4gPct >= 90 && state.lastNetwork !== "4G_WARN90") {
//     showToast("🚨 90% of your 4G quota used!", "toast-warn");
//     pushAlert(
//       "You have used <strong>90%</strong> of your daily 4G quota. Consider switching to Wi-Fi.",
//       "a-warn",
//       "fa-radiation",
//     );
//     state.lastNetwork = "4G_WARN90";
//   } else if (used4gPct >= 75 && !state.warned75) {
//     showToast("⚠️ 75% of your 4G quota used!", "toast-warn");

//     pushAlert(
//       "You have used <strong>75%</strong> of your daily 4G quota.",
//       "a-warn",
//       "fa-exclamation-circle",
//     );
//     state.warned75 = true;
//   }
//   state.lastNetwork = net;
//   state.currentNetwork = net;
//   updateSignalPill(net);
//   addFeedItem(ev);
//   refreshTable();
//   renderStats();
//   updateUserMapMarker(net);
// }
// // ── MAP ────────────────────────────────────────────────────────────────────────
// function initMap() {
//   const lat = state.userLat || 20.5937;
//   const lng = state.userLng || 78.9629;
//   state.map = L.map("map", { zoomControl: true }).setView(
//     [lat, lng],
//     state.userLat ? 13 : 5,
//   );
//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "© OpenStreetMap contributors",
//     maxZoom: 18,
//   }).addTo(state.map);

//   generateSimulatedZones(lat, lng);
//   if (state.userLat) placeUserMarker(lat, lng, state.currentNetwork || "5G");
// }
// function generateSimulatedZones(centerLat, centerLng) {
//   const zones = [
//     { type: "5G", offsetLat: 0, offsetLng: 0, label: "City Center — 5G Zone" },
//     {
//       type: "5G",
//       offsetLat: 0.03,
//       offsetLng: 0.04,
//       label: "Tech Park — 5G Zone",
//     },
//     {
//       type: "5G",
//       offsetLat: -0.02,
//       offsetLng: 0.05,
//       label: "Business Hub — 5G Zone",
//     },
//     {
//       type: "4G",
//       offsetLat: 0.06,
//       offsetLng: -0.04,
//       label: "Suburbs — 4G Zone",
//     },
//     {
//       type: "4G",
//       offsetLat: -0.05,
//       offsetLng: -0.03,
//       label: "Outskirts — 4G Zone",
//     },
//     {
//       type: "4G",
//       offsetLat: 0.07,
//       offsetLng: 0.07,
//       label: "Industrial Area — 4G",
//     },
//     {
//       type: "5G",
//       offsetLat: -0.04,
//       offsetLng: 0.08,
//       label: "Airport Zone — 5G",
//     },
//     {
//       type: "4G",
//       offsetLat: 0.09,
//       offsetLng: -0.07,
//       label: "Rural Edge — 4G Zone",
//     },
//   ];
//   zones.forEach((z) => {
//     const lat = centerLat + z.offsetLat;
//     const lng = centerLng + z.offsetLng;
//     const color = z.type === "5G" ? "#00ff99" : "#ff8c00";
//     const radius = z.type === "5G" ? 1800 : 2500;
//     const circle = L.circle([lat, lng], {
//       color: color,
//       fillColor: color,
//       fillOpacity: 0.12,
//       weight: 2,
//       radius,
//     }).addTo(state.map);
//     circle.bindPopup(`
// <div style="font-family:Inter,sans-serif;font-size:13px">
// <strong style="color:${color}">${z.type} Coverage Zone</strong><br/>
// <span style="color:#8a9bc5">${z.label}</span><br/>
// <span style="color:#8a9bc5;font-size:11px">Lat: ${lat.toFixed(4)}, Lng:
// ${lng.toFixed(4)}</span>
// </div>`);
//     state.simulatedZoneMarkers.push(circle);
//   });
// }
// function placeUserMarker(lat, lng, network) {
//   if (state.userMarker) state.map.removeLayer(state.userMarker);
//   const color = network === "5G" ? "#00ff99" : "#ff8c00";
//   const icon = L.divIcon({
//     className: "",

//     html: `<div style="
// width:20px;height:20px;
// background:${color};
// border:3px solid #fff;
// border-radius:50%;
// box-shadow:0 0 16px ${color};
// animation:none;
// "></div>`,
//     iconSize: [20, 20],
//     iconAnchor: [10, 10],
//   });
//   state.userMarker = L.marker([lat, lng], { icon })
//     .addTo(state.map)
//     .bindPopup(
//       `<strong style="color:${color}">📍 You are here</strong><br/>
// <span style="color:#8a9bc5">Network: ${network}</span><br/>
// <span style="color:#8a9bc5;font-size:11px">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>`,
//     )
//     .openPopup();
// }
// function updateUserMapMarker(network) {
//   if (state.map && state.userLat)
//     placeUserMarker(state.userLat, state.userLng, network);
// }
// // ── GEOLOCATION ────────────────────────────────────────────────────────────────
// function initGeolocation() {
//   if (!navigator.geolocation) {
//     $("mapInfoBar").innerHTML =
//       '<i class="fas fa-exclamation-triangle"></i> Geolocation not supported. Using simulated India center.';
//     state.userLat = 20.5937;
//     state.userLng = 78.9629;
//     return;
//   }
//   navigator.geolocation.getCurrentPosition(
//     (pos) => {
//       state.userLat = pos.coords.latitude;
//       state.userLng = pos.coords.longitude;
//       const acc = pos.coords.accuracy.toFixed(0);
//       $("mapInfoBar").innerHTML =
//         `<i class="fas fa-location-dot"></i> Location acquired — Lat:
// ${state.userLat.toFixed(5)}, Lng: ${state.userLng.toFixed(5)} (±${acc}m accuracy)`;
//       showToast(
//         "📍 Location acquired! Map initialised with your position.",
//         "toast-5g",
//       );
//       pushAlert(
//         `Your location was detected at <strong>${state.userLat.toFixed(4)},
// ${state.userLng.toFixed(4)}</strong>. Map zones loaded.`,
//         "a-5g",
//         "fa-location-dot",
//       );
//       if (state.map) {
//         state.map.setView([state.userLat, state.userLng], 13);
//         generateSimulatedZones(state.userLat, state.userLng);
//         placeUserMarker(
//           state.userLat,
//           state.userLng,
//           state.currentNetwork || "5G",
//         );
//       }
//     },

//     (err) => {
//       $("mapInfoBar").innerHTML =
//         `<i class="fas fa-triangle-exclamation"></i> Location access
// denied (${err.message}). Using simulated center.`;
//       state.userLat = 20.5937;
//       state.userLng = 78.9629;
//     },
//     { enableHighAccuracy: true, timeout: 10000 },
//   );
//   // Watch for location changes
//   navigator.geolocation.watchPosition(
//     (pos) => {
//       const newLat = pos.coords.latitude;
//       const newLng = pos.coords.longitude;
//       const dist = getDistanceM(state.userLat, state.userLng, newLat, newLng);
//       if (dist > 50) {
//         // only update if moved >50m
//         state.userLat = newLat;
//         state.userLng = newLng;
//         $("mapInfoBar").innerHTML =
//           `<i class="fas fa-location-dot"></i> Location updated — Lat:
// ${newLat.toFixed(5)}, Lng: ${newLng.toFixed(5)}`;
//         updateUserMapMarker(state.currentNetwork || "5G");
//         checkZoneEntry(newLat, newLng);
//       }
//     },
//     null,
//     { enableHighAccuracy: true },
//   );
// }
// function getDistanceM(lat1, lng1, lat2, lng2) {
//   const R = 6371000;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLng = ((lng2 - lng1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLng / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }
// // ── ZONE ENTRY DETECTION ──────────────────────────────────────────────────────
// let lastZoneType = null;
// function checkZoneEntry(lat, lng) {
//   // Simplified: check proximity to simulated zone centers
//   state.simulatedZoneMarkers.forEach((circle) => {
//     const cLat = circle.getLatLng().lat;
//     const cLng = circle.getLatLng().lng;
//     const dist = getDistanceM(lat, lng, cLat, cLng);
//     if (dist < circle.getRadius()) {
//       const type = circle.options.color === "#00ff99" ? "5G" : "4G";
//       if (type !== lastZoneType) {
//         lastZoneType = type;
//         if (type === "5G") {
//           showToast(
//             "📶 You entered a 5G zone! Unlimited data active.",
//             "toast-5g",
//           );
//           pushAlert(
//             "You have entered a <strong>5G coverage zone</strong>. Unlimited data is now active!",
//             "a-5g",
//             "fa-signal",
//           );
//         } else {
//           showToast(
//             "📉 You entered a 4G zone. Quota will be consumed.",
//             "toast-4g",
//           );
//           pushAlert(
//             "You have entered a <strong>4G-only zone</strong>. Data usage will deduct from your quota.",
//             "a-4g",
//             "fa-triangle-exclamation",
//           );
//         }
//       }
//     }
//   });
// }
// // ── INIT ───────────────────────────────────────────────────────────────────────
// function init() {
//   // Check for existing user session
//   const user = getCurrentUser();
//   if (user && user.isAuthenticated) {
//     state.user = user;
//     hideAuthModal();
//     updateUserDisplay();
//   } else {
//     showAuthModal();
//   }

//   initGeolocation();
//   renderStats();
//   // Start simulation
//   setTimeout(() => {
//     simulateEvent(); // first event immediately
//     setInterval(simulateEvent, SIMULATE_INTERVAL_MS);
//   }, 1500);
// }

// // ── AUTHENTICATION EVENT LISTENERS ──────────────────────────────────────────
// let isSignupMode = false;

// $("authForm").addEventListener("submit", (e) => {
//   e.preventDefault();
//   const email = $("authEmail").value;
//   const password = $("authPassword").value;
//   authenticateUser(email, password, isSignupMode);
// });

// $("toggleLink").addEventListener("click", (e) => {
//   e.preventDefault();
//   isSignupMode = !isSignupMode;
//   if (isSignupMode) {
//     $("authTitle").textContent = "Sign Up";
//     $("toggleText").textContent = "Already have an account?";
//     $("authSubmitBtn").textContent = "Sign Up";
//   } else {
//     $("authTitle").textContent = "Sign In";
//     $("toggleText").textContent = "Don't have an account?";
//     $("authSubmitBtn").textContent = "Sign In";
//   }
//   clearAuthForm();
// });

// $("guestBtn").addEventListener("click", (e) => {
//   e.preventDefault();
//   guestMode();
// });

// $("logoutBtn").addEventListener("click", (e) => {
//   e.preventDefault();
//   logoutUser();
// });

// document.addEventListener("DOMContentLoaded", init);

/* =========================================
NexGen 5G Auditor — app.js
========================================= */
// ── AUTHENTICATION ───────────────────────────────────────────────────────────
const STORAGE_KEY = "nexgen5g_user";

function validateEmail(email) {
  // Strict email validation:
  // - Alphanumeric, dot, underscore, percent, hyphen before @
  // - Domain must contain at least one letter (not all numbers)
  // - TLD must have at least 2 letters only (no numbers/special chars)
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
    // Sign up
    if (users[email]) {
      showAuthError(
        "This email is already registered. Please sign in instead.",
      );
      return false;
    }
    users[email] = {
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("nexgen5g_users", JSON.stringify(users));
    showAuthSuccess("Account created successfully! Signing you in...");
    setTimeout(() => setCurrentUser(email, false), 1000);
    return true;
  } else {
    // Sign in
    if (!users[email]) {
      showAuthError("Email not found. Please sign up first.");
      return false;
    }
    if (users[email].password !== password) {
      showAuthError("Incorrect password. Please try again.");
      return false;
    }
    setCurrentUser(email, false);
    return true;
  }
}

function setCurrentUser(email, isGuest = false) {
  const user = {
    email,
    isGuest,
    isAuthenticated: true,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  state.user = user;
  hideAuthModal();
  updateUserDisplay();
  // ── FIX #2: Start simulation ONLY after user is authenticated ──
  startSimulation();
}

function guestMode() {
  const user = {
    email: "guest@example.com",
    isGuest: true,
    isAuthenticated: true,
    loginTime: new Date().toISOString(),
  };
  state.user = user;
  hideAuthModal();
  updateUserDisplay();
  showToast("👤 Welcome, Guest User!", "toast-5g");
  // ── FIX #2: Start simulation ONLY after guest mode is chosen ──
  startSimulation();
}

function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  state.user = { email: null, isGuest: false, isAuthenticated: false };
  // Stop simulation on logout
  stopSimulation();
  // Reset state data
  state.used4g = 0;
  state.used5g = 0;
  state.events = [];
  state.alerts = [];
  state.alertCount = 0;
  state.lastNetwork = null;
  state.currentNetwork = null;
  state.warned75 = false;
  // Reset UI
  $("eventFeed").innerHTML =
    '<div class="feed-empty">Waiting for network events...</div>';
  $("alertList").innerHTML = '<div class="feed-empty">No alerts yet.</div>';
  $("alertBadge").textContent = "0";
  renderStats();
  updateSignalPill("--");
  // Show landing page
  showLandingPage();
  // Hide auth modal
  hideAuthModal();
  clearAuthForm();
}

let simulationInterval = null;

function startSimulation() {
  if (simulationInterval) return; // already running
  initGeolocation();
  setTimeout(() => {
    simulateEvent(); // first event immediately
    simulationInterval = setInterval(simulateEvent, SIMULATE_INTERVAL_MS);
  }, 1500);
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

function showAuthModal() {
  $("authModal").classList.remove("hidden");
}

function hideAuthModal() {
  $("authModal").classList.add("hidden");
}

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

function showAuthError(msg) {
  $("authError").textContent = msg;
  $("authError").style.display = "block";
  $("authSuccess").textContent = "";
}

function showAuthSuccess(msg) {
  $("authSuccess").textContent = msg;
  $("authSuccess").style.display = "block";
  $("authError").textContent = "";
}

function highlightField(fieldId) {
  const field = $(fieldId);
  if (field) {
    field.classList.add("error");
    setTimeout(() => field.classList.remove("error"), 3000);
  }
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

// ── LANDING PAGE ────────────────────────────────────────────────────────────
function showLandingPage() {
  if ($("landingPage")) {
    $("landingPage").classList.remove("hidden");
  }
  if ($("appContainer")) {
    $("appContainer").classList.add("hidden");
  }
}

function hideLandingPage() {
  if ($("landingPage")) {
    $("landingPage").classList.add("hidden");
  }
  if ($("appContainer")) {
    $("appContainer").classList.remove("hidden");
  }
}

// ── CONFIG ──────────────────────────────────────────────────────────────────
const DAILY_QUOTA_MB = 1500;
const SIMULATE_INTERVAL_MS = 8000; // new event every 8s
const APPS = [
  "YouTube",
  "Netflix",
  "Instagram",
  "WhatsApp",
  "Chrome",
  "Hotstar",
  "Spotify",
];
// const LOCS = ["Home", "Office", "Mall", "Metro", "Cafe", "Outdoor", "Basement"];
// ── STATE ────────────────────────────────────────────────────────────────────
let state = {
  currentNetwork: null,
  used4g: 0,
  used5g: 0,
  events: [],
  alerts: [],
  alertCount: 0,
  userLat: null,
  userLng: null,
  map: null,
  userMarker: null,
  simulatedZoneMarkers: [],
  lastNetwork: null,
  warned75: false,
  user: {
    email: null,
    isGuest: false,
    isAuthenticated: false,
  },
};
// ── DOM SHORTCUTS ─────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
// ── CLOCK ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString("en-IN", { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();
// ── NOTIFICATION SOUND ──────────────────────────────────────────────────────
let audioContext = null;

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playNotificationSound() {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(1000, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);

    osc.frequency.setValueAtTime(1200, now + 0.4);
    gain.gain.setValueAtTime(0.3, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.start(now + 0.4);
    osc.stop(now + 0.7);
  } catch (e) {
    console.log("Audio playback not available");
  }
}

// ── NAVIGATION ───────────────────────────────────────────────────────────────
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const sec = item.dataset.section;
    document
      .querySelectorAll(".nav-item")
      .forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
    document
      .querySelectorAll(".section")
      .forEach((s) => s.classList.remove("active"));
    $("sec-" + sec).classList.add("active");
    $("pageTitle").textContent = item.querySelector("span").textContent.trim();

    if (sec === "map" && !state.map) initMap();
    // close sidebar on mobile
    if (window.innerWidth <= 768) $("sidebar").classList.remove("open");
  });
});

// ── FIX #3: Sidebar toggle — push layout on desktop, overlay on mobile ────
$("menuToggle").addEventListener("click", () => {
  const sidebar = $("sidebar");
  const mainContent = document.querySelector(".main-content");
  const isOpen = sidebar.classList.toggle("open");

  // On desktop (>768px), toggle a class that collapses the sidebar
  if (window.innerWidth > 768) {
    document.body.classList.toggle("sidebar-collapsed", !isOpen);
  }
});

// ── TOAST NOTIFICATIONS ───────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 4000);
}
// ── PUSH ALERT ────────────────────────────────────────────────────────────────
function pushAlert(msg, type = "a-4g", icon = "fa-exclamation-triangle") {
  const list = $("alertList");
  const empty = list.querySelector(".feed-empty");
  if (empty) empty.remove();
  state.alertCount++;
  $("alertBadge").textContent = state.alertCount;
  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const div = document.createElement("div");
  div.className = `alert-item ${type}`;
  div.innerHTML = `
<i class="fas ${icon} alert-icon"></i>
<span class="alert-msg">${msg}</span>
<span class="alert-time">${time}</span>`;
  list.prepend(div);
  state.alerts.unshift({ msg, type, time });
  return div;
}
$("clearAlerts").addEventListener("click", () => {
  $("alertList").innerHTML = '<div class="feed-empty">No alerts yet.</div>';
  state.alertCount = 0;
  state.alerts = [];
  $("alertBadge").textContent = "0";
});
// ── RENDER STAT CARDS ─────────────────────────────────────────────────────────
function renderStats() {
  // Ensure 4G usage never exceeds daily quota
  const used4g = Math.min(state.used4g, DAILY_QUOTA_MB);
  const quotaRemaining = DAILY_QUOTA_MB - used4g;
  const percentage = ((used4g / DAILY_QUOTA_MB) * 100).toFixed(1);

  // Display stats
  $("total5g").textContent = formatMB(state.used5g);
  $("total4g").textContent = formatMB(used4g);
  $("quotaLeft").textContent = formatMB(quotaRemaining);
  $("quotaPercent").textContent = percentage + "%";

  // Verify relationship: used4g + quotaRemaining = DAILY_QUOTA_MB
  console.log(`📊 Daily Quota Check: ${used4g.toFixed(1)} MB + ${quotaRemaining.toFixed(1)} MB = ${(used4g + quotaRemaining).toFixed(1)} MB (Total: ${DAILY_QUOTA_MB} MB)`);

  const fill = $("quotaFill");
  fill.style.width = percentage + "%";
  fill.classList.toggle("danger", percentage >= 70);

  const events = state.events;
  $("sumEvents").textContent = events.length;
  $("sum5gEvents").textContent = events.filter((e) => e.net === "5G").length;
  $("sum4gEvents").textContent = events.filter((e) => e.net === "4G").length;
  $("sumFallbacks").textContent = state.alerts.filter(
    (a) => a.type === "a-4g",
  ).length;
}
function formatMB(mb) {
  return mb >= 1000 ? (mb / 1000).toFixed(2) + " GB" : mb.toFixed(1) + " MB";
}
// ── SIGNAL PILL UPDATE ────────────────────────────────────────────────────────
function updateSignalPill(net) {
  const pill = $("signalPill");
  const dot = $("pulseDot");
  const label = $("signalLabel");
  $("currentNetwork").textContent = net === "--" ? "--" : net;
  if (net === "5G") {
    dot.className = "pulse-dot on5g";
    label.textContent = "5G Active";
    pill.style.borderColor = "rgba(0,255,153,0.4)";
    label.style.color = "var(--accent-green)";
  } else if (net === "4G") {
    dot.className = "pulse-dot on4g";
    label.textContent = "4G Fallback";
    pill.style.borderColor = "rgba(255,140,0,0.4)";
    label.style.color = "var(--accent-orange)";
  } else {
    dot.className = "pulse-dot";
    label.textContent = "Detecting...";
    pill.style.borderColor = "";
    label.style.color = "";
  }
}
// ── EVENT FEED ─────────────────────────────────────────────────────────────────
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
// ── USAGE TABLE ────────────────────────────────────────────────────────────────
function refreshTable() {
  const tbody = $("usageTbody");
  const recent = state.events.slice(-10).reverse();
  if (recent.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty-row">No history yet.</td></tr>';
    return;
  }
  tbody.innerHTML = recent
    .map(
      (ev, i) => `
<tr>
<td>${i + 1}</td>
<td>${ev.time}</td>
<td><span class="chip ${ev.net === "5G" ? "chip-5g" : "chip-4g"}">${ev.net}</span></td>
<td>${ev.app}</td>
<td>${ev.data.toFixed(1)}</td>
<td>${ev.loc}</td>
<td><span class="chip ${ev.net === "5G" ? "chip-ok" : "chip-warn"}">${
        ev.net === "5G" ? "Free" : "Quota"
      }</span></td>
</tr>`,
    )
    .join("");
}
// ── SIMULATE NETWORK EVENTS ───────────────────────────────────────────────────
function simulateEvent() {
  const net = Math.random() < 0.6 ? "5G" : "4G";
  const app = APPS[Math.floor(Math.random() * APPS.length)];
  const data = +(Math.random() * 20 + 20).toFixed(1);
  let lat = state.userLat;
  let lng = state.userLng;

  // add small realistic movement (jitter ~10–30 meters)
  if (lat && lng) {
    const jitter = 0.0002; // ~20m
    lat += (Math.random() - 0.5) * jitter;
    lng += (Math.random() - 0.5) * jitter;
  }

  const loc = lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Unknown";
  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const ev = { net, app, data, lat, lng, loc, time };
  state.events.push(ev);

  if (net === "5G") {
    state.used5g += data;
  } else {
    // ── 4G: Cap data consumption to daily quota ──
    // Relationship: used4g + quotaRemaining = DAILY_QUOTA_MB (always)
    const remaining = DAILY_QUOTA_MB - state.used4g;

    if (remaining > 0) {
      const consumed = Math.min(data, remaining);
      state.used4g += consumed;

      // Track wasted data after quota exhaustion
      if (data > remaining) {
        pushAlert(
          `⚠️ 4G quota exhausted. Extra ${(data - remaining).toFixed(1)} MB ignored.`,
          "a-warn",
          "fa-ban",
        );
      }
    }
  }
  if (state.lastNetwork === "5G" && net === "4G") {
    playNotificationSound();
    showToast(
      `⚠️ Fallback! Switched to 4G at ${loc} — ${app} now using quota.`,
      "toast-4g",
    );
    const alertItem = pushAlert(
      `Fallback to 4G detected at <strong>${loc}</strong> while using <strong>${app}</strong>. ${data.toFixed(1)} MB deducted from quota.`,
      "a-4g",
      "fa-exclamation-triangle",
    );
    if (alertItem) {
      alertItem.classList.add("ring-effect");
    }
  } else if (state.lastNetwork === "4G" && net === "5G") {
    showToast(`✅ Back on 5G at ${loc}! Data is now unlimited.`, "toast-5g");
    pushAlert(
      `Restored to 5G at <strong>${loc}</strong>. Enjoy unlimited data!`,
      "a-5g",
      "fa-check-circle",
    );
  }
  const used4gPct = (state.used4g / DAILY_QUOTA_MB) * 100;
  if (used4gPct >= 90 && state.lastNetwork !== "4G_WARN90") {
    showToast("🚨 90% of your 4G quota used!", "toast-warn");
    pushAlert(
      "You have used <strong>90%</strong> of your daily 4G quota. Consider switching to Wi-Fi.",
      "a-warn",
      "fa-radiation",
    );
    state.lastNetwork = "4G_WARN90";
  } else if (used4gPct >= 75 && !state.warned75) {
    showToast("⚠️ 75% of your 4G quota used!", "toast-warn");
    pushAlert(
      "You have used <strong>75%</strong> of your daily 4G quota.",
      "a-warn",
      "fa-exclamation-circle",
    );
    state.warned75 = true;
  }
  state.lastNetwork = net;
  state.currentNetwork = net;
  updateSignalPill(net);
  addFeedItem(ev);
  refreshTable();
  renderStats();
  updateUserMapMarker(net);
}
// ── MAP ────────────────────────────────────────────────────────────────────────
function initMap() {
  const lat = state.userLat || 20.5937;
  const lng = state.userLng || 78.9629;
  state.map = L.map("map", { zoomControl: true }).setView(
    [lat, lng],
    state.userLat ? 13 : 5,
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(state.map);

  generateSimulatedZones(lat, lng);
  if (state.userLat) placeUserMarker(lat, lng, state.currentNetwork || "5G");
}
function generateSimulatedZones(centerLat, centerLng) {
  const zones = [
    { type: "5G", offsetLat: 0, offsetLng: 0, label: "City Center — 5G Zone" },
    {
      type: "5G",
      offsetLat: 0.03,
      offsetLng: 0.04,
      label: "Tech Park — 5G Zone",
    },
    {
      type: "5G",
      offsetLat: -0.02,
      offsetLng: 0.05,
      label: "Business Hub — 5G Zone",
    },
    {
      type: "4G",
      offsetLat: 0.06,
      offsetLng: -0.04,
      label: "Suburbs — 4G Zone",
    },
    {
      type: "4G",
      offsetLat: -0.05,
      offsetLng: -0.03,
      label: "Outskirts — 4G Zone",
    },
    {
      type: "4G",
      offsetLat: 0.07,
      offsetLng: 0.07,
      label: "Industrial Area — 4G",
    },
    {
      type: "5G",
      offsetLat: -0.04,
      offsetLng: 0.08,
      label: "Airport Zone — 5G",
    },
    {
      type: "4G",
      offsetLat: 0.09,
      offsetLng: -0.07,
      label: "Rural Edge — 4G Zone",
    },
  ];
  zones.forEach((z) => {
    const lat = centerLat + z.offsetLat;
    const lng = centerLng + z.offsetLng;
    const color = z.type === "5G" ? "#00ff99" : "#ff8c00";
    const radius = z.type === "5G" ? 1800 : 2500;
    const circle = L.circle([lat, lng], {
      color: color,
      fillColor: color,
      fillOpacity: 0.12,
      weight: 2,
      radius,
    }).addTo(state.map);
    circle.bindPopup(`
<div style="font-family:Inter,sans-serif;font-size:13px">
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
    html: `<div style="
width:20px;height:20px;
background:${color};
border:3px solid #fff;
border-radius:50%;
box-shadow:0 0 16px ${color};
"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  state.userMarker = L.marker([lat, lng], { icon })
    .addTo(state.map)
    .bindPopup(
      `<strong style="color:${color}">📍 You are here</strong><br/>
<span style="color:#8a9bc5">Network: ${network}</span><br/>
<span style="color:#8a9bc5;font-size:11px">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>`,
    )
    .openPopup();
}
function updateUserMapMarker(network) {
  if (state.map && state.userLat)
    placeUserMarker(state.userLat, state.userLng, network);
}
// ── GEOLOCATION ────────────────────────────────────────────────────────────────
function initGeolocation() {
  if (!navigator.geolocation) {
    $("mapInfoBar").innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> Geolocation not supported. Using simulated India center.';
    state.userLat = 20.5937;
    state.userLng = 78.9629;
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userLat = pos.coords.latitude;
      state.userLng = pos.coords.longitude;
      const acc = pos.coords.accuracy.toFixed(0);
      $("mapInfoBar").innerHTML =
        `<i class="fas fa-location-dot"></i> Location acquired — Lat: ${state.userLat.toFixed(5)}, Lng: ${state.userLng.toFixed(5)} (±${acc}m accuracy)`;
      showToast(
        "📍 Location acquired! Map initialised with your position.",
        "toast-5g",
      );
      pushAlert(
        `Your location was detected at <strong>${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)}</strong>. Map zones loaded.`,
        "a-5g",
        "fa-location-dot",
      );
      if (state.map) {
        state.map.setView([state.userLat, state.userLng], 13);
        generateSimulatedZones(state.userLat, state.userLng);
        placeUserMarker(
          state.userLat,
          state.userLng,
          state.currentNetwork || "5G",
        );
      }
    },
    (err) => {
      $("mapInfoBar").innerHTML =
        `<i class="fas fa-triangle-exclamation"></i> Location access denied (${err.message}). Using simulated center.`;
      state.userLat = 20.5937;
      state.userLng = 78.9629;
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
  navigator.geolocation.watchPosition(
    (pos) => {
      const newLat = pos.coords.latitude;
      const newLng = pos.coords.longitude;
      const dist = getDistanceM(state.userLat, state.userLng, newLat, newLng);
      if (dist > 50) {
        state.userLat = newLat;
        state.userLng = newLng;
        $("mapInfoBar").innerHTML =
          `<i class="fas fa-location-dot"></i> Location updated — Lat: ${newLat.toFixed(5)}, Lng: ${newLng.toFixed(5)}`;
        updateUserMapMarker(state.currentNetwork || "5G");
        checkZoneEntry(newLat, newLng);
      }
    },
    null,
    { enableHighAccuracy: true },
  );
}
function getDistanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// ── ZONE ENTRY DETECTION ──────────────────────────────────────────────────────
let lastZoneType = null;
function checkZoneEntry(lat, lng) {
  state.simulatedZoneMarkers.forEach((circle) => {
    const cLat = circle.getLatLng().lat;
    const cLng = circle.getLatLng().lng;
    const dist = getDistanceM(lat, lng, cLat, cLng);
    if (dist < circle.getRadius()) {
      const type = circle.options.color === "#00ff99" ? "5G" : "4G";
      if (type !== lastZoneType) {
        lastZoneType = type;
        if (type === "5G") {
          showToast(
            "📶 You entered a 5G zone! Unlimited data active.",
            "toast-5g",
          );
          pushAlert(
            "You have entered a <strong>5G coverage zone</strong>. Unlimited data is now active!",
            "a-5g",
            "fa-signal",
          );
        } else {
          showToast(
            "📉 You entered a 4G zone. Quota will be consumed.",
            "toast-4g",
          );
          pushAlert(
            "You have entered a <strong>4G-only zone</strong>. Data usage will deduct from your quota.",
            "a-4g",
            "fa-triangle-exclamation",
          );
        }
      }
    }
  });
}
// ── INIT ───────────────────────────────────────────────────────────────────────
function init() {
  const user = getCurrentUser();
  if (user && user.isAuthenticated) {
    // User already logged in - show dashboard
    state.user = user;
    hideLandingPage();
    hideAuthModal();
    updateUserDisplay();
    startSimulation();
  } else {
    // New user - show landing page
    showLandingPage();
    hideAuthModal();
  }

  renderStats();
}

// ── AUTHENTICATION EVENT LISTENERS ──────────────────────────────────────────
let isSignupMode = false;

$("authForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("authEmail").value;
  const password = $("authPassword").value;
  authenticateUser(email, password, isSignupMode);
});

// ── REAL-TIME EMAIL VALIDATION ──────────────────────────────────────────
$("authEmail").addEventListener("blur", () => {
  const email = $("authEmail").value.trim();
  if (email && !validateEmail(email)) {
    $("authEmail").classList.add("error");
  } else {
    $("authEmail").classList.remove("error");
  }
});

$("authEmail").addEventListener("input", () => {
  const email = $("authEmail").value.trim();
  if (!email) {
    $("authEmail").classList.remove("error");
  } else if (validateEmail(email)) {
    $("authEmail").classList.remove("error");
  }
});

$("toggleLink").addEventListener("click", (e) => {
  e.preventDefault();
  isSignupMode = !isSignupMode;
  if (isSignupMode) {
    $("authTitle").textContent = "Sign Up";
    $("toggleText").textContent = "Already have an account?";
    $("authSubmitBtn").textContent = "Sign Up";
  } else {
    $("authTitle").textContent = "Sign In";
    $("toggleText").textContent = "Don't have an account?";
    $("authSubmitBtn").textContent = "Sign In";
  }
  clearAuthForm();
});

$("guestBtn").addEventListener("click", (e) => {
  e.preventDefault();
  guestMode();
});

$("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  logoutUser();
});

// ── LANDING PAGE EVENT LISTENERS ───────────────────────────────────────────
if ($("getStartedBtn")) {
  $("getStartedBtn").addEventListener("click", () => {
    hideLandingPage();
    showAuthModal();
    clearAuthForm();
  });
}

if ($("guestAccessBtn")) {
  $("guestAccessBtn").addEventListener("click", () => {
    hideLandingPage();
    guestMode();
  });
}

document.addEventListener("DOMContentLoaded", init);
