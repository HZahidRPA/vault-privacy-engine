const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const status = document.getElementById('status-bar');
const overlay = document.getElementById('loading-overlay');
const progressText = document.getElementById('progress-text');

// PRODUCTION DEPLOYMENT: Strict relative path and static versioning for Vercel Edge Cache
const worker = new Worker('./vault-worker.js?v=1.0.1');

worker.postMessage({ type: 'init' });

worker.onmessage = (e) => {
    const { type, msg, result, fileName } = e.data;

    if (type === 'status') {
        status.innerText = `Engine: ${msg}`;
    } else if (type === 'ready') {
        status.innerText = "Engine: Ready & Secure";
        overlay.classList.add('hidden');
    } else if (type === 'success') {
        downloadFile(result, `VAULTED_${fileName.split('.')[0]}.csv`);
        hideLoading();
    } else if (type === 'error') {
        alert("Error: " + msg);
        hideLoading();
    }
};

// END-GAME FIX: Bulletproof Click Listener
dropZone.addEventListener('click', (e) => {
    // This ensures clicking anywhere inside the box opens the file menu
    fileInput.click();
});

// Drag and Drop Visuals
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500', 'bg-blue-50');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-500', 'bg-blue-50');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500', 'bg-blue-50');
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
    showLoading(`Vaulting ${file.name}...`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
        // High-speed array transfer for Python
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
    fileInput.value = ''; // Reset input so you can click the same file twice
}

function downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}