const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const status = document.getElementById('status-bar');
const overlay = document.getElementById('loading-overlay');
const progressText = document.getElementById('progress-text');

let isEngineReady = false; 

// Version bump to ensure Vercel and browsers clear the old code cache
const worker = new Worker('./vault-worker.js?v=1.0.3');

// END-GAME UI: Immediately cover the drop zone with the loading spinner
// so the user cannot click early, and they see the boot sequence.
showLoading("Waking up Secure Core...");

worker.postMessage({ type: 'init' });

worker.onmessage = (e) => {
    const { type, msg, result, fileName } = e.data;

    if (type === 'status') {
        status.innerText = `Engine: ${msg}`;
        // Pipe the real-time boot sequence text into the center spinner
        if (!isEngineReady) {
            progressText.innerText = msg.toUpperCase(); 
        }
    } else if (type === 'ready') {
        isEngineReady = true; 
        status.innerText = "Engine: Ready & Secure";
        hideLoading(); // The dark overlay gracefully slides away, revealing the drop zone!
    } else if (type === 'success') {
        downloadFile(result, `VAULTED_${fileName.split('.')[0]}.csv`);
        hideLoading();
    } else if (type === 'error') {
        alert("Engine Error: " + msg); // We only use alerts for ACTUAL file processing errors now
        hideLoading();
    }
};

// Bulletproof Click Listener
dropZone.addEventListener('click', (e) => {
    if (!isEngineReady) return; // Fail silently, the loading screen is already handling UX
    fileInput.click();
});

// Drag and Drop Visuals
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if(isEngineReady) dropZone.classList.add('border-blue-500', 'bg-blue-50');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-500', 'bg-blue-50');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    
    if (!isEngineReady) return;

    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        processFile(fileInput.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        processFile(e.target.files[0]);
    }
});

function processFile(file) {
    if (!file) return;
    showLoading(`VAULTING ${file.name.toUpperCase()}...`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const typedArray = new Uint8Array(event.target.result);
        worker.postMessage({ 
            type: 'process', 
            content: typedArray, 
            fileName: file.name 
        });
    };
    reader.readAsArrayBuffer(file);
}

function showLoading(msg) {
    overlay.classList.remove('hidden');
    progressText.innerText = msg;
}

function hideLoading() {
    overlay.classList.add('hidden');
    status.innerText = "Engine: Ready & Secure";
    fileInput.value = ''; // Reset input
}

function downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}