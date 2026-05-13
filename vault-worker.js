// This runs in a separate thread. No more browser hanging!
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide;

async function loadEngine() {
    self.postMessage({ type: 'status', msg: 'Waking up Secure Core...' });
    pyodide = await loadPyodide();
    
    self.postMessage({ type: 'status', msg: 'Loading Data Tools...' });
    await pyodide.loadPackage(["pandas", "micropip"]);
    
    self.postMessage({ type: 'status', msg: 'Calibrating Privacy...' });
    const micropip = pyodide.pyimport("micropip");
    await micropip.install("faker");
    
 // PRODUCTION DEPLOYMENT: Strict relative path for serverless environments
    const response = await fetch('./engine.py?v=1.0.0');
    const pythonCode = await response.text();
    pyodide.runPython(pythonCode);
    
    self.postMessage({ type: 'ready' });
}

self.onmessage = async (e) => {
    if (e.data.type === 'init') {
        await loadEngine();
    } else if (e.data.type === 'process') {
        try {
            const { content, fileName } = e.data;
            const result = pyodide.globals.get('vault_mirror_logic')(content, fileName);
            self.postMessage({ type: 'success', result, fileName });
        } catch (err) {
            self.postMessage({ type: 'error', msg: err.message });
        }
    }
};