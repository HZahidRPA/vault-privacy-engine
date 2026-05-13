from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Response
import pandas as pd
from faker import Faker
import numpy as np
import io

# Initialize the API with automatic enterprise documentation
app = FastAPI(
    title="VAULT Enterprise API",
    description="Automated zero-trust data masking for AI pipelines.",
    version="1.0.0"
)

fake = Faker()

# THE MONETIZATION LOCK: Only requests with these keys are allowed.
# You will generate these for paying clients.
VALID_API_KEYS = {
    "live_sk_vault_enterprise_9982",
    "test_sk_vault_demo_1122",
    "live_sk_vlt_8f92bd64e1a07c39f2k4m9x1", # Customer 1: Acme Corp
    "live_sk_vlt_2m84cx91z7b40p63v9n2k5l8"  # Customer 2: Globex Finance
}

@app.post("/api/v1/mask-data")
async def mask_data(
    file: UploadFile = File(...), 
    x_api_key: str = Header(None, alias="X-API-Key")
):
    # 1. Check if the user has paid / is authorized
    if x_api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=401, detail="Unauthorized. Invalid or missing X-API-Key.")

    # 2. Read the uploaded file
    try:
        content = await file.read()
        file_name = file.filename.lower()
        
        if file_name.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file_name.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(content), engine='openpyxl')
        else:
            raise HTTPException(status_code=400, detail="Invalid file format. Only .csv or .xlsx allowed.")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # 3. The Core Vault Logic
    for col in df.columns:
        col_lower = col.lower()
        
        if any(key in col_lower for key in ['name', 'email', 'address', 'phone']):
            df[col] = [fake.name() if 'name' in col_lower else 
                       fake.email() if 'email' in col_lower else 
                       fake.address().replace('\n', ', ') for _ in range(len(df))]
                       
        elif df[col].dtype in ['int64', 'float64'] and 'id' not in col_lower:
            noise = np.random.uniform(0.98, 1.02, size=len(df))
            df[col] = (df[col] * noise).round(2)
            
        elif 'date' in col_lower or 'birth' in col_lower:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            shifts = np.random.randint(-15, 15, size=len(df))
            df[col] = df[col] + pd.to_timedelta(shifts, unit='d')

    df['VAULT_STATUS'] = '[VAULTED-FOR-AI]'

    # 4. Return the scrubbed data as a downloadable CSV
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    
    return Response(
        content=csv_buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=VAULTED_{file.filename.split('.')[0]}.csv"}
    )