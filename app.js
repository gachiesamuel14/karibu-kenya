const COUNTIES = ["Nairobi","Mombasa","Kisumu","Kiambu","Nakuru","Uasin Gishu","Machakos","Kajiado","Kilifi","Nyeri","Meru","Kakamega","Kisii","Bungoma","Laikipia"];
const DEMO = [
  { id:"p1", name:"Amina", age:26, county:"Mombasa", tribe:"Swahili", religion:"Muslim", mode:"Professional", bio:"Coastal evenings, chai, and conversations that last too long.", interests:["Travel","Cooking","Art"], photo:"https://images.unsplash.com/photo-1531123897727-8f1f997e0c2d?auto=format&fit=crop&w=900&q=80", lat:-4.0435, lng:39.6682 },
  { id:"p2", name:"Brian", age:29, county:"Nairobi", tribe:"Kikuyu", religion:"Christian", mode:"Professional", bio:"Product designer who still shows up for Sunday nyama choma.", interests:["Tech","Football","Hiking"], photo:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80", lat:-1.2921, lng:36.8219 },
  { id:"p3", name:"Wanjiku", age:24, county:"Kiambu", tribe:"Kikuyu", religion:"Christian", mode:"Student", bio:"Campus life, late-night group work, and unexpected road trips.", interests:["Poetry","Travel","Afrobeats"], photo:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80", lat:-1.1714, lng:36.8356 },
  { id:"p4", name:"Otieno", age:31, county:"Kisumu", tribe:"Luo", religion:"Christian", mode:"Professional", bio:"Lakeside sunsets and someone who can debate without shouting.", interests:["Football","Cooking","Gym"], photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80", lat:-0.0917, lng:34.7680 },
  { id:"p5", name:"Faith", age:27, county:"Nakuru", tribe:"Kalenjin", religion:"Christian", mode:"Church", bio:"Quiet mornings, long walks, and a faith that actually shows up.", interests:["Church","Hiking","Farming"], photo:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80", lat:-0.3031, lng:36.0800 },
  { id:"p6", name:"Hassan", age:33, county:"Nairobi", tribe:"Somali", religion:"Muslim", mode:"Professional", bio:"Building things. Looking for someone grounded, not performative.", interests:["Startups","Gym","Travel"], photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80", lat:-1.2864, lng:36.8172 },
  { id:"p7", name:"Chep", age:23, county:"Uasin Gishu", tribe:"Kalenjin", religion:"Christian", mode:"Student", bio:"Eldoret mornings, track energy, and playlists that slap.", interests:["Gym","Afrobeats","Travel"], photo:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80", lat:0.5143, lng:35.2698 },
  { id:"p8", name:"Mwende", age:28, county:"Machakos", tribe:"Kamba", religion:"Christian", mode:"Professional", bio:"Soft life with a work ethic. Take me somewhere with good chapati.", interests:["Cooking","Art","Hiking"], photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80", lat:-1.5177, lng:37.2634 }
];
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};
function haversine(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371, toR = x => x * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s)));
}
const state = {
  view: "home",
  user: store.get("karibu_user", null),
  likes: store.get("karibu_likes", []),
  passes: store.get("karibu_passes", []),
  matches: store.get("karibu_matches", []),
  chats: store.get("karibu_chats", {}),
  reports: store.get("karibu_reports", []),
  filters: { county: "", maxKm: 250, minAge: 21, maxAge: 40, mode: "", religion: "" },
  activeChat: null,
  location: store.get("karibu_loc", null),
  toast: ""
};
function save() {
  store.set("karibu_user", state.user);
  store.set("karibu_likes", state.likes);
  store.set("karibu_passes", state.passes);
  store.set("karibu_matches", state.matches);
  store.set("karibu_chats", state.chats);
  store.set("karibu_reports", state.reports);
  store.set("karibu_loc", state.location);
}
function toast(msg) { state.toast = msg; render(); setTimeout(() => { state.toast = ""; render(); }, 2400); }
function deck() {
  const me = state.user;
  return DEMO.filter(p => {
    if (state.likes.includes(p.id) || state.passes.includes(p.id)) return false;
    if (state.filters.county && p.county !== state.filters.county) return false;
    if (state.filters.mode && p.mode !== state.filters.mode) return false;
    if (state.filters.religion && p.religion !== state.filters.religion) return false;
    if (p.age < state.filters.minAge || p.age > state.filters.maxAge) return false;
    if (me && me.lat != null) {
      const km = haversine(me, p);
      if (km != null && km > Number(state.filters.maxKm)) return false;
    }
    return true;
  });
}
function requestLocation() {
  if (!navigator.geolocation) return toast("Geolocation is not supported in this browser.");
  navigator.geolocation.getCurrentPosition(pos => {
    state.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (state.user) { state.user.lat = state.location.lat; state.user.lng = state.location.lng; }
    save(); toast("Location updated. Nearby matches will use your coordinates.");
  }, () => toast("Location permission denied. You can still filter by county."));
}
function like(person) {
  if (!state.user) { state.view = "auth"; return render(); }
  state.likes.push(person.id);
  const mutual = person.id === "p2" || person.id === "p3" || person.id === "p5" || Math.random() > 0.45;
  if (mutual && !state.matches.find(m => m.id === person.id)) {
    state.matches.push(person);
    state.chats[person.id] = state.chats[person.id] || [{ from: person.name, text: `Karibu ${state.user.name.split(" ")[0]} 👋 saw you are around ${person.county}.` }];
    toast(`It's a match with ${person.name}!`);
  } else toast(`You liked ${person.name}.`);
  save(); render();
}
function pass(person) { state.passes.push(person.id); save(); render(); }
function sendChat(id, text) {
  if (!text.trim()) return;
  state.chats[id] = state.chats[id] || [];
  state.chats[id].push({ from: "me", text: text.trim() });
  save(); render();
  setTimeout(() => {
    state.chats[id].push({ from: DEMO.find(p => p.id === id)?.name || "Them", text: "Haha noted. When are you free this week?" });
    save(); render();
  }, 900);
}
function report(person) {
  const reason = prompt("Why are you reporting this profile? (spam, harassment, fake, underage, other)");
  if (!reason) return;
  state.reports.push({ id: person.id, reason, at: Date.now() });
  state.passes.push(person.id); save(); toast("Report received. Thanks for helping keep Karibu safe.");
}
function topbar() {
  return `<div class="topbar wrap"><div class="brand"><div class="mark">K</div> Karibu</div><div class="nav">
    <button class="${state.view==="home"?"active":""}" data-go="home">Home</button>
    <button class="${state.view==="discover"?"active":""}" data-go="discover">Discover</button>
    <button class="${state.view==="matches"?"active":""}" data-go="matches">Matches</button>
    <button class="${state.view==="chat"?"active":""}" data-go="chat">Chat</button>
    <button class="${state.view==="profile"?"active":""}" data-go="profile">Profile</button>
    ${state.user ? `<button class="ghost" id="logout">Log out</button>` : `<button class="primary" data-go="auth">Join</button>`}
  </div></div>`;
}
function home() {
  return `${topbar()}<section class="wrap hero"><div>
    <div class="kicker">Location-based matchmaking · Kenya</div>
    <h1>Meet people<br>who are actually<br>nearby.</h1>
    <p class="lead">Karibu is built for Nairobi, Mombasa, Kisumu, Kiambu and everywhere in between. Filter by county, distance, tribe, faith, or mode.</p>
    <div class="cta-row"><button class="primary" data-go="${state.user ? "discover" : "auth"}">Start matching</button><button class="ghost" id="loc-btn">Use my location</button></div>
    <div class="stats"><div><b>47</b>counties</div><div><b>GPS</b>nearby first</div><div><b>Safe</b>report & block</div></div>
  </div><div class="phone"><div class="card-stack"><article class="person-card"><img src="${DEMO[0].photo}" alt="" /><div class="card-meta"><h3>${DEMO[0].name}, ${DEMO[0].age}</h3><div class="muted">${DEMO[0].county} · ${DEMO[0].mode}</div><div class="pills">${DEMO[0].interests.map(i=>`<span class="pill">${i}</span>`).join("")}</div></div></article></div></div></section>
  <section class="wrap grid"><div class="panel"><h3>County + GPS</h3><p class="muted">Browser location when allowed, then rank by kilometres and county.</p></div><div class="panel"><h3>Kenyan filters</h3><p class="muted">Tribe, religion, lifestyle mode, age, and interests.</p></div><div class="panel"><h3>Chat after match</h3><p class="muted">Like, match, then talk. Report is one tap away.</p></div></section>`;
}
function auth() {
  const u = state.user || {};
  return `${topbar()}<form class="auth" id="auth-form"><div class="kicker">Create your Karibu profile</div>
    <h2 class="serif" style="font-size:36px;margin:8px 0 6px">Karibu Kenya.</h2>
    <p class="muted">This demo saves on your device.</p>
    <label>Full name</label><input name="name" required value="${u.name||""}" />
    <div class="row-2"><div><label>Age</label><input name="age" type="number" min="18" required value="${u.age||""}" /></div>
    <div><label>County</label><select name="county">${COUNTIES.map(c=>`<option ${u.county===c?"selected":""}>${c}</option>`).join("")}</select></div></div>
    <div class="row-2"><div><label>Tribe (optional)</label><input name="tribe" value="${u.tribe||""}" /></div>
    <div><label>Religion</label><select name="religion">${["Christian","Muslim","Hindu","Other / prefer not"].map(r=>`<option ${u.religion===r?"selected":""}>${r}</option>`).join("")}</select></div></div>
    <label>Mode</label><select name="mode">${["Student","Professional","Church"].map(m=>`<option ${u.mode===m?"selected":""}>${m}</option>`).join("")}</select>
    <label>Bio</label><textarea name="bio">${u.bio||""}</textarea>
    <label>Photo URL</label><input name="photo" value="${u.photo||""}" />
    <button class="primary" style="width:100%;margin-top:18px">Save & continue</button></form>`;
}
function discover() {
  const people = deck(); const person = people[0]; const me = state.user;
  const km = person && me ? haversine(me, person) : null;
  return `${topbar()}<div class="wrap discover"><aside class="panel filters"><div class="kicker">Filters</div><h3>Who’s nearby</h3>
    <label>County</label><select id="f-county"><option value="">Any county</option>${COUNTIES.map(c=>`<option ${state.filters.county===c?"selected":""}>${c}</option>`).join("")}</select>
    <label>Max distance (km)</label><input id="f-km" type="number" value="${state.filters.maxKm}" />
    <div class="row-2"><div><label>Min age</label><input id="f-min" type="number" value="${state.filters.minAge}" /></div><div><label>Max age</label><input id="f-max" type="number" value="${state.filters.maxAge}" /></div></div>
    <label>Mode</label><select id="f-mode"><option value="">Any</option><option>Student</option><option>Professional</option><option>Church</option></select>
    <label>Religion</label><select id="f-rel"><option value="">Any</option><option>Christian</option><option>Muslim</option><option>Hindu</option></select>
    <button class="primary" id="apply-filters">Apply filters</button><button class="ghost" id="loc-btn">Refresh GPS</button>
    <p class="muted" style="margin-top:12px">${state.location ? `GPS locked · ${state.location.lat.toFixed(3)}, ${state.location.lng.toFixed(3)}` : "GPS off — county filter still works."}</p></aside>
    <section>${person ? `<div class="stage"><article class="big-card"><img src="${person.photo}" alt="${person.name}" /><div class="card-meta"><h3>${person.name}, ${person.age}</h3><div class="muted">${person.county}${km!=null?` · ${km} km away`:""} · ${person.mode} · ${person.religion}</div><p style="margin-top:8px">${person.bio}</p><div class="pills">${person.interests.map(i=>`<span class="pill">${i}</span>`).join("")}${person.tribe?`<span class="pill">${person.tribe}</span>`:""}</div></div></article></div><div class="actions"><button class="circle nope" id="pass">✕</button><button class="circle" id="report">⚑</button><button class="circle like" id="like">♥</button></div>` : `<div class="panel"><h3>Deck is empty</h3><p class="muted">Loosen filters or reset likes from Profile.</p></div>`}</section></div>`;
}
function matches() {
  return `${topbar()}<div class="wrap"><div class="kicker">Mutual likes</div><h2 class="serif" style="font-size:42px;margin:8px 0 18px">Matches</h2><div class="match-list">${state.matches.length ? state.matches.map(m => `<div class="match-item"><img class="avatar" src="${m.photo}" alt="" /><div style="flex:1"><strong>${m.name}, ${m.age}</strong><div class="muted">${m.county} · ${m.mode}</div></div><button class="primary" data-chat="${m.id}">Open chat</button></div>`).join("") : `<p class="muted">No matches yet. Keep swiping on Discover.</p>`}</div></div>`;
}
function chat() {
  const person = state.matches.find(m => m.id === state.activeChat) || state.matches[0];
  const msgs = person ? (state.chats[person.id] || []) : [];
  return `${topbar()}<div class="wrap discover"><aside class="chat-list">${state.matches.map(m => `<button class="chat-item" data-chat="${m.id}"><img class="avatar" src="${m.photo}" alt="" /><div><strong>${m.name}</strong><div class="muted">${m.county}</div></div></button>`).join("") || `<p class="muted">Match someone first.</p>`}</aside><section class="panel chat-box">${person ? `<div class="bubbles">${msgs.map(m => `<div class="bubble ${m.from==="me"?"me":""}">${m.text}</div>`).join("")}</div><form class="composer" id="chat-form"><input name="text" placeholder="Write something kind..." autocomplete="off" /><button class="primary">Send</button></form>` : `<p class="muted">Pick a match to start chatting.</p>`}</section></div>`;
}
function profile() {
  const u = state.user;
  return `${topbar()}<div class="wrap" style="max-width:720px"><div class="panel"><div class="kicker">Your profile</div>${u ? `<h2 class="serif" style="font-size:40px">${u.name}, ${u.age}</h2><p class="muted">${u.county} · ${u.mode} · ${u.religion}</p><p style="margin:12px 0">${u.bio || ""}</p><div class="cta-row"><button class="primary" data-go="auth">Edit profile</button><button class="ghost" id="reset-deck">Reset likes / passes</button></div>` : `<p class="muted">Create a profile to start matching.</p><button class="primary" data-go="auth">Join Karibu</button>`}</div></div>`;
}
function render() {
  const root = document.getElementById("app");
  const pages = { home, auth, discover, matches, chat, profile };
  root.innerHTML = (pages[state.view] || home)() + (state.toast ? `<div class="toast">${state.toast}</div>` : "");
  bind();
}
function bind() {
  document.querySelectorAll("[data-go]").forEach(btn => btn.onclick = () => { state.view = btn.dataset.go; render(); });
  const logout = document.getElementById("logout");
  if (logout) logout.onclick = () => { state.user = null; save(); state.view = "home"; render(); };
  const loc = document.getElementById("loc-btn"); if (loc) loc.onclick = requestLocation;
  const form = document.getElementById("auth-form");
  if (form) form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (Number(data.age) < 18) return toast("You must be 18+.");
    state.user = { ...data, age: Number(data.age), photo: data.photo || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80", lat: state.location?.lat ?? -1.2921, lng: state.location?.lng ?? 36.8219 };
    save(); state.view = "discover"; toast("Profile saved. Sasa tunaenda discover.");
  };
  const apply = document.getElementById("apply-filters");
  if (apply) apply.onclick = () => {
    state.filters.county = document.getElementById("f-county").value;
    state.filters.maxKm = document.getElementById("f-km").value;
    state.filters.minAge = Number(document.getElementById("f-min").value);
    state.filters.maxAge = Number(document.getElementById("f-max").value);
    state.filters.mode = document.getElementById("f-mode").value;
    state.filters.religion = document.getElementById("f-rel").value;
    render();
  };
  const person = deck()[0];
  const likeBtn = document.getElementById("like"); const passBtn = document.getElementById("pass"); const reportBtn = document.getElementById("report");
  if (likeBtn && person) likeBtn.onclick = () => like(person);
  if (passBtn && person) passBtn.onclick = () => pass(person);
  if (reportBtn && person) reportBtn.onclick = () => report(person);
  document.querySelectorAll("[data-chat]").forEach(btn => btn.onclick = () => { state.activeChat = btn.dataset.chat; state.view = "chat"; render(); });
  const chatForm = document.getElementById("chat-form");
  if (chatForm) chatForm.onsubmit = e => { e.preventDefault(); sendChat(state.activeChat || state.matches[0]?.id, chatForm.text.value); chatForm.reset(); };
  const reset = document.getElementById("reset-deck");
  if (reset) reset.onclick = () => { state.likes = []; state.passes = []; save(); toast("Deck reset."); };
}
render();
