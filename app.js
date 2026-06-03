/**
 * Application Controller for WinnerSubmit SPA
 * Handles state management, local storage, search/filtering, dynamic ranked event-grouped winner inputs,
 * and seamless real-time Supabase cloud database synchronization with local storage fail-safes.
 */

// --- SUPABASE CONFIGURATION ---
// Paste your project's credentials here to activate cloud database mode
const SUPABASE_URL = "https://wrpngbrzlsdafcdvkszl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG5nYnJ6bHNkYWZjZHZrc3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzM2MjgsImV4cCI6MjA5NjA0OTYyOH0.Dz6Tf1xNdLBFUZAZ_HWWJQE26KIB0kJyMO4ioM3z-HA";

let supabaseClient = null;
let isCloudMode = false;

// Auto-detect and instantiate Supabase client
if (
  typeof supabase !== 'undefined' && 
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isCloudMode = true;
    console.info("WinnerSubmit: Connected to Supabase Cloud Database Registry.");
  } catch (err) {
    console.error("WinnerSubmit: Supabase client initialization failed.", err);
  }
} else {
  console.warn("WinnerSubmit: Supabase credentials not set. Running in Local Storage Fallback Mode.");
}

// --- Default Seed Data (Event-grouped schema) ---
const DEFAULT_WINNERS = [
  {
    uid: "8940-EV",
    eventName: "Batman Edition Design Contest",
    coordinator: "DR. HELENA WAYNE",
    coordinator2: "MR. LUCIUS FOX",
    coordinatorDept: "IT",
    winners: [
      {
        rank: "1st Place",
        name: "ALEXANDER VANCE",
        department: "Cybersecurity",
        semester: "S6",
        email: "a.vance@tech.edu",
        phone: "+1 555-0102",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeuD__wLqQzdV7kANKk7Ql7f2hah1g8-yw5FtJT9_OHdbAmIkJzfYJYMpi4LJqXASM_Y6EmAMeX9nU8mHd1vEuaSBouUnxMw1icHa1Zo9aLJvqmr4dC3KIaX0AA55JNTV7U-emAJdqXQTEJO6RfzJ-YNoy9hxq___b91Dgwctd47gpQzqoy33WIgMEOnDJZOzrLoDiRYtHaZ1I09-AgjmUHGMAHMg75Cv2hsfbntllA2R2QTpxSUShFx3t0iQeQ66SJPdVWiXSnR0O"
      },
      {
        rank: "2nd Place",
        name: "SARAH JENKINS",
        department: "Data Science",
        semester: "S4",
        email: "s.jenkins@data.edu",
        phone: "+1 555-0992",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd3ixrEsYkceOiOaZ6EDy4H4PSwztHQ2dYmTB7Ze6U_tN8RvA1NbhuemWdSFRCZwkANCylte57hrA_S1DZsUr3OFvJNxd5TdITEiP0e-Q9HNS_s4YXNp0TDu-o-zcoPQKLwEzcb90a476QilVwJ9n_TiEKI21PEvC7HZ0ahhfYGMryul5vuWouU7qnbntT76bHE6OC7RL9PBRoKOwv_Iv5N3Ptn66OP3mPerTzKXEgXVW91zgsuD2wU2p9T45yw7d_0rYFCb3BFMcT"
      },
      {
        rank: "3rd Place",
        name: "MARCUS DRAKE",
        department: "Mechanical Eng",
        semester: "S8",
        email: "m.drake@mech.edu",
        phone: "+1 555-0144",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClDgpzgtubujGPiVhRRxwO5plP9Zqz0QRY5X-kRCxEsXVunmbgceE5I1NmORBT0SkvGorCHNUPR8d40K1aEPLBJek3xqV6c7Dl0JlNza8G5cFGLJpF2G_83lOOtxNxDW5kACBvbG0-HYxmj36MsMUiE-8xmFonioLqQhL_HE6vtAolhUA6kEncH4Rqol924JnFzmvbKnDtKoOIrEhoFADRoNleU7pxg3anutgTLiw1wU9gdeqIAngsD8MXvNbnHYFfNlgnr4UgAJrb"
      }
    ]
  },
  {
    uid: "4012-EV",
    eventName: "Metropolis Retro Poster Showcase",
    coordinator: "MS. SELINA KYLE",
    coordinator2: "",
    coordinatorDept: "ADMIN",
    winners: [
      {
        rank: "Honorable Mention",
        name: "TIM DRAKE",
        department: "Computer Science",
        semester: "S3",
        email: "t.drake@cs.edu",
        phone: "+1 555-0919",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClDgpzgtubujGPiVhRRxwO5plP9Zqz0QRY5X-kRCxEsXVunmbgceE5I1NmORBT0SkvGorCHNUPR8d40K1aEPLBJek3xqV6c7Dl0JlNza8G5cFGLJpF2G_83lOOtxNxDW5kACBvbG0-HYxmj36MsMUiE-8xmFonioLqQhL_HE6vtAolhUA6kEncH4Rqol924JnFzmvbKnDtKoOIrEhoFADRoNleU7pxg3anutgTLiw1wU9gdeqIAngsD8MXvNbnHYFfNlgnr4UgAJrb"
      }
    ]
  }
];

// --- App State ---
let winnersData = [];

// --- DOM Elements ---
const tabButtons = document.querySelectorAll('.tab-btn');
const appSections = document.querySelectorAll('.app-section');
const winnerGrid = document.getElementById('winner-grid');

const searchInput = document.getElementById('search-input');
const filterDept = document.getElementById('filter-dept');
const filterSem = document.getElementById('filter-sem');
const filterRank = document.getElementById('filter-rank');

const submissionForm = document.getElementById('submission-form');
const winnersContainer = document.getElementById('winners-container');
const addWinnerBtn = document.getElementById('add-winner-btn');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupFilters();
  setupDynamicWinnersForm();
  setupFormSubmission();
  
  // Load data (performs Cloud sync or triggers local storage fallback)
  await initData();
  renderGrid();
});

// Load entries: attempts cloud database loading with dynamic seeding or local storage fallback
async function initData() {
  if (isCloudMode && supabaseClient) {
    showToast("Syncing with Supabase cloud database...");
    const success = await loadFromSupabase();
    if (success) {
      // If the cloud database table is completely empty, initialize it with seed data
      if (winnersData.length === 0) {
        showToast("Initializing cloud seed records...");
        for (const item of DEFAULT_WINNERS) {
          await saveToSupabase(item);
        }
        await loadFromSupabase();
      }
      showToast("Cloud sync successfully completed.");
      return;
    }
  }
  
  // Local Mode fallback
  loadFromLocalStorage();
}

function loadFromLocalStorage() {
  const localData = localStorage.getItem('winner_submissions');
  if (localData) {
    try {
      winnersData = JSON.parse(localData);
      const isValid = Array.isArray(winnersData) && winnersData.every(e => typeof e.eventName === 'string' && Array.isArray(e.winners));
      if (!isValid) throw new Error("Outdated schema structure detected");
    } catch (e) {
      console.warn("Outdated cache. Re-initializing...", e);
      winnersData = [...DEFAULT_WINNERS];
      localStorage.setItem('winner_submissions', JSON.stringify(winnersData));
    }
  } else {
    winnersData = [...DEFAULT_WINNERS];
    localStorage.setItem('winner_submissions', JSON.stringify(winnersData));
  }
}

// --- Supabase Cloud Sync Routines ---
async function loadFromSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from('events')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    if (data) {
      winnersData = data.map(item => ({
        uid: item.uid,
        eventName: item.event_name,
        coordinator: item.coordinator,
        coordinator2: item.coordinator_2 || "",
        coordinatorDept: item.coordinator_dept,
        winners: item.winners
      }));
      return true;
    }
  } catch (err) {
    console.error("WinnerSubmit: Failed to load from Supabase.", err);
  }
  return false;
}

async function saveToSupabase(event) {
  try {
    const { error } = await supabaseClient
      .from('events')
      .insert([
        {
          uid: event.uid,
          event_name: event.eventName,
          coordinator: event.coordinator,
          coordinator_2: event.coordinator2 || "",
          coordinator_dept: event.coordinatorDept,
          winners: event.winners
        }
      ]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("WinnerSubmit: Failed to save to Supabase.", err);
  }
  return false;
}

// --- Navigation Controller ---
function setupNavigation() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      switchTab(targetId);
    });
  });
}

function switchTab(targetId) {
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-target') === targetId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  appSections.forEach(section => {
    if (section.id === targetId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Filter & Search Controller ---
function setupFilters() {
  const triggerFilters = () => renderGrid();
  searchInput.addEventListener('input', triggerFilters);
  filterDept.addEventListener('change', triggerFilters);
  filterSem.addEventListener('change', triggerFilters);
  filterRank.addEventListener('change', triggerFilters);
}

// --- Dynamic Winners Inputs Logic ---
function setupDynamicWinnersForm() {
  resetWinnersForm();

  addWinnerBtn.addEventListener('click', () => {
    addWinnerBlock();
  });
}

function resetWinnersForm() {
  winnersContainer.innerHTML = '';
  addWinnerBlock();
}

function addWinnerBlock() {
  const index = winnersContainer.children.length;
  const block = document.createElement('div');
  block.className = 'winner-block-form';
  block.dataset.index = index;
  block.imageDataUrl = ''; // Attached locally in JS

  block.innerHTML = `
    <div class="winner-block-header">
      <span class="winner-block-title">Winner Details #${index + 1}</span>
      ${index > 0 ? `
        <button type="button" class="remove-winner-btn">
          <span class="material-symbols-outlined">delete</span> Remove
        </button>
      ` : ''}
    </div>
    
    <div class="inputs-row">
      <div class="input-group">
        <label>Placement Rank</label>
        <select class="input-field w-rank" required>
          <option value="" disabled selected>Select Rank</option>
          <option value="1st Place">1st Place</option>
          <option value="2nd Place">2nd Place</option>
          <option value="3rd Place">3rd Place</option>
          <option value="Honorable Mention">Honorable Mention</option>
        </select>
      </div>

      <div class="input-group">
        <label>Full Name</label>
        <input type="text" class="input-field w-name" placeholder="e.g. John Doe" required>
      </div>
      
      <div class="input-group">
        <label>Department</label>
        <input type="text" class="input-field w-dept" placeholder="e.g. Computer Science" required>
      </div>
      
      <div class="input-group">
        <label>Semester</label>
        <select class="input-field w-sem" required>
          <option value="" disabled selected>Select Semester</option>
          <option value="S1">S1</option>
          <option value="S2">S2</option>
          <option value="S3">S3</option>
          <option value="S4">S4</option>
          <option value="S5">S5</option>
          <option value="S6">S6</option>
          <option value="S7">S7</option>
          <option value="S8">S8</option>
        </select>
      </div>
      
      <div class="input-group">
        <label>Email ID</label>
        <input type="email" class="input-field w-email" placeholder="john.doe@university.edu" required>
      </div>
      
      <div class="input-group">
        <label>Phone Number</label>
        <input type="tel" class="input-field w-phone" placeholder="(555) 123-4567" required>
      </div>
      
      <div class="input-group col-span-2">
        <label>Winner Photo</label>
        <div class="file-upload-zone w-upload-zone">
          <input type="file" class="w-photo" accept="image/jpeg, image/png" required>
          <div class="upload-hud-content w-prompt">
            <span class="material-symbols-outlined">cloud_upload</span>
            <span class="upload-title">Upload portrait (JPG, PNG)</span>
            <span class="upload-subtitle">Drag & drop or click to browse</span>
          </div>
          <div class="upload-preview w-preview-container">
            <img class="w-preview-img" src="" alt="Winner preview">
          </div>
        </div>
      </div>
    </div>
  `;

  if (index > 0) {
    block.querySelector('.remove-winner-btn').addEventListener('click', () => {
      winnersContainer.removeChild(block);
      reindexWinners();
    });
  }

  bindBlockUploadEvents(block);
  winnersContainer.appendChild(block);
}

function reindexWinners() {
  Array.from(winnersContainer.children).forEach((block, idx) => {
    block.dataset.index = idx;
    const title = block.querySelector('.winner-block-title');
    title.textContent = `Winner Details #${idx + 1}`;
  });
}

function bindBlockUploadEvents(block) {
  const uploadZone = block.querySelector('.w-upload-zone');
  const fileInput = block.querySelector('.w-photo');
  const uploadPrompt = block.querySelector('.w-prompt');
  const uploadPreview = block.querySelector('.w-preview-container');
  const previewImage = block.querySelector('.w-preview-img');

  uploadZone.addEventListener('click', (e) => {
    if (e.target !== fileInput) {
      fileInput.click();
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--primary-accent)';
      uploadZone.style.backgroundColor = 'var(--bg-surface)';
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--outline-color)';
      uploadZone.style.backgroundColor = 'var(--bg-surface-lowest)';
    });
  });

  uploadZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) {
      fileInput.files = files;
      processBlockFile(files[0], block, uploadPrompt, uploadPreview, previewImage);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      processBlockFile(fileInput.files[0], block, uploadPrompt, uploadPreview, previewImage);
    }
  });
}

function processBlockFile(file, block, promptEl, previewEl, imgEl) {
  if (!file.type.startsWith('image/')) {
    showToast("Invalid format. Please upload JPG or PNG.", true);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    block.imageDataUrl = e.target.result;
    imgEl.src = block.imageDataUrl;
    promptEl.style.display = 'none';
    previewEl.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// --- Form Submission Compilation ---
function setupFormSubmission() {
  submissionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const winnerBlocks = Array.from(winnersContainer.children);
    let validationFailed = false;
    const winnersArray = [];

    // Gather event metadata
    const eventName = document.getElementById('event_name').value.trim();
    const coordName = document.getElementById('coord_name').value.trim();
    const coordName2 = document.getElementById('coord_name_2').value.trim();
    const coordDept = document.getElementById('coord_dept').value.trim();

    winnerBlocks.forEach((block, idx) => {
      const name = block.querySelector('.w-name').value.trim();
      const rank = block.querySelector('.w-rank').value;
      const dept = block.querySelector('.w-dept').value.trim();
      const sem = block.querySelector('.w-sem').value;
      const email = block.querySelector('.w-email').value.trim();
      const phone = block.querySelector('.w-phone').value.trim();
      const image = block.imageDataUrl;

      if (!image) {
        showToast(`Photo missing for Winner #${idx + 1}.`, true);
        validationFailed = true;
        return;
      }

      winnersArray.push({
        rank: rank,
        name: name.toUpperCase(),
        department: dept,
        semester: sem,
        email: email,
        phone: phone,
        image: image
      });
    });

    if (validationFailed) return;

    // Generate unique Event UID: [Random 4 digit]-EV
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedUid = `${randomNum}-EV`;

    const newEvent = {
      uid: generatedUid,
      eventName: eventName,
      coordinator: coordName.toUpperCase(),
      coordinator2: coordName2.toUpperCase(),
      coordinatorDept: coordDept.substring(0, 5).toUpperCase(),
      winners: winnersArray
    };

    // Save to cloud if active, fallback to localStorage
    if (isCloudMode && supabaseClient) {
      showToast("Syncing submission to Supabase cloud...");
      const saved = await saveToSupabase(newEvent);
      if (saved) {
        await loadFromSupabase(); // Refetch database
        showToast(`Cloud Registered: ${eventName}`);
      } else {
        // Fallback save locally
        winnersData.unshift(newEvent);
        localStorage.setItem('winner_submissions', JSON.stringify(winnersData));
        showToast("Cloud sync failed. Saved to local storage fallback.", true);
      }
    } else {
      // Local Mode
      winnersData.unshift(newEvent);
      localStorage.setItem('winner_submissions', JSON.stringify(winnersData));
      showToast(`Registered Event: ${eventName} (Local Mode)`);
    }

    // Reset UI
    submissionForm.reset();
    resetWinnersForm();

    // Render registry and redirect
    renderGrid();
    switchTab('dashboard-section');
  });
}

// --- Render Grid Elements (Grouped by Event) ---
function renderGrid() {
  winnerGrid.innerHTML = '';

  const searchQuery = searchInput.value.toLowerCase().trim();
  const deptQuery = filterDept.value.toLowerCase();
  const semQuery = filterSem.value;
  const rankQuery = filterRank.value;

  // Filter Events, then filter winners within events, retaining matches
  const filteredEvents = winnersData.map(event => {
    // Deep copy to prevent state mutation
    const eventCopy = { ...event, winners: [...event.winners] };

    // Filter inner winners
    eventCopy.winners = event.winners.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery) || 
                            event.eventName.toLowerCase().includes(searchQuery) ||
                            event.uid.toLowerCase().includes(searchQuery);
      const matchesDept = !deptQuery || w.department.toLowerCase().includes(deptQuery);
      const matchesSem = !semQuery || w.semester === semQuery;
      const matchesRank = !rankQuery || w.rank === rankQuery;

      return matchesSearch && matchesDept && matchesSem && matchesRank;
    });

    return eventCopy;
  }).filter(event => event.winners.length > 0); // Keep only events with matching winners

  // Inject event cards
  if (filteredEvents.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'no-results';
    emptyMsg.textContent = 'NO REGISTERED WINNERS MATCH CURRENT PARAMETERS //';
    winnerGrid.appendChild(emptyMsg);
  } else {
    filteredEvents.forEach(event => {
      const card = createEventCardElement(event);
      winnerGrid.appendChild(card);
    });
  }

  // Always append the "SUBMIT NEW WINNER" placeholder slot at the end
  const addSlot = document.createElement('div');
  addSlot.className = 'placeholder-card';
  addSlot.setAttribute('aria-label', 'Submit New Winner');
  addSlot.innerHTML = `
    <span class="material-symbols-outlined">add_circle</span>
    <span class="btn-text">SUBMIT NEW WINNER</span>
  `;
  addSlot.addEventListener('click', () => {
    switchTab('form-section');
  });
  winnerGrid.appendChild(addSlot);
}

// Generates the layout for a single Event Card containing grouped sub-cards
function createEventCardElement(event) {
  const card = document.createElement('div');
  card.className = 'event-card';

  // HUD scanline
  const scanline = document.createElement('div');
  scanline.className = 'scanline';
  card.appendChild(scanline);

  // Card Header section
  const header = document.createElement('div');
  header.className = 'event-card-header';
  const coordText = event.coordinator2 
    ? `${event.coordinator} & ${event.coordinator2}` 
    : event.coordinator;
  header.innerHTML = `
    <div class="event-card-header-left">
      <h2 class="event-card-title">${event.eventName}</h2>
      <div class="event-card-coord">Coordinator: <span>${coordText} / ${event.coordinatorDept}</span></div>
    </div>
    <div class="event-card-header-right">
      <span class="event-card-uid">UID: ${event.uid}</span>
    </div>
  `;
  card.appendChild(header);

  // Subgrid for winners
  const winnersGrid = document.createElement('div');
  winnersGrid.className = 'event-winners-grid';

  event.winners.forEach(w => {
    const winCard = document.createElement('div');
    winCard.className = 'winner-sub-card';

    // Badge styling
    let badgeClass = 'rank-other';
    if (w.rank === '1st Place') badgeClass = 'rank-1st';
    else if (w.rank === '2nd Place') badgeClass = 'rank-2nd';
    else if (w.rank === '3rd Place') badgeClass = 'rank-3rd';

    winCard.innerHTML = `
      <div class="winner-sub-card-img-wrapper">
        <div class="winner-sub-card-rank-tag ${badgeClass}">${w.rank}</div>
        <img class="winner-sub-card-img" src="${w.image}" alt="Portrait of ${w.name}" loading="lazy">
      </div>
      <div class="winner-sub-card-content">
        <h3 class="winner-sub-card-title">${w.name}</h3>
        <div class="winner-sub-card-details">
          <div>
            <span class="winner-sub-card-detail-label">Dept</span>
            <span class="winner-sub-card-detail-value">${w.department}</span>
          </div>
          <div>
            <span class="winner-sub-card-detail-label">Sem</span>
            <span class="winner-sub-card-detail-value">${w.semester}</span>
          </div>
        </div>
        <div class="winner-sub-card-contacts">
          <div class="winner-sub-card-contact-item">
            <span class="material-symbols-outlined">mail</span>
            <span>${w.email}</span>
          </div>
          <div class="winner-sub-card-contact-item">
            <span class="material-symbols-outlined">call</span>
            <span>${w.phone}</span>
          </div>
        </div>
      </div>
    `;

    // Download image trigger when wrapper is clicked
    const imgWrapper = winCard.querySelector('.winner-sub-card-img-wrapper');
    imgWrapper.addEventListener('click', () => {
      const fileName = `${w.name.toLowerCase().replace(/\s+/g, '_')}_portrait.png`;
      downloadImage(w.image, fileName);
    });

    winnersGrid.appendChild(winCard);
  });

  card.appendChild(winnersGrid);
  return card;
}

// --- Dynamic Toast UI HUD Feedback ---
let toastTimeout;
function showToast(message, isError = false) {
  clearTimeout(toastTimeout);
  
  toastMessage.textContent = message;
  
  const icon = toast.querySelector('.toast-icon');
  if (isError) {
    toast.style.borderColor = '#ffb4ab';
    icon.style.color = '#ffb4ab';
    icon.textContent = 'warning';
  } else {
    toast.style.borderColor = 'var(--primary-accent)';
    icon.style.color = 'var(--primary-accent)';
    icon.textContent = 'check_circle';
  }
  
  toast.classList.add('show');
  
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// --- Image Download Helper ---
async function downloadImage(imgUrl, fileName) {
  showToast(`Downloading portrait file...`);
  
  // Directly download Base64/Data URLs
  if (imgUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }
  
  // Fetch external Google Usercontent URLs to download as blobs (helps dodge CORS download restrictions)
  try {
    const response = await fetch(imgUrl, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.warn("Direct blob download failed due to CORS. Falling back to new tab direct link.", e);
    // Fallback: Open in new tab so they can right-click save if local file protocol blocks CORS fetch
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
