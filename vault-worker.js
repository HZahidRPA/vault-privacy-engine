/**
 * iLoveVAULT - Defense Core (Web Worker)
 * Strategy: Edge-Computing, Neural Masking, PII Heuristics
 * Version: 8.0.0
 */

// Import PapaParse via CDN for world-class, ultra-fast CSV processing
importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js');

// --- THE SYNTHETIC TWIN DATABASE ---
// These are used to generate realistic fake data to keep the file format intact for AI training
const fakeFirstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Skyler", "Avery", "Parker"];
const fakeLastNames = ["Smith", "Doe", "Miller", "Connor", "Sterling", "Vance", "Chen", "Patel", "Wright", "Silva"];
const fakeDomains = ["vault.local", "secure.net", "ghost.internal", "anonymized.io"];

// --- HEURISTIC DETECTION LOGIC ---
// This identifies sensitive columns based on their headers
const PII_RULES = {
    name: /name|first_name|last_name|full_name|employee|client/i,
    email: /email|e-mail|contact_email/i,
    phone: /phone|mobile|cell|contact_no|telephone/i,
    financial: /card|cc|credit_card|debit|account_number|ssn|social|tax_id|passport/i,
    location: /address|street|zip|postal|city|state/i
};

// --- CORE WORKER LOGIC ---
self.onmessage = async (e) => {
    const { type, content, fileName } = e.data;

    if (type === 'init') {
        // Boot up and report ready to the Main Thread
        self.postMessage({ type: 'ready' });
    }

    if (type === 'process') {
        try {
            self.postMessage({ type: 'status', msg: 'Decoding Data Structure...' });
            
            // 1. Convert the ArrayBuffer back to text
            const decoder = new TextDecoder('utf-8');
            const csvString = decoder.decode(content);

            self.postMessage({ type: 'status', msg: 'Running Neural Heuristics...' });

            // 2. Parse the CSV using PapaParse (handles commas inside quotes perfectly)
            Papa.parse(csvString, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const data = results.data;
                    const meta = results.meta;
                    let piiFound = 0;

                    // 3. Identify Target Columns
                    const targetColumns = {};
                    meta.fields.forEach(field => {
                        for (const [piiType, regex] of Object.entries(PII_RULES)) {
                            if (regex.test(field)) {
                                targetColumns[field] = piiType;
                                break;
                            }
                        }
                    });

                    self.postMessage({ type: 'status', msg: 'Injecting Synthetic Twins...' });

                    // 4. Perform Neural Masking (Swapping real data for fake data)
                    for (let i = 0; i < data.length; i++) {
                        const row = data[i];
                        
                        for (const [colName, piiType] of Object.entries(targetColumns)) {
                            if (row[colName]) {
                                // Apply the specific synthetic twin based on the data type
                                row[colName] = generateSyntheticData(piiType);
                                piiFound++;
                            }
                        }
                    }

                    self.postMessage({ type: 'status', msg: 'Rebuilding Secure File...' });

                    // 5. Convert back to CSV
                    const secureCSV = Papa.unparse(data);

                    // 6. Send success to main thread with the Liability Stats
                    self.postMessage({ 
                        type: 'success', 
                        result: secureCSV, 
                        fileName: fileName,
                        stats: { piiFound: piiFound }
                    });
                },
                error: function(err) {
                    self.postMessage({ type: 'error', msg: `Parse failure: ${err.message}` });
                }
            });

        } catch (error) {
            self.postMessage({ type: 'error', msg: "Catastrophic Memory Failure during deep scrub." });
        }
    }
};

// --- SYNTHETIC DATA GENERATOR ---
function generateSyntheticData(type) {
    const randomFirst = fakeFirstNames[Math.floor(Math.random() * fakeFirstNames.length)];
    const randomLast = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)];
    const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4 digit random

    switch(type) {
        case 'name':
            return `${randomFirst} ${randomLast}`;
        case 'email':
            const domain = fakeDomains[Math.floor(Math.random() * fakeDomains.length)];
            return `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}_${randomNum}@${domain}`;
        case 'phone':
            return `+00-555-${randomNum}`;
        case 'financial':
            return `XXXX-XXXX-XXXX-${randomNum}`;
        case 'location':
            return `${randomNum} Anonymized Avenue, Data City`;
        default:
            return `[SECURED_${randomNum}]`;
    }
}