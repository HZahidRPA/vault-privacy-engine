importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide;

// END-GAME ARCHITECTURE: Embed Python logic directly to prevent Vercel pathing errors.
const PYTHON_LOGIC = `
import pandas as pd
from faker import Faker
import numpy as np
import io

fake = Faker()

def vault_mirror_logic(file_data, file_name):
    data_bytes = file_data.to_py()
    
    if file_name.lower().endswith('.csv'):
        df = pd.read_csv(io.BytesIO(data_bytes))
    else:
        # Added explicit openpyxl engine for .xlsx support
        df = pd.read_excel(io.BytesIO(data_bytes), engine='openpyxl')

    for col in df.columns:
        col_lower = col.lower()
        
        if any(key in col_lower for key in ['name', 'email', 'address', 'phone']):
            df[col] = [fake.name() if 'name' in col_lower else 
                       fake.email() if 'email' in col_lower else 
                       fake.address().replace('\\n', ', ') for _ in range(len(df))]
            
        elif df[col].dtype in ['int64', 'float64'] and 'id' not in col_lower:
            noise = np.random.uniform(0.98, 1.02, size=len(df))
            df[col] = (df[col] * noise).round(2)
            
        elif 'date' in col_lower or 'birth' in col_lower:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            shifts = np.random.randint(-15, 15, size=len(df))
            df[col] = df[col] + pd.to_timedelta(shifts, unit='d')

    df['VAULT_STATUS'] = '[VAULTED-FOR-AI]'
    return df.to_csv(index=False)
`;

async function loadEngine() {
    self.postMessage({ type: 'status', msg: 'Waking up Secure Core...' });
    pyodide = await loadPyodide();
    
    self.postMessage({ type: 'status', msg: 'Loading Data Tools...' });
    await pyodide.loadPackage(["pandas", "micropip"]);
    
    self.postMessage({ type: 'status', msg: 'Calibrating Privacy...' });
    const micropip = pyodide.pyimport("micropip");
    
    // CRITICAL FIX: Added 'openpyxl' so Excel files will process correctly
    await micropip.install(["faker", "openpyxl"]);
    
    // Run the embedded Python logic directly from memory
    pyodide.runPython(PYTHON_LOGIC);
    
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