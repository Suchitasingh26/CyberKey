// --- CONFIGURATION ---
const STORAGE_KEY = "cyberkey_final_data"; 
const PIN_KEY = "cyberkey_user_pin";
const DEFAULT_PIN = "0000";

// --- STATE ---
let vault = [];
let isEditing = false;
let currentPin = localStorage.getItem(PIN_KEY) || DEFAULT_PIN;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    loadVault();
});

function loadVault() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            vault = JSON.parse(raw);
            if (!Array.isArray(vault)) vault = [];
        }
    } catch (e) {
        vault = [];
    }
}

function saveVault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
    renderVault();
}

// --- LOCK SCREEN ---
const pinInput = document.getElementById('pinInput');

pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') unlockVault();
});

function unlockVault() {
    const entered = pinInput.value;
    const msg = document.getElementById('lockMsg');
    
    if (entered === currentPin) {
        document.getElementById('lockScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('lockScreen').classList.add('hidden');
            const app = document.getElementById('appInterface');
            app.classList.remove('hidden');
            setTimeout(() => app.classList.remove('opacity-0'), 50);
            renderVault();
        }, 500);
    } else {
        msg.classList.remove('opacity-0');
        pinInput.value = "";
        pinInput.classList.add('border-red-500', 'text-red-500');
        setTimeout(() => {
            msg.classList.add('opacity-0');
            pinInput.classList.remove('border-red-500', 'text-red-500');
        }, 2000);
    }
}

function lockApp() {
    location.reload();
}

function emergencyReset() {
    if(confirm("FACTORY RESET: This will wipe all data and reset the PIN to 0000. Continue?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- BACKUP FEATURE ---
function downloadBackup() {
    if(vault.length === 0) {
        showToast("Vault is empty!", true);
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vault));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "cyberkey_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup Downloaded");
}

// --- PIN SETTINGS ---
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('newPinInput').value = "";
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveNewPin() {
    const newPin = document.getElementById('newPinInput').value;
    if(newPin.length !== 4 || isNaN(newPin)) {
        alert("PIN must be 4 digits.");
        return;
    }
    currentPin = newPin;
    localStorage.setItem(PIN_KEY, newPin);
    showToast("PIN Updated Successfully");
    closeSettings();
}

// --- CRUD OPERATIONS ---
function saveEntry() {
    const platform = document.getElementById('platform').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const entryId = document.getElementById('entryId').value;

    if (!platform || !username || !password) {
        showToast("Fill all fields", true);
        return;
    }

    if (isEditing && entryId) {
        const index = vault.findIndex(i => i.id == entryId);
        if (index > -1) {
            vault[index] = { id: parseInt(entryId), platform, username, password: btoa(password) };
            showToast("Updated");
        }
    } else {
        vault.push({ id: Date.now(), platform, username, password: btoa(password) });
        showToast("Saved");
    }

    saveVault();
    resetForm();
}

function deleteEntry(id) {
    if (confirm("Delete this entry?")) {
        vault = vault.filter(item => item.id !== id);
        saveVault();
        showToast("Deleted");
    }
}

function loadEdit(id) {
    const item = vault.find(i => i.id === id);
    if (!item) return;

    // 1. Decode password first
    const realPass = safeDecode(item.password);

    // 2. Fill inputs
    document.getElementById('platform').value = item.platform;
    document.getElementById('username').value = item.username;
    document.getElementById('password').value = realPass;
    document.getElementById('entryId').value = item.id;
    
    // 3. Update Strength Bar
    checkStrength(realPass);

    // 4. UI Updates
    isEditing = true;
    document.getElementById('formTitle').innerHTML = `<i class="fa-solid fa-pen"></i> EDITING`;
    document.getElementById('formTitle').className = "text-lg font-bold text-yellow-400 flex items-center gap-2";
    document.getElementById('editBadge').classList.remove('hidden');
    document.getElementById('cancelBtn').classList.remove('hidden');
    document.getElementById('saveBtn').innerText = "UPDATE";
    document.getElementById('saveBtn').classList.replace('bg-purple-600', 'bg-yellow-600');
    document.getElementById('saveBtn').classList.replace('hover:bg-purple-500', 'hover:bg-yellow-500');
}

function resetForm() {
    document.getElementById('platform').value = "";
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
    document.getElementById('entryId').value = "";
    
    checkStrength(""); // Reset bar

    isEditing = false;
    document.getElementById('formTitle').innerHTML = `<i class="fa-solid fa-plus-circle"></i> NEW ENTRY`;
    document.getElementById('formTitle').className = "text-lg font-bold text-green-400 flex items-center gap-2";
    document.getElementById('editBadge').classList.add('hidden');
    document.getElementById('cancelBtn').classList.add('hidden');
    document.getElementById('saveBtn').innerText = "SAVE";
    document.getElementById('saveBtn').classList.replace('bg-yellow-600', 'bg-purple-600');
    document.getElementById('saveBtn').classList.replace('hover:bg-yellow-500', 'hover:bg-purple-500');
}

// --- RENDER ---
function renderVault() {
    const grid = document.getElementById('vaultGrid');
    const search = document.getElementById('searchBox').value.toLowerCase();
    
    grid.innerHTML = "";
    let count = 0;

    vault.forEach(item => {
        if (!item || !item.platform) return;
        if (item.platform.toLowerCase().includes(search)) {
            count++;
            const card = document.createElement('div');
            card.className = "cyber-card glass-panel p-5 rounded-xl border border-gray-800 relative group";
            const realPass = safeDecode(item.password);

            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="bg-gray-800/80 p-3 rounded-lg text-purple-400 border border-gray-700">
                        <i class="fa-solid fa-shield-halved text-xl"></i>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="loadEdit(${item.id})" class="p-2 text-gray-400 hover:text-yellow-400"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteEntry(${item.id})" class="p-2 text-gray-400 hover:text-red-400"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <h4 class="text-xl font-bold text-white mb-1 truncate">${item.platform}</h4>
                <p class="text-sm text-gray-500 mb-6 font-mono truncate">${item.username}</p>
                <div class="bg-black/40 p-3 rounded-lg border border-gray-700/50 flex justify-between items-center">
                    <input type="password" value="${realPass}" readonly class="bg-transparent text-gray-300 text-sm font-mono w-full outline-none tracking-widest" id="pass-${item.id}">
                    <div class="flex gap-2 ml-2">
                        <button onclick="toggleVis(${item.id})" class="text-gray-500 hover:text-white transition"><i class="fa-solid fa-eye"></i></button>
                        <button onclick="copyToClip('${realPass}')" class="text-gray-500 hover:text-green-400 transition"><i class="fa-solid fa-copy"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        }
    });

    document.getElementById('totalCount').innerText = count;
    document.getElementById('emptyState').className = count === 0 ? "flex flex-col items-center justify-center py-20 opacity-50" : "hidden";
}

// --- UTILS ---
function safeDecode(str) { try { return atob(str); } catch (e) { return str; } }

function generatePass() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let p = ""; for(let i=0; i<16; i++) p += chars.charAt(Math.floor(Math.random()*chars.length));
    document.getElementById('password').value = p;
    checkStrength(p); 
}

function toggleVis(id) { const el = document.getElementById(`pass-${id}`); el.type = el.type==="password"?"text":"password"; }
function copyToClip(txt) { navigator.clipboard.writeText(txt).then(() => showToast("Copied")); }

function showToast(msg, err=false) {
    const t = document.getElementById('toast');
    const icon = t.querySelector('.icon-container');
    document.getElementById('toastMsg').innerText = msg;
    if(err) { icon.classList.replace('bg-green-500/20','bg-red-500/20'); icon.classList.replace('text-green-400','text-red-400'); icon.innerHTML='<i class="fa-solid fa-xmark"></i>'; }
    else { icon.classList.replace('bg-red-500/20','bg-green-500/20'); icon.classList.replace('text-red-400','text-green-400'); icon.innerHTML='<i class="fa-solid fa-check"></i>'; }
    t.classList.remove('translate-y-40'); setTimeout(() => t.classList.add('translate-y-40'), 3000);
}

// --- STRENGTH CHECKER ---
function checkStrength(pass) {
    const bar = document.getElementById('strengthBar');
    const txt = document.getElementById('strengthText');
    
    if (!pass || pass === "") {
        bar.style.width = '0%';
        bar.className = "h-full transition-all duration-300"; 
        txt.innerText = "STRENGTH CHECK";
        txt.className = "text-[10px] text-right mt-1 text-gray-500 font-bold tracking-wider";
        return;
    }

    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 3) {
        bar.style.width = '30%';
        bar.className = "h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-300";
        txt.innerText = "WEAK";
        txt.className = "text-[10px] text-right mt-1 text-red-500 font-bold tracking-wider";
    } else if (score < 5) {
        bar.style.width = '70%';
        bar.className = "h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-300";
        txt.innerText = "MEDIUM";
        txt.className = "text-[10px] text-right mt-1 text-yellow-500 font-bold tracking-wider";
    } else {
        bar.style.width = '100%';
        bar.className = "h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300";
        txt.innerText = "STRONG";
        txt.className = "text-[10px] text-right mt-1 text-green-500 font-bold tracking-wider";
    }
}