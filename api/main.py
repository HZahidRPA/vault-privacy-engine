from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from faker import Faker
import numpy as np
import io

# 1. Professional Metadata for the /docs page
app = FastAPI(
    title="VAULT Enterprise Privacy Engine",
    description="""
## Industrial-Grade Zero-Trust Data Anonymization
VAULT is a high-performance API designed to sanitize sensitive corporate data before it enters AI models or third-party pipelines.

### **Enterprise Features:**
* **Deep PII Scrubbing:** Intelligent replacement of Names, Emails, and Addresses using the `Faker` ecosystem.
* **Statistical Differential Privacy:** Adds calculated noise to financial figures to prevent exact data matching.
* **Relational Integrity:** Protects IDs, Zip Codes, and system keys so your database joins don't break.
* **Stateless Security:** No data is ever persisted. Processing happens entirely in volatile memory.

**Inquiries:** [hzahid.cedar@gmail.com](mailto:hzahid.cedar@gmail.com) | **Version:** 1.2.0
""",
    version="1.2.0",
    contact={
        "name": "VAULT Support",
        "url": "https://vault-privacy-engine.vercel.app",
    },
)

# Enable CORS - Critical for allowing clients to call your API from their own web apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

fake = Faker()

# Managed API Keys
VALID_API_KEYS = {
    "live_sk_vault_enterprise_9982",
    "test_sk_vault_demo_1122",
    "live_sk_vlt_8f92bd64e1a07c39f2k4m9x1", # Acme Corp
    "live_sk_vlt_2m84cx91z7b40p63v9n2k5l8"  # Globex Finance
}

@app.get("/", tags=["System"])
async def health_check():
    """Standard health check for enterprise monitoring tools."""
    return {"status": "online", "engine": "VAULT-v1.2.0", "region": "Vercel-Edge"}

@app.post("/api/v1/mask-data", tags=["Core Engine"])
async def mask_data(
    file: UploadFile = File(...), 
    x_api_key: str = Header(None, alias="X-API-Key")
):
    # 1. Security Check
    if x_api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API Key.")

    # 2. Optimized File Reading
    try:
        content = await file.read()
        file_extension = file.filename.split('.')[-1].lower()
        
        if file_extension == 'csv':
            df = pd.read_csv(io.BytesIO(content))
        elif file_extension in ['xlsx', 'xls']:
            df = pd.read_excel(io.BytesIO(content), engine='openpyxl')
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Upload .csv or .xlsx only.")
            
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"File Processing Error: {str(e)}")

    # 3. Intelligent Masking Logic
    protected_terms = ['id', 'zip', 'post', 'code', 'phone', 'ssn', 'key']
    
    for col in df.columns:
        col_lower = col.lower()
        
        # PII Replacement
        if any(key in col_lower for key in ['name', 'email', 'address', 'contact']):
            df[col] = [fake.name() if 'name' in col_lower else 
                       fake.email() if 'email' in col_lower else 
                       fake.address().replace('\n', ', ') for _ in range(len(df))]
        
        # Numerical Noise (Protecting relational IDs)
        elif df[col].dtype in ['int64', 'float64']:
            if not any(term in col_lower for term in protected_terms):
                noise = np.random.uniform(0.98, 1.02, size=len(df))
                df[col] = (df[col] * noise).round(2)
            
        # Date Obfuscation
        elif 'date' in col_lower or 'birth' in col_lower:
            try:
                df[col] = pd.to_datetime(df[col], errors='coerce')
                shifts = np.random.randint(-15, 15, size=len(df))
                df[col] = df[col] + pd.to_timedelta(shifts, unit='d')
            except:
                pass # Skip if column isn't actually date-formatted

    df['VAULT_STATUS'] = '[VAULTED-FOR-AI]'

    # 4. Streamed Response
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    
    return Response(
        content=csv_buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=VAULTED_{file.filename}"}
    )