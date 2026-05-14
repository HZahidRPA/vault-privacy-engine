/**
 * VAULT PROTOCOL - Enterprise Gateway Orchestrator
 * Strategy: Zero-Lag, Dark-Mode UI, Labor Illusion UX, Global Exception Handling
 * Version: 7.0.0
 */

const UI = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    status: document.getElementById('status-bar'),
    overlay: document.getElementById('loading-overlay'),
    progressText: document.getElementById('progress-text'),
    successState: document.getElementById('success-state'),
    downloadBtn: document.getElementById('download-btn'),
    resetBtn: document.getElementById('reset-btn')
};

let isEngineReady = false;
let isProcessing = false;
let pendingSecureData = null;
let pendingSecureFilename = "";

/**
 * EXCEPTION HANDLER: Global Catch-All
 * Prevents the app from "freezing" if an unhandled error occurs.
 */
window.onerror = function(message, source, lineno, colno, error) {
    console.error("GLOBAL_VAULT_FAULT:", error);
    showVaultModal("System Interruption", "A critical kernel error occurred. The defense core has been reset for your safety.", "error");
    resetSystemState();
    return true;
};

// Worker Initialization with robust error tracking
const worker = new Worker(`./vault-worker.js?v=${new Date().getTime()}`);

/**
 * PHASE 1: Boot Sequence with Timeout Protection
 */
function initBootSequence() {
    showLoading("INITIALIZING DEFENSE CORE...");
    
    // If worker doesn't respond in 10 seconds, it's likely a browser incompatibility
    const bootTimeout = setTimeout(() => {
        if (!isEngineReady) {
            showVaultModal("Initialization Failed", "The Security Engine is taking too long to respond. Please ensure you are using a modern, secure browser.", "error");
            hideLoading();
        }
    }, 10000);

    worker.postMessage({ type: 'init' });
    worker.bootTimeout = bootTimeout;
}

/**
 * PHASE 2: Worker Communication Logic & Robustness
 */
worker.onmessage = (e) => {
    const { type, msg, result, fileName } = e.data;

    switch (type) {
        case 'status':
            if (!isEngineReady) UI.progressText.innerText = msg.toUpperCase();
            break;

        case 'ready':
            isEngineReady = true;
            clearTimeout(worker.bootTimeout);
            hideLoading();
            break;

        case 'success':
            if (!result) {
                handleCriticalError("The engine returned an empty data set. Processing aborted.");
                return;
            }
            pendingSecureData = result;
            pendingSecureFilename = `VAULT_SECURED_${fileName.split('.')[0]}.csv`;
            
            setTimeout(() => {
                isProcessing = false;
                hideLoading();
                showSuccessState();
            }, 1800);
            break;

        case 'error':
            handleCriticalError(msg);
            break;
    }
};

worker.onerror = (err) => {
    handleCriticalError("The background security thread crashed. This is usually due to extremely low system memory.");
};

/**
 * PHASE 3: Error Recovery Logic
 */
function handleCriticalError(msg) {
    isProcessing = false;
    showVaultModal("Protocol Interrupted", msg, 'error');
    hideLoading();
    resetSystemState();
}

function resetSystemState() {
    isProcessing = false;
    UI.fileInput.value = '';
    pendingSecureData = null;
    hideLoading();
    hideSuccessState();
}

/**
 * PHASE 4: Premium Custom Modal Logic
 */
function showVaultModal(title, message, type = 'error') {
    const modal = document.getElementById('vault-modal');
    const content = document.getElementById('modal-content');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const iconBg = document.getElementById('modal-icon-bg');
    const icon = document.getElementById('modal-icon');
    const actionBtn = document.getElementById('modal-action-btn');

    if (!modal) return;

    titleEl.innerText = title;
    messageEl.innerText = message;

    if (type === 'limit') {
        iconBg.className = "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)] text-white";
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
        actionBtn.classList.remove('hidden'); 
    } else {
        iconBg.className = "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)] text-white";
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        actionBtn.classList.add('hidden'); 
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

window.closeVaultModal = function() {
    const modal = document.getElementById('vault-modal');
    const content = document.getElementById('modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 300);
};

/**
 * PHASE 5: File Handling & Memory Safety Checks
 */
function processFile(file) {
    if (!file || !isEngineReady || isProcessing) return;

    // Exception: File size check
    const MAX_SIZE_MB = 50;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_SIZE_MB) {
        showVaultModal(
            "Security Limit Reached", 
            `Your file is ${fileSizeMB.toFixed(1)}MB. The free protocol is designed for small personal files. Unlock the Unlimited Business License for massive datasets.`, 
            'limit'
        );
        UI.fileInput.value = ''; 
        return; 
    }

    // Exception: Format Validation
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
        showVaultModal("Format Rejected", "VAULT Protocol only accepts CSV or Excel structures. Please try again.", "error");
        UI.fileInput.value = '';
        return;
    }

    isProcessing = true;
    showLoading(`ANNIHILATING SECRETS IN ${file.name.toUpperCase()}...`);

    const reader = new FileReader();
    
    // Exception: Memory/Read Failures
    reader.onerror = () => {
        handleCriticalError("Read Access Denied. Ensure the file is not open in another application.");
    };

    reader.onload = (event) => {
        try {
            const typedArray = new Uint8Array(event.target.result);
            worker.postMessage({
                type: 'process',
                content: typedArray,
                fileName: file.name
            });
        } catch (e) {
            handleCriticalError("Memory Exhaustion. Your browser does not have enough RAM allocated to process this file.");
        }
    };
    
    reader.readAsArrayBuffer(file);
}

/**
 * PHASE 6: UI State Management
 */
function showLoading(msg) {
    UI.overlay.classList.remove('hidden');
    UI.overlay.style.display = 'flex'; 
    UI.progressText.innerText = msg;
}

function hideLoading() {
    UI.overlay.classList.add('hidden');
    UI.overlay.style.display = 'none';
}

function showSuccessState() {
    UI.successState.classList.remove('hidden');
    UI.successState.style.display = 'flex';
}

function hideSuccessState() {
    UI.successState.classList.add('hidden');
    UI.successState.style.display = 'none';
    UI.fileInput.value = ''; 
    pendingSecureData = null;
}

function handleDownload(data, filename) {
    try {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); 
        a.click();
        
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    } catch (e) {
        showVaultModal("Download Failed", "Your browser blocked the file generation. Please check your privacy settings.", "error");
    }
}

/**
 * PHASE 7: Tactical Listeners
 */
UI.dropZone.addEventListener('click', () => {
    if (isEngineReady && !isProcessing && UI.successState.classList.contains('hidden')) {
        UI.fileInput.click();
    }
});

UI.downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pendingSecureData) {
        handleDownload(pendingSecureData, pendingSecureFilename);
        hideSuccessState();
    }
});

UI.resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideSuccessState();
});

UI.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) processFile(e.target.files[0]);
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    UI.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

UI.dropZone.addEventListener('dragover', () => {
    if (isEngineReady && !isProcessing && UI.successState.classList.contains('hidden')) {
        UI.dropZone.classList.add('border-blue-500', 'bg-slate-800/60');
    }
});

UI.dropZone.addEventListener('dragleave', () => {
    UI.dropZone.classList.remove('border-blue-500', 'bg-slate-800/60');
});

UI.dropZone.addEventListener('drop', (e) => {
    UI.dropZone.classList.remove('border-blue-500', 'bg-slate-800/60');
    if (isEngineReady && !isProcessing && UI.successState.classList.contains('hidden') && e.dataTransfer.files.length) {
        processFile(e.dataTransfer.files[0]);
    }
});

// Initialization
initBootSequence();