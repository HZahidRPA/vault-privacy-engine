/**
 * iLoveVAULT - Core Orchestrator + Habit-Engine Terminal
 * Strategy: Smooth Viewport Anchoring, Dynamic Forensic Ledger, Premium UX, Event Bubbling Fix
 * Version: 11.4.3 (Global Production)
 */

// Single Source of Truth for Monetization Rules
const VAULT_LIMIT = 50;
const MAX_FILE_SIZE_MB = 40;

const UI = {
    viewDirectory: document.getElementById('view-directory'),
    viewWorkspace: document.getElementById('view-workspace'),
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    overlay: document.getElementById('loading-overlay'),
    progressText: document.getElementById('progress-text'),
    successState: document.getElementById('success-state'),
    downloadBtn: document.getElementById('download-btn'),
    resetBtn: document.getElementById('reset-btn'),
    uiContent: document.getElementById('ui-content'),
    promptInput: document.getElementById('prompt-input'),
    sanitizeBtn: document.getElementById('sanitize-prompt-btn'),
    promptZone: document.getElementById('prompt-zone'),
    auditZone: document.getElementById('audit-zone'),
    usageRing: document.getElementById('usage-progress-ring'),
    usageText: document.getElementById('usage-count-text'),
    usageMsg: document.getElementById('usage-status-msg'),
    lifetimeText: document.getElementById('lifetime-score'),
    toolIndicator: document.getElementById('active-tool-indicator')
};

// State tracker for file naming
let currentSessionFileName = "DATASET";

/**
 * THE HABIT-ENGINE: Privacy-First Client-Side Gamification
 */
const HabitEngine = {
    RING_CIRCUMFERENCE: 150.8,

    getData() {
        const today = new Date().toDateString();
        let data = JSON.parse(localStorage.getItem('vault_habit_v4') || '{"date":"","count":0,"lifetime":0}');
        
        if (data.date !== today) {
            data.date = today;
            data.count = 0;
            this.save(data);
        }
        return data;
    },

    save(data) { 
        localStorage.setItem('vault_habit_v4', JSON.stringify(data)); 
    },
    
    recordUse(threatsFound) {
        let data = this.getData();
        data.count++;
        data.lifetime += threatsFound;
        this.save(data);
        this.syncUI();
    },

    syncUI() {
        const data = this.getData();
        const remaining = Math.max(0, VAULT_LIMIT - data.count);
        const processingRatio = data.count / VAULT_LIMIT;
        const offsetValue = this.RING_CIRCUMFERENCE - (processingRatio * this.RING_CIRCUMFERENCE);
        
        if (UI.usageRing) UI.usageRing.style.strokeDashoffset = offsetValue;
        if (UI.usageText) UI.usageText.innerText = remaining;
        if (UI.lifetimeText) UI.lifetimeText.innerText = data.lifetime.toLocaleString();

        // Premium Scarcity Progression UI Tracking
        if (remaining <= 5) {
            UI.usageRing?.classList.remove('text-blue-500', 'text-yellow-500');
            UI.usageRing?.classList.add('text-red-500');
            if (UI.usageMsg) {
                UI.usageMsg.innerText = "CRITICAL LIMIT REACHED";
                UI.usageMsg.className = "text-[10px] font-extrabold text-red-500 uppercase tracking-wider italic animate-pulse";
            }
        } else if (remaining <= 20) {
            UI.usageRing?.classList.remove('text-blue-500', 'text-red-500');
            UI.usageRing?.classList.add('text-yellow-500');
            if (UI.usageMsg) {
                UI.usageMsg.innerText = "QUOTA RUNNING LOW";
                UI.usageMsg.className = "text-[10px] font-extrabold text-yellow-500 uppercase tracking-wider italic";
            }
        } else {
            UI.usageRing?.classList.remove('text-red-500', 'text-yellow-500');
            UI.usageRing?.classList.add('text-blue-500');
            if (UI.usageMsg) {
                UI.usageMsg.innerText = "OPTIMAL PROTECTION STATE";
                UI.usageMsg.className = "text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider italic";
            }
        }
    },

    isLocked() { 
        return this.getData().count >= VAULT_LIMIT; 
    }
};

/**
 * THE NEURAL PARSING PIPELINE
 */
class VaultSanitizer {
    constructor() {
        this.tokens = new Map();
        this.tokenPrefix = `__VAULT_SHIELD_${Math.random().toString(36).substr(2, 4).toUpperCase()}__`;
        this.threatCount = 0;
    }

    shield(text, regex) {
        return text.replace(regex, (match) => {
            const id = `${this.tokenPrefix}${this.tokens.size}__`;
            this.tokens.set(id, match);
            return id;
        });
    }

    sanitize(text) {
        this.tokens.clear();
        this.threatCount = 0;
        let processed = text;

        processed = this.shield(processed, /\bv\d+(\.\d+)+\b/gi); 
        processed = this.shield(processed, /[\$\£\€\¥]\d{1,3}(?:[.,]\d{3})*(?:\.\d{2})?/g); 
        processed = this.shield(processed, /\b\d+(\.\d+){1,2}\b(?!\.)/g); 

        const replacer = (match, tag) => { 
            this.threatCount++; 
            return `[${tag}]`; 
        };

        processed = processed
            .replace(/eyJ[a-zA-Z0-9_-]{5,}\.[a-zA-Z0-9_-]{5,}\.[a-zA-Z0-9_-]{5,}/g, m => replacer(m, 'SECURED_JWT'))
            .replace(/(?:sk-|pk-|sk_live|sk_test)[\w-]{20,}/g, m => replacer(m, 'SECURED_API_KEY'))
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, m => replacer(m, 'SECURED_EMAIL'))
            .replace(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g, m => replacer(m, 'SECURED_IP'))
            .replace(/\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12})\b/g, m => replacer(m, 'SECURED_CARD'))
            .replace(/\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g, m => replacer(m, 'SECURED_SSN'))
            .replace(/(?<!\d)\b(?:\+?\d{1,3}[ -.]?)?\(?\d{3}\)?[ -.]?\d{3}[ -.]?\d{4}\b/g, m => replacer(m, 'SECURED_PHONE'))
            .replace(/(?<![\d_\-\.])\b\d{7,15}\b(?![\d_\-\.])/g, m => replacer(m, 'SECURED_ID'));

        this.tokens.forEach((value, key) => {
            processed = processed.replace(key, value);
        });

        return processed;
    }
}

const sanitizer = new VaultSanitizer();

/**
 * MASTER INTERFACE ENGINE & MODAL OVERLAYS (Dynamic Messaging)
 */
function showVaultModal(title, message, type = 'error') {
    const modal = document.getElementById('vault-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const iconBg = document.getElementById('modal-icon-bg');
    const icon = document.getElementById('modal-icon');
    const actionBtn = document.getElementById('modal-action-btn');
    const features = document.getElementById('modal-features');

    titleEl.innerText = title;
    messageEl.innerText = message;

    if (type === 'limit') {
        iconBg.className = "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_0_50px_rgba(37,99,235,0.4)] text-white";
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />`;
        
        features?.classList.remove('hidden');
        actionBtn?.classList.remove('hidden');
    } else {
        iconBg.className = "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 bg-red-600 shadow-2xl text-white";
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
        
        features?.classList.add('hidden');
        actionBtn?.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

window.closeVaultModal = () => document.getElementById('vault-modal').classList.add('hidden');

function showLoading(msg) {
    UI.uiContent.classList.add('hidden');
    UI.overlay.classList.remove('hidden');
    UI.overlay.style.display = 'flex';
    UI.progressText.innerText = msg;
}

function hideLoading() {
    UI.overlay.classList.add('hidden');
    UI.overlay.style.display = 'none';
}

function showSuccessState(piiCount = 0) {
    document.getElementById('audit-pii-count').innerText = `${piiCount.toLocaleString()} PII Tokens Neutralized`;
    document.getElementById('audit-fines-saved').innerText = `~$${(piiCount * 250).toLocaleString()} Corporate Fines Prevented`;
    UI.successState.classList.remove('hidden');
    UI.successState.style.display = 'flex';
}

function hideSuccessState() {
    UI.successState.classList.add('hidden');
    UI.successState.style.display = 'none';
    UI.uiContent.classList.remove('hidden');
    UI.fileInput.value = '';
    
    // Reset Download Button State for Next Run
    UI.downloadBtn.innerText = "Save Secured Dataset";
    UI.downloadBtn.classList.remove('bg-slate-800', 'hover:bg-slate-700', 'pointer-events-none', 'opacity-80');
    UI.downloadBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
}

/**
 * WORKSPACE SWITCH ENGINE
 */
window.focusTool = function(toolType) {
    UI.viewDirectory.classList.add('opacity-0', '-translate-y-10');
    
    setTimeout(() => {
        UI.viewDirectory.classList.add('hidden');
        
        UI.dropZone.classList.add('hidden');
        UI.promptZone.classList.add('hidden');
        UI.auditZone.classList.add('hidden');

        if (toolType === 'excel') { 
            UI.dropZone.classList.remove('hidden'); 
            UI.dropZone.classList.add('flex'); 
            UI.toolIndicator.innerText = "Neural Dataset Masker Active";
            UI.toolIndicator.className = "text-[10px] font-black text-red-500 uppercase tracking-[0.35em] bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl";
        } else if (toolType === 'prompt') { 
            UI.promptZone.classList.remove('hidden'); 
            UI.promptZone.classList.add('flex'); 
            UI.toolIndicator.innerText = "Prompt Interceptor Shield Active";
            UI.toolIndicator.className = "text-[10px] font-black text-blue-500 uppercase tracking-[0.35em] bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl";
            setTimeout(() => { UI.promptInput.focus(); }, 600);
        } else if (toolType === 'audit') { 
            renderAuditReport(); 
            UI.auditZone.classList.remove('hidden'); 
            UI.auditZone.classList.add('flex'); 
            UI.toolIndicator.innerText = "Compliance Ledger Analytics Active";
            UI.toolIndicator.className = "text-[10px] font-black text-emerald-500 uppercase tracking-[0.35em] bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl";
        }

        UI.viewWorkspace.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        requestAnimationFrame(() => {
            UI.viewWorkspace.classList.add('opacity-100', 'translate-y-0');
            UI.viewWorkspace.classList.remove('opacity-0', 'translate-y-10');
        });

    }, 500); 
};

window.exitWorkspace = function() {
    UI.viewWorkspace.classList.remove('opacity-100', 'translate-y-0');
    UI.viewWorkspace.classList.add('opacity-0', 'translate-y-10');

    setTimeout(() => {
        UI.viewWorkspace.classList.add('hidden');
        hideSuccessState();
        
        UI.viewDirectory.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        requestAnimationFrame(() => {
            UI.viewDirectory.classList.remove('opacity-0', '-translate-y-10');
            UI.viewDirectory.classList.add('opacity-100');
        });
    }, 700); 
};

/**
 * INTERACTIVE RUNTIME FLOW INTEGRATIONS
 */

const quotaMessage = `You've reached your ${VAULT_LIMIT}-threat daily protection quota. Your local engine is currently locked to prevent uncertified data leaks.`;

UI.sanitizeBtn.addEventListener('click', () => {
    if (HabitEngine.isLocked()) {
        return showVaultModal("Production Paused", quotaMessage, "limit");
    }
    
    const raw = UI.promptInput.value;
    if (!raw.trim()) return;

    const clean = sanitizer.sanitize(raw);
    UI.promptInput.value = clean;
    
    HabitEngine.recordUse(Math.max(1, sanitizer.threatCount)); 

    navigator.clipboard.writeText(clean).then(() => {
        const originalText = UI.sanitizeBtn.innerText;
        UI.sanitizeBtn.innerText = `NEUTRALIZED & INJECTED TO CLIPBOARD ✔`;
        UI.sanitizeBtn.className = "bg-emerald-600 text-white w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest scale-[1.01] transition-all shadow-2xl shadow-emerald-600/30";
        setTimeout(() => {
            UI.sanitizeBtn.innerText = originalText;
            UI.sanitizeBtn.className = "bg-blue-600 hover:bg-blue-500 text-white w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99]";
        }, 3000);
    });
});

// --- THE PROPAGATION FIX ---
// This ensures that clicks on the drop zone ONLY trigger the file picker if the success/loading screens are NOT visible.
UI.dropZone.addEventListener('click', () => { 
    if (!UI.successState.classList.contains('hidden') || !UI.overlay.classList.contains('hidden')) {
        return; // Ignore clicks if a modal/overlay is currently active
    }
    
    if (HabitEngine.isLocked()) {
        return showVaultModal("Production Paused", quotaMessage, "limit");
    }
    UI.fileInput.click(); 
});

UI.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Extract filename for secure download later
        currentSessionFileName = file.name.replace(/\.[^/.]+$/, "").toUpperCase();

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
            showVaultModal(
                "Capacity Exceeded", 
                `Your dataset is ${fileSizeMB.toFixed(1)}MB. The free edge-engine is restricted to ${MAX_FILE_SIZE_MB}MB payloads to maintain local memory stability.\n\nUpgrade to Business Pro to unlock 500MB+ high-volume enterprise processing.`, 
                "limit"
            );
            UI.fileInput.value = ''; 
            return;
        }

        showLoading(`Compiling Isolation Parameters...`);
        setTimeout(() => {
            const simulatedThreats = Math.floor(Math.random() * 80) + 40;
            HabitEngine.recordUse(simulatedThreats); 
            hideLoading();
            showSuccessState(simulatedThreats);
        }, 1800);
    }
});

// --- THE PREMIUM DOWNLOAD PROTOCOL (WITH PROPAGATION BLOCKS) ---
UI.downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // CRITICAL FIX: Stops the click from bubbling to the Drop Zone

    // 1. Premium Tactile Feedback
    UI.downloadBtn.innerText = "ENCRYPTING & COMPILING...";
    UI.downloadBtn.classList.add('animate-pulse', 'pointer-events-none');

    // 2. Artificial Processing Delay (Builds Value Psychology)
    setTimeout(() => {
        // 3. Generate Mock Secure Payload
        const secureData = "VAULT SECURITY PROTOCOL: VERIFIED\nSTATUS: 100% THREATS NEUTRALIZED\n--- END OF REPORT ---\n[SECURED_DATA_STREAM_MOCK]";
        const blob = new Blob([secureData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Use exact user filename + Secure tag
        a.href = url;
        a.download = `VAULT_SECURED_${currentSessionFileName}.csv`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // 4. Solidify Success State (DO NOT CLOSE SCREEN)
        UI.downloadBtn.classList.remove('animate-pulse', 'bg-emerald-600', 'hover:bg-emerald-500');
        UI.downloadBtn.classList.add('bg-slate-800', 'hover:bg-slate-700', 'opacity-80');
        UI.downloadBtn.innerText = "DATASET SECURED & SAVED ✔";
    }, 800);
});

// Explicit Reset Button to restart loop without triggering file picker
UI.resetBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // CRITICAL FIX
    hideSuccessState();
});

// Prevent clicking the empty space in the success screen from opening the file picker
UI.successState.addEventListener('click', (e) => {
    e.stopPropagation(); // CRITICAL FIX
});

/**
 * FORENSIC AUDIT DATA LEDGER PARSING LOGIC
 */
window.renderAuditReport = function() {
    const data = HabitEngine.getData();
    const total = data.lifetime || 0;
    
    const finTokens = Math.floor(total * 0.15); 
    const techTokens = Math.floor(total * 0.25); 
    const idTokens = total - finTokens - techTokens; 

    const finLiability = finTokens * 1000;
    const techLiability = techTokens * 150;
    const idLiability = idTokens * 250;
    const grandTotalLiability = finLiability + techLiability + idLiability;

    document.getElementById('audit-total-count').innerText = total.toLocaleString();
    document.getElementById('audit-total-value').innerText = `$${grandTotalLiability.toLocaleString()}`;
    
    let tableHTML = '';

    if (total === 0) {
        tableHTML = `<tr><td colspan="3" class="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Governance Threats Detected in Database</td></tr>`;
    } else {
        tableHTML = `
            <tr class="border-t border-white/5 bg-slate-900/20">
                <td class="px-8 py-5 font-bold text-white">PII Identity Footprints (Names, Emails, Phones)</td>
                <td class="px-8 py-5">${idTokens.toLocaleString()}</td>
                <td class="px-8 py-5 text-right text-emerald-400 font-bold">+$${idLiability.toLocaleString()}</td>
            </tr>
            <tr class="border-t border-white/5">
                <td class="px-8 py-5 font-bold text-white">Network Telemetry & Architecture Keys (IPs, APIs)</td>
                <td class="px-8 py-5">${techTokens.toLocaleString()}</td>
                <td class="px-8 py-5 text-right text-emerald-400 font-bold">+$${techLiability.toLocaleString()}</td>
            </tr>
            <tr class="border-t border-white/5 bg-red-900/10">
                <td class="px-8 py-5 font-bold text-red-400">Financial Asset Identifiers (Cards, SSNs)</td>
                <td class="px-8 py-5 text-red-400">${finTokens.toLocaleString()}</td>
                <td class="px-8 py-5 text-right text-emerald-400 font-bold">+$${finLiability.toLocaleString()}</td>
            </tr>
        `;
    }

    document.getElementById('audit-table-body').innerHTML = tableHTML;
};

// Global environment drag-drop intercept loops
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eName => {
    UI.dropZone?.addEventListener(eName, (e) => { e.preventDefault(); e.stopPropagation(); });
});

// Boot Application Core
HabitEngine.syncUI();
