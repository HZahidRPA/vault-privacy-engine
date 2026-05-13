import pandas as pd
from faker import Faker
import numpy as np
import io

fake = Faker()

def vault_mirror_logic(file_data, file_name):
    # CRITICAL FIX: Convert the JavaScript Proxy to Python bytes
    # This resolves the TypeError seen in the console
    data_bytes = file_data.to_py()
    
    # Load the data using BytesIO
    if file_name.lower().endswith('.csv'):
        df = pd.read_csv(io.BytesIO(data_bytes))
    else:
        df = pd.read_excel(io.BytesIO(data_bytes))

    for col in df.columns:
        col_lower = col.lower()
        
        # 1. Textual PII (Names, Emails, Addresses, Phones)
        if any(key in col_lower for key in ['name', 'email', 'address', 'phone']):
            df[col] = [fake.name() if 'name' in col_lower else 
                       fake.email() if 'email' in col_lower else 
                       fake.address().replace('\n', ', ') for _ in range(len(df))]
            
        # 2. Numerical Privacy (Adding 2% 'Noise', BUT ignoring ID columns)
        elif df[col].dtype in ['int64', 'float64'] and 'id' not in col_lower:
            noise = np.random.uniform(0.98, 1.02, size=len(df))
            df[col] = (df[col] * noise).round(2)
            
        # 3. Date Shifting (+/- 15 days to protect specific timelines)
        elif 'date' in col_lower or 'birth' in col_lower:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            shifts = np.random.randint(-15, 15, size=len(df))
            df[col] = df[col] + pd.to_timedelta(shifts, unit='d')

    # Add the [VAULTED] Viral Seal
    df['VAULT_STATUS'] = '[VAULTED-FOR-AI]'
    
    return df.to_csv(index=False)