use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineItem {
    pub id: String,
    pub itinerary_id: String,
    pub title: String,
    pub description: Option<String>,
    pub location_name: Option<String>,
    pub location_address: Option<String>,
    pub location_lat: Option<f64>,
    pub location_lng: Option<f64>,
    pub start_datetime: Option<DateTime<Utc>>,
    pub end_datetime: Option<DateTime<Utc>>,
    pub budget_amount: Option<i32>,
    pub memo: Option<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTimelineItemRequest {
    pub title: String,
    pub description: Option<String>,
    pub location_name: Option<String>,
    pub location_address: Option<String>,
    pub location_lat: Option<f64>,
    pub location_lng: Option<f64>,
    pub start_datetime: Option<DateTime<Utc>>,
    pub end_datetime: Option<DateTime<Utc>>,
    pub budget_amount: Option<i32>,
    pub memo: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTimelineItemRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub location_name: Option<String>,
    pub location_address: Option<String>,
    pub location_lat: Option<f64>,
    pub location_lng: Option<f64>,
    pub start_datetime: Option<DateTime<Utc>>,
    pub end_datetime: Option<DateTime<Utc>>,
    pub budget_amount: Option<i32>,
    pub memo: Option<String>,
    pub sort_order: Option<i32>,
}

impl TimelineItem {
    pub fn new(itinerary_id: String, title: String, sort_order: i32) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            itinerary_id,
            title,
            description: None,
            location_name: None,
            location_address: None,
            location_lat: None,
            location_lng: None,
            start_datetime: None,
            end_datetime: None,
            budget_amount: None,
            memo: None,
            sort_order,
            created_at: now,
            updated_at: now,
        }
    }
}
