import init, {
    generate_uuid,
    validate_email,
    format_currency,
    parse_datetime,
    calculate_duration,
    validate_itinerary_data,
    validate_timeline_data,
    create_itinerary_from_json,
    create_timeline_item_from_json,
    create_packing_item_from_json,
    create_budget_item_from_json
} from './wasm/axi_itinerary_backend.js';

// WASMモジュールの初期化
let wasmInitialized = false;

export async function initWasm() {
    if (!wasmInitialized) {
        await init();
        wasmInitialized = true;
    }
}

// Utility functions
export function generateUuid() {
    return generate_uuid();
}

export function validateEmail(email: string) {
    return validate_email(email);
}

export function formatCurrency(amount: number) {
    return format_currency(amount);
}

export function parseDatetime(datetimeStr: string) {
    try {
        return parse_datetime(datetimeStr);
    } catch (e) {
        throw new Error(`Failed to parse datetime: ${e}`);
    }
}

export function calculateDuration(start: string, end: string) {
    try {
        return calculate_duration(start, end);
    } catch (e) {
        throw new Error(`Failed to calculate duration: ${e}`);
    }
}

// Validation functions
export function validateItineraryData(data: object) {
    try {
        return validate_itinerary_data(JSON.stringify(data));
    } catch (e) {
        throw new Error(`Validation failed: ${e}`);
    }
}

export function validateTimelineData(data: object) {
    try {
        return validate_timeline_data(JSON.stringify(data));
    } catch (e) {
        throw new Error(`Validation failed: ${e}`);
    }
}

// Data creation functions
export function createItineraryFromJson(data: object) {
    try {
        const result = create_itinerary_from_json(JSON.stringify(data));
        return JSON.parse(result);
    } catch (e) {
        throw new Error(`Failed to create itinerary: ${e}`);
    }
}

export function createTimelineItemFromJson(data: object, itineraryId: string) {
    try {
        const result = create_timeline_item_from_json(JSON.stringify(data), itineraryId);
        return JSON.parse(result);
    } catch (e) {
        throw new Error(`Failed to create timeline item: ${e}`);
    }
}

export function createPackingItemFromJson(data: object, itineraryId: string) {
    try {
        const result = create_packing_item_from_json(JSON.stringify(data), itineraryId);
        return JSON.parse(result);
    } catch (e) {
        throw new Error(`Failed to create packing item: ${e}`);
    }
}

export function createBudgetItemFromJson(data: object, itineraryId: string) {
    try {
        const result = create_budget_item_from_json(JSON.stringify(data), itineraryId);
        return JSON.parse(result);
    } catch (e) {
        throw new Error(`Failed to create budget item: ${e}`);
    }
}

// Auto-initialize WASM when module is imported
if (typeof window !== 'undefined') {
    initWasm().catch(console.error);
}
