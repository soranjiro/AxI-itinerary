use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetItem {
    pub id: String,
    pub itinerary_id: String,
    pub category: String,
    pub item_name: String,
    pub planned_amount: Option<i32>,
    pub actual_amount: Option<i32>,
    pub payer: Option<String>,
    pub split_method: String,
    pub expense_date: Option<String>, // ISO date string
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateBudgetItemRequest {
    pub category: String,
    pub item_name: String,
    pub planned_amount: Option<i32>,
    pub actual_amount: Option<i32>,
    pub payer: Option<String>,
    pub split_method: Option<String>,
    pub expense_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateBudgetItemRequest {
    pub category: Option<String>,
    pub item_name: Option<String>,
    pub planned_amount: Option<i32>,
    pub actual_amount: Option<i32>,
    pub payer: Option<String>,
    pub split_method: Option<String>,
    pub expense_date: Option<String>,
}

impl BudgetItem {
    pub fn new(itinerary_id: String, category: String, item_name: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            itinerary_id,
            category,
            item_name,
            planned_amount: None,
            actual_amount: None,
            payer: None,
            split_method: "equal".to_string(),
            expense_date: None,
            created_at: now,
            updated_at: now,
        }
    }
}
