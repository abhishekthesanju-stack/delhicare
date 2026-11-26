const firebaseConfig = {
  apiKey: "AIzaSyAKTg6rCJv0bC7LvBMhaqf82BGgePcyDSQ",
  authDomain: "://firebaseapp.com",
  projectId: "delhicare-live.firebaseapp.com",,
  storageBucket: "delhicare-live.firebasestorage.app",
  messagingSenderId: "529335396789",
  appId: "1:529335396789:web:dad6d3ecc2420a9e4bd1fc"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const colRef = db.collection("facilities");

const starterHospitals = [
  {
    name: "Satyawadi Raja Harish Chandra Hospital",
    type: "Hospital", area: "Narela, North Delhi", phone: "011-27787304",
    lat: 28.8527, lon: 77.0929, generalBeds: 18, icuBeds: 3, updatedAt: "Live",
    rates: "OPD: Free (Govt) | Lab Tests: Free / Subsidized",
    facilities: "24x7 Emergency, X-Ray, Ultrasound, Maternity, Blood Bank",
    faculty: "Dr. R.K. Sharma (Medicine), Dr. Neha Gupta (Gynae), Dr. Amit Verma (Ortho)",
    rating: "4.2", reviews: [{ user: "Rahul K.", rating: 4, text: "Emergency service fast hai, subah OPD me bheed rehti hai." }]
  },
  {
    name: "Max Super Speciality Hospital",
    type: "Hospital", area: "Shalimar Bagh, Delhi", phone: "011-66422222",
    lat: 28.7276, lon: 77.1525, generalBeds: 12, icuBeds: 4, updatedAt: "Live",
    rates: "OPD: Rs. 1,000 - 1,500 | General Room: Rs. 4,500/day",
    facilities: "MRI, CT Scan, Cath Lab, 24x7 Trauma, Digital Lab Reports",
    faculty: "Dr. S.K. Arora (Cardiology), Dr. Pooja Malhotra (Neurology)",
    rating: "4.7", reviews: [{ user: "Sneha M.", rating: 5, text: "Doctors bahut experienced hain aur reports online turant mil jati hain." }]
  },
  {
    name: "Narela Polyclinic & Diagnostic Center",
    type: "Clinic", area: "Main Market, Narela, Delhi", phone: "098110-45210",
    lat: 28.8540, lon: 77.0950, generalBeds: 2, icuBeds: 0, updatedAt: "Live",
    rates: "OPD: Rs. 300 | CBC / Blood Sugar Test: Rs. 250",
    facilities: "Day-Care Beds, ECG, Pathology Lab, Pharmacy",
    faculty: "Dr. Manish Jindal (General Physician - MBBS, MD)",
    rating: "4.5", reviews: [{ user: "Vikram S.", rating: 5, text: "Choti bimari aur blood test ke liye Narela me best local clinic hai." }]
  },
  {
    name: "AIIMS (All India Institute of Medical Sciences)",
    type: "Hospital", area: "Ansari Nagar, South Delhi", phone: "011-26588500",
    lat: 28.5672, lon: 77.2100, generalBeds: 0, icuBeds: 0, updatedAt: "Live",
    rates: "OPD Card: Rs. 10 | Major Surgeries: Free / Minimal",
    facilities: "Super Speciality, Trauma Center, Organ Transplant, Online Reports",
    faculty: "Senior Professors & Specialists (All Departments)",
    rating: "4.8", reviews: [{ user: "Ankit D.", rating: 5, text: "Desh ka sabse behtareen ilaaj, par online appointment pehle book karein." }]
  }
];

let facilities = [...starterHospitals];
let currentTypeFilter = "all";
let currentBedFilter = "";
let currentView = "directory";

colRef.onSnapshot(snapshot => {
  if (snapshot.empty) {
    starterHospitals.forEach(item => colRef.add(item));
  } else {
    facilities = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    switchView(currentView);
  }
});

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.view === view));
  if (view === "directory") renderDirectory();
  if (view === "beds") renderBedBoard();
  if (view === "reports") renderReportsView();
}
function renderDirectory() {
  const container = document.getElementById("main-view");
  const query = (document.getElementById("query")?.value || "").toLowerCase();

  const filtered = facilities.filter(f => {
    const matchText = f.name.toLowerCase().includes(query) || f.area.toLowerCase().includes(query) || f.facilities.toLowerCase().includes(query) || f.faculty.toLowerCase().includes(query);
    const matchType = currentTypeFilter === "all" || f.type === currentTypeFilter;
    const matchBed = !currentBedFilter || (currentBedFilter === "available" && (f.generalBeds + f.icuBeds > 0)) || (currentBedFilter === "icu" && f.icuBeds > 0) || (currentBedFilter === "general" && f.generalBeds > 0);
    return matchText && matchType && matchBed;
  });

  const cardsHtml = filtered.length === 0
    ? "<p style='padding:20px;background:#fff;border-radius:12px;'>Koi hospital ya clinic nahi mila.</p>"
    : filtered.map(f => {
        const totalBeds = f.generalBeds + f.icuBeds;
        const bedBadge = totalBeds > 0
          ? "<span style='color:#15803d;font-weight:700;'>Available: " + totalBeds + " Beds (Gen: " + f.generalBeds + ", ICU: " + f.icuBeds + ")</span>"
          : "<span style='color:#dc2626;font-weight:700;'>No Beds Available</span>";
        const distTag = f.distance ? " - <b>" + f.distance.toFixed(1) + " km away</b>" : "";
        const idArg = f.docId || "";
        return "<article style='background:#fff;border:1px solid #e2e8e0;border-radius:14px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;'>" +
          "<div><div style='display:flex;justify-content:space-between;margin-bottom:8px;'>" +
          "<span style='font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;background:#dcfce7;color:#15803d;'>" + f.type + "</span>" +
          "<span style='font-size:12px;color:#15803d;font-weight:600;'>Live</span></div>" +
          "<h3 style='font-size:18px;margin-bottom:4px;'>" + f.name + "</h3>" +
          "<p style='font-size:13px;color:#555;margin-bottom:10px;'>Location: " + f.area + distTag + "</p>" +
          "<div style='background:#f8faf7;padding:10px;border-radius:8px;font-size:13px;margin-bottom:10px;border:1px solid #e6ece4;'>" + bedBadge + "</div>" +
          "<p style='font-size:13px;color:#333;'><b>Rates:</b> " + f.rates + "</p></div>" +
          "<div style='display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #f0f4ef;'>" +
          "<span style='font-size:14px;font-weight:600;'>Rating: " + f.rating + "/5 (" + (f.reviews ? f.reviews.length : 0) + ")</span>" +
          "<button class='button button-primary' type='button' onclick=\"openDetails('" + idArg + "', '" + f.name + "')\" style='padding:8px 14px;font-size:13px;'>View Details</button></div></article>";
      }).join("");

  container.innerHTML = "<div class='section-head'><div><div class='eyebrow section-eyebrow'>LIVE CLOUD DIRECTORY</div><h2>Explore hospitals & clinics</h2><p>Real-time synced data across Delhi.</p></div>" +
    "<button class='button button-primary' type='button' onclick='openAddModal()'>+ Add a clinic / hospital</button></div>" +
    "<div class='tabs-row' style='margin-bottom:20px;'><div class='filter-tabs'>" +
    "<button type='button' class='" + (currentTypeFilter === 'all' ? 'active' : '') + "' onclick=\"setTypeFilter('all')\">All (" + facilities.length + ")</button>" +
    "<button type='button' class='" + (currentTypeFilter === 'Hospital' ? 'active' : '') + "' onclick=\"setTypeFilter('Hospital')\">Hospitals</button>" +
    "<button type='button' class='" + (currentTypeFilter === 'Clinic' ? 'active' : '') + "' onclick=\"setTypeFilter('Clinic')\">Clinics</button></div>" +
    "<select onchange='setBedFilter(this.value)' style='padding:10px 14px;border-radius:10px;border:1px solid #d5ddd2;background:#fff;font-size:14px;'>" +
    "<option value=''>Any bed status</option><option value='available'>Beds available</option><option value='icu'>ICU beds available</option><option value='general'>General beds available</option></select></div>" +
    "<div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;'>" + cardsHtml + "</div>";
}

function setTypeFilter(type) { currentTypeFilter = type; renderDirectory(); }
function setBedFilter(val) { currentBedFilter = val; renderDirectory(); }
function renderBedBoard() {
  const rows = facilities.map(f => "<tr style='border-bottom:1px solid #eee;'><td style='padding:12px;'><b>" + f.name + "</b><br><small>" + f.area + " (" + f.type + ")</small></td><td style='padding:12px;font-weight:700;'>" + f.generalBeds + "</td><td style='padding:12px;font-weight:700;'>" + f.icuBeds + "</td><td style='padding:12px;'>" + f.updatedAt + "</td><td style='padding:12px;'><a href='tel:" + f.phone + "'>" + f.phone + "</a></td></tr>").join("");
  document.getElementById("main-view").innerHTML = "<div class='section-head'><div><h2>Delhi Real-Time Bed Availability</h2></div><button class='button button-outline' type='button' onclick='openStaffModal()'>Update Bed Count (Staff)</button></div><div style='overflow-x:auto;background:#fff;border-radius:14px;border:1px solid #e2e8e0;'><table style='width:100%;border-collapse:collapse;text-align:left;'><thead style='background:#f5f7f2;'><tr><th style='padding:12px;'>Hospital / Clinic</th><th style='padding:12px;'>General Beds</th><th style='padding:12px;'>ICU Beds</th><th style='padding:12px;'>Status</th><th style='padding:12px;'>Helpline</th></tr></thead><tbody>" + rows + "</tbody></table></div>";
}

function renderReportsView() {
  document.getElementById("main-view").innerHTML = "<div style='background:#fff;padding:24px;border-radius:16px;border:1px solid #e2e8e0;max-width:650px;margin:0 auto;'><h2>Search Live Lab & Diagnostic Reports</h2><p style='color:#555;margin:8px 0 16px;'>Apna Patient ID ya Mobile Number daal kar report check karein.</p><div style='display:flex;gap:10px;'><input id='rep-input' type='text' placeholder='Enter Patient ID (e.g. DL101)' style='flex:1;padding:12px;border:1px solid #ccc;border-radius:10px;'><button class='button button-primary' type='button' onclick='searchPatientReport()'>Find Report</button></div><div id='rep-output' style='margin-top:16px;'></div></div>";
}

function searchPatientReport() {
  const val = document.getElementById("rep-input").value.trim();
  const out = document.getElementById("rep-output");
  if (!val) { out.innerHTML = "<p style='color:#dc2626;'>Kripya Patient ID daalein.</p>"; return; }
  out.innerHTML = "<div style='padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;'><b style='color:#15803d;'>Report Found for ID: " + val + "</b><p style='margin-top:6px;'>Hospital: Satyawadi Raja Harish Chandra Hospital, Narela | Tests: CBC & Blood Sugar (Normal)</p></div>";
}

function openDetails(docId, name) {
  const f = facilities.find(item => (docId && item.docId === docId) || item.name === name);
  const reviewsHtml = (f.reviews || []).map(r => "<div style='background:#f8faf7;padding:10px;border-radius:8px;margin-bottom:8px;font-size:13px;'><b>" + r.user + "</b> (" + r.rating + "/5)<p>" + r.text + "</p></div>").join("");
  document.getElementById("dialog-content").innerHTML = "<h2>" + f.name + "</h2><p style='color:#555;margin-bottom:12px;'>" + f.area + " | Phone: " + f.phone + "</p><p><b>Beds Available:</b> General (" + f.generalBeds + ") | ICU (" + f.icuBeds + ")</p><p style='margin-top:8px;'><b>Rates:</b> " + f.rates + "</p><p style='margin-top:8px;'><b>Facilities:</b> " + f.facilities + "</p><p style='margin-top:8px;'><b>Doctors & Faculty:</b> " + f.faculty + "</p><h4 style='margin-top:14px;'>Reviews (" + f.rating + "/5)</h4><div style='max-height:130px;overflow-y:auto;margin:8px 0;'>" + reviewsHtml + "</div><div style='display:flex;gap:8px;margin-top:10px;'><input id='rev-name' placeholder='Name' style='width:100px;padding:8px;border:1px solid #ccc;border-radius:8px;'><select id='rev-star' style='padding:8px;border:1px solid #ccc;border-radius:8px;'><option value='5'>5</option><option value='4'>4</option><option value='3'>3</option><option value='2'>2</option><option value='1'>1</option></select><input id='rev-text' placeholder='Comment...' style='flex:1;padding:8px;border:1px solid #ccc;border-radius:8px;'><button class='button button-primary' type='button' onclick=\"submitReview('" + (f.docId || "") + "')\">Post</button></div>";
  document.getElementById("modal").showModal();
}

async function submitReview(docId) {
  if (!docId) { alert("Please wait for cloud sync."); return; }
  const f = facilities.find(item => item.docId === docId);
  const user = document.getElementById("rev-name").value.trim() || "Patient";
  const rating = Number(document.getElementById("rev-star").value);
  const text = document.getElementById("rev-text").value.trim();
  if (!text) return;
  const updatedReviews = [{ user, rating, text }, ...(f.reviews || [])];
  const newRating = (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1);
  await colRef.doc(docId).update({ reviews: updatedReviews, rating: newRating });
  document.getElementById("modal").close();
}

function openAddModal() {
  document.getElementById("dialog-content").innerHTML = "<h2>Add a Clinic or Hospital</h2><form onsubmit='saveNewFacility(event)' style='display:flex;flex-direction:column;gap:10px;margin-top:10px;'><input id='add-name' required placeholder='Hospital / Clinic Name' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><select id='add-type' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><option value='Clinic'>Clinic</option><option value='Hospital'>Hospital</option></select><input id='add-phone' required placeholder='Phone Number' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><input id='add-area' required placeholder='Area / Address' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><input id='add-gen' type='number' min='0' required placeholder='General Beds' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><input id='add-icu' type='number' min='0' required placeholder='ICU Beds' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><input id='add-rates' required placeholder='Rates (e.g. OPD Rs 300)' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><input id='add-fac' required placeholder='Facilities' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><input id='add-doc' required placeholder='Doctors & Faculty' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><button class='button button-primary' type='submit'>Save to Live Cloud</button></form>";
  document.getElementById("modal").showModal();
}

async function saveNewFacility(e) {
  e.preventDefault();
  await colRef.add({
    name: document.getElementById("add-name").value.trim(), type: document.getElementById("add-type").value,
    phone: document.getElementById("add-phone").value.trim(), area: document.getElementById("add-area").value.trim(),
    lat: 28.85, lon: 77.09, generalBeds: Number(document.getElementById("add-gen").value), icuBeds: Number(document.getElementById("add-icu").value),
    updatedAt: "Live", rates: document.getElementById("add-rates").value.trim(), facilities: document.getElementById("add-fac").value.trim(),
    faculty: document.getElementById("add-doc").value.trim(), rating: "5.0", reviews: [{ user: "Admin", rating: 5, text: "Verified live listing." }]
  });
  document.getElementById("modal").close();
}

function openStaffModal() {
  const options = facilities.map(f => "<option value='" + (f.docId || "") + "'>" + f.name + "</option>").join("");
  document.getElementById("dialog-content").innerHTML = "<h2>Staff & Admin Workspace</h2><form onsubmit='updateStaffBeds(event)' style='display:flex;flex-direction:column;gap:10px;margin-top:10px;'><select id='staff-hosp' style='padding:10px;border:1px solid #ccc;border-radius:8px;'>" + options + "</select><input id='staff-gen' type='number' min='0' required placeholder='General Beds' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><input id='staff-icu' type='number' min='0' required placeholder='ICU Beds' style='padding:10px;border:1px solid #ccc;border-radius:8px;'><button class='button button-primary' type='submit'>Update Live Status</button></form>";
  document.getElementById("modal").showModal();
}

async function updateStaffBeds(e) {
  e.preventDefault();
  const docId = document.getElementById("staff-hosp").value;
  if (!docId) { alert("Please wait for cloud sync."); return; }
  await colRef.doc(docId).update({
    generalBeds: Number(document.getElementById("staff-gen").value),
    icuBeds: Number(document.getElementById("staff-icu").value),
    updatedAt: "Updated just now"
  });
  document.getElementById("modal").close();
}

function useMyLocation() {
  const status = document.getElementById("location-status");
  status.hidden = false;
  if (!navigator.geolocation) { status.innerText = "GPS support nahi hai."; return; }
  status.innerText = "Aapki location dhoondh rahe hain...";
  navigator.geolocation.getCurrentPosition(pos => {
    const uLat = pos.coords.latitude, uLon = pos.coords.longitude;
    facilities.forEach(f => {
      const R = 6371, dLat = (f.lat - uLat) * Math.PI / 180, dLon = (f.lon - uLon) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(uLat * Math.PI/180) * Math.cos(f.lat * Math.PI/180) * Math.sin(dLon/2)**2;
      f.distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    });
    facilities.sort((a, b) => a.distance - b.distance);
    status.innerText = "Aapki location ke hisaab se sabse nazdeeki hospitals upar hain:";
    renderDirectory();
  }, () => { status.innerText = "Location permission allow nahi hui."; });
}

renderDirectory();
