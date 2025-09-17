pub mod models;

pub use models::{
    budget::{BudgetItem, CreateBudgetItemRequest, UpdateBudgetItemRequest},
    chat::{ChatMessage, CreateChatMessageRequest},
    itinerary::{CreateItineraryRequest, Itinerary, UpdateItineraryRequest},
    packing::{CreatePackingItemRequest, PackingItem, UpdatePackingItemRequest},
    timeline::{CreateTimelineItemRequest, TimelineItem, UpdateTimelineItemRequest},
};

use wasm_bindgen::prelude::*;

// Set up wee_alloc as the global allocator
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// WASM exports
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// エラーハンドリング
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

// Utility functions for frontend integration
#[wasm_bindgen]
pub fn generate_uuid() -> String {
    uuid::Uuid::new_v4().to_string()
}

#[wasm_bindgen]
pub fn validate_email(email: &str) -> bool {
    // Simple email validation
    email.contains('@') && email.contains('.')
}

#[wasm_bindgen]
pub fn format_currency(amount: i32) -> String {
    format!("¥{}", amount.to_string().chars().rev().enumerate().map(|(i, c)| {
        if i > 0 && i % 3 == 0 { format!(",{}", c) } else { c.to_string() }
    }).collect::<String>().chars().rev().collect::<String>())
}

#[wasm_bindgen]
pub fn parse_datetime(datetime_str: &str) -> Result<String, JsValue> {
    match chrono::DateTime::parse_from_rfc3339(datetime_str) {
        Ok(dt) => Ok(dt.format("%Y-%m-%d %H:%M").to_string()),
        Err(e) => Err(JsValue::from_str(&format!("Invalid datetime: {}", e))),
    }
}

#[wasm_bindgen]
pub fn calculate_duration(start: &str, end: &str) -> Result<i32, JsValue> {
    let start_dt = chrono::DateTime::parse_from_rfc3339(start)
        .map_err(|e| JsValue::from_str(&format!("Invalid start datetime: {}", e)))?;
    let end_dt = chrono::DateTime::parse_from_rfc3339(end)
        .map_err(|e| JsValue::from_str(&format!("Invalid end datetime: {}", e)))?;

    let duration = end_dt.signed_duration_since(start_dt);
    Ok(duration.num_minutes() as i32)
}

// バリデーション機能
#[wasm_bindgen]
pub fn validate_itinerary_data(data: &str) -> Result<bool, JsValue> {
    let itinerary: CreateItineraryRequest = serde_json::from_str(data)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON: {}", e)))?;

    if itinerary.title.trim().is_empty() {
        return Err(JsValue::from_str("Title is required"));
    }

    Ok(true)
}

#[wasm_bindgen]
pub fn validate_timeline_data(data: &str) -> Result<bool, JsValue> {
    let timeline: CreateTimelineItemRequest = serde_json::from_str(data)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON: {}", e)))?;

    if timeline.title.trim().is_empty() {
        return Err(JsValue::from_str("Title is required"));
    }

    Ok(true)
}

// データ変換機能
#[wasm_bindgen]
pub fn create_itinerary_from_json(data: &str) -> Result<String, JsValue> {
    let request: CreateItineraryRequest = serde_json::from_str(data)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON: {}", e)))?;

    let itinerary = Itinerary {
        id: generate_uuid(),
        title: request.title,
        description: request.description,
        edit_password_hash: request.edit_password.map(|_| "placeholder_hash".to_string()),
        theme: request.theme.unwrap_or_else(|| "simple".to_string()),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    serde_json::to_string(&itinerary)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

#[wasm_bindgen]
pub fn create_timeline_item_from_json(data: &str, itinerary_id: &str) -> Result<String, JsValue> {
    let request: CreateTimelineItemRequest = serde_json::from_str(data)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON: {}", e)))?;

    let timeline_item = TimelineItem {
        id: generate_uuid(),
        itinerary_id: itinerary_id.to_string(),
        title: request.title,
        description: request.description,
        location_name: request.location_name,
        location_address: request.location_address,
        location_lat: request.location_lat,
        location_lng: request.location_lng,
        start_datetime: request.start_datetime,
        end_datetime: request.end_datetime,
        budget_amount: request.budget_amount,
        memo: request.memo,
        sort_order: 1, // デフォルト値
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    serde_json::to_string(&timeline_item)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

#[wasm_bindgen]
pub fn create_packing_item_from_json(data: &str, itinerary_id: &str) -> Result<String, JsValue> {
    let request: CreatePackingItemRequest = serde_json::from_str(data)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON: {}", e)))?;

    let packing_item = PackingItem {
        id: generate_uuid(),
        itinerary_id: itinerary_id.to_string(),
        item_name: request.item_name,
        category: request.category,
        quantity: request.quantity.unwrap_or(1),
        is_checked: false,
        memo: request.memo,
        assignee: request.assignee,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    serde_json::to_string(&packing_item)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

#[wasm_bindgen]
pub fn create_budget_item_from_json(data: &str, itinerary_id: &str) -> Result<String, JsValue> {
    let request: CreateBudgetItemRequest = serde_json::from_str(data)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON: {}", e)))?;

    let budget_item = BudgetItem {
        id: generate_uuid(),
        itinerary_id: itinerary_id.to_string(),
        category: request.category,
        item_name: request.item_name,
        planned_amount: request.planned_amount,
        actual_amount: request.actual_amount,
        payer: request.payer,
        split_method: request.split_method.unwrap_or_else(|| "individual".to_string()),
        expense_date: request.expense_date,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    serde_json::to_string(&budget_item)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}
