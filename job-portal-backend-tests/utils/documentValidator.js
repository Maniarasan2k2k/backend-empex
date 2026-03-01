// ============================================================
// documentValidator.js
// Centralised validation rules for company document numbers.
// Called by employeeController → validateCompanyDocuments()
// ============================================================

const DOC_RULES = {
    // PAN: 5 letters + 4 digits + 1 letter  (e.g. ABCDE1234F)
    pan: {
        regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        label: 'PAN',
        example: 'ABCDE1234F',
        hint: 'Must be 10 characters: 5 letters, 4 digits, 1 letter (uppercase)'
    },

    // GST IN: 2-digit state code + PAN (10 chars) + digit + letter/digit + Z + checksum
    // e.g. 29ABCDE1234F1Z5
    gst: {
        regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        label: 'GSTIN',
        example: '29ABCDE1234F1Z5',
        hint: 'Must be 15 characters in standard GSTIN format'
    },

    // Udyam Registration Number: UDYAM-XX-00-0000000  (e.g. UDYAM-TN-01-0012345)
    udyam: {
        regex: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/,
        label: 'Udyam Registration',
        example: 'UDYAM-TN-01-0012345',
        hint: 'Must follow pattern: UDYAM-[STATE]-[DISTRICT]-[7 digits]'
    },

    // CIN: Corporate Identity Number  (e.g. L17110MH1973PLC013328)
    cin: {
        regex: /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
        label: 'CIN',
        example: 'L17110MH1973PLC013328',
        hint: 'Must be 21 characters in standard CIN format (L/U + 5 digits + state + year + 3 letters + 6 digits)'
    }
};

/**
 * validateDocumentNumber(type, number)
 * Returns { valid: Boolean, message: String }
 */
const validateDocumentNumber = (type, number) => {
    const normalizedType = type?.toLowerCase()?.trim();
    const normalizedNumber = number?.toUpperCase()?.trim();

    const rule = DOC_RULES[normalizedType];

    if (!rule) {
        return {
            valid: false,
            message: `Unknown document type: "${type}". Allowed: pan, gst, udyam, cin`
        };
    }

    if (!normalizedNumber || normalizedNumber === '' || normalizedNumber === 'PENDING') {
        return {
            valid: false,
            message: `${rule.label} number is required`
        };
    }

    if (!rule.regex.test(normalizedNumber)) {
        return {
            valid: false,
            message: `Invalid ${rule.label} format. ${rule.hint}. Example: ${rule.example}`
        };
    }

    return { valid: true, message: `${rule.label} is valid` };
};

/**
 * validateDocumentsArray(documents)
 * Validates an array of { type, number } objects.
 * Returns { isValid: Boolean, errors: Array }
 */
const validateDocumentsArray = (documents) => {
    if (!Array.isArray(documents) || documents.length === 0) {
        return { isValid: false, errors: [{ field: 'documents', message: 'At least one document is required' }] };
    }

    const errors = [];
    const seenTypes = new Set();

    documents.forEach((doc, index) => {
        // Duplicate type check
        if (seenTypes.has(doc.type?.toLowerCase())) {
            errors.push({ field: `documents[${index}].type`, message: `Duplicate document type: "${doc.type}"` });
        } else {
            seenTypes.add(doc.type?.toLowerCase());
        }

        // Validate number
        const result = validateDocumentNumber(doc.type, doc.number);
        if (!result.valid) {
            errors.push({ field: `documents[${index}].number`, message: result.message });
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = { validateDocumentNumber, validateDocumentsArray, DOC_RULES };
