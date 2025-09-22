use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Itinerary {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub edit_password_hash: Option<String>,
    pub theme: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateItineraryRequest {
    pub title: String,
    pub description: Option<String>,
    pub edit_password: Option<String>,
    pub theme: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateItineraryRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub theme: Option<String>,
}

impl Itinerary {
    pub fn new(title: String, description: Option<String>, edit_password_hash: Option<String>) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title,
            description,
            edit_password_hash,
            theme: "simple".to_string(),
            created_at: now,
            updated_at: now,
        }
    }
}
