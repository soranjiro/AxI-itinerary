use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub itinerary_id: String,
    pub role: ChatRole,
    pub content: String,
    pub llm_provider: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ChatRole {
    User,
    Assistant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateChatMessageRequest {
    pub role: ChatRole,
    pub content: String,
    pub llm_provider: Option<String>,
}

impl ChatMessage {
    pub fn new(itinerary_id: String, role: ChatRole, content: String, llm_provider: Option<String>) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            itinerary_id,
            role,
            content,
            llm_provider,
            created_at: Utc::now(),
        }
    }
}
