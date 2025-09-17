use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackingItem {
    pub id: String,
    pub itinerary_id: String,
    pub item_name: String,
    pub category: Option<String>,
    pub quantity: i32,
    pub is_checked: bool,
    pub memo: Option<String>,
    pub assignee: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePackingItemRequest {
    pub item_name: String,
    pub category: Option<String>,
    pub quantity: Option<i32>,
    pub memo: Option<String>,
    pub assignee: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePackingItemRequest {
    pub item_name: Option<String>,
    pub category: Option<String>,
    pub quantity: Option<i32>,
    pub is_checked: Option<bool>,
    pub memo: Option<String>,
    pub assignee: Option<String>,
}

impl PackingItem {
    pub fn new(itinerary_id: String, item_name: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            itinerary_id,
            item_name,
            category: None,
            quantity: 1,
            is_checked: false,
            memo: None,
            assignee: None,
            created_at: now,
            updated_at: now,
        }
    }
}
