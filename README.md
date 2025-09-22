# AxI Itinerary

AxI Itinerary is a web application designed as a travel itinerary planner and guidebook, helping users organize and manage their trips effectively.

## Architecture & Tech Stack

This project uses a modern web architecture with the following components:

- **Cloudflare Workers**: Serverless edge computing for API endpoints and data processing.
- **D1 Database**: Fast, SQLite-compatible database for storing itinerary data.
- **Svelte**: Lightweight frontend framework for responsive UI.
- **Rust (WebAssembly)**: High-performance client-side logic for complex calculations like itinerary optimization and data manipulation.

### Why This Structure?

- **Rust's Role**: Rust compiles to WebAssembly, enabling fast, safe execution of heavy computations (e.g., route planning, budget calculations) directly in the browser without server round-trips.
- **Backend Structure**: The "backend" is split into two parts:
  - Server-side: Cloudflare Workers handle API routes and database interactions.
  - Client-side: Rust WASM library provides performant logic for the frontend.
- **Tech Choices**: Cloudflare Workers offer global edge deployment with low latency. D1 ensures quick queries. Svelte keeps the UI snappy. Rust WASM avoids JavaScript performance bottlenecks for CPU-intensive tasks.

## Local Setup

### Prerequisites

- Node.js (version 18 or higher)
- pnpm
- Rust (with wasm-pack)
- Cloudflare Wrangler CLI

### Installation

1. Clone the repository.

   ```sh
   git clone https://github.com/soranjiro/AxI-itinerary.git
   cd AxI-itinerary
   ```

2. Install dependencies.

   ```sh
   pnpm install
   ```

3. Add the Rust WASM target (first time only).

   ```sh
   rustup target add wasm32-unknown-unknown
   ```

4. Install wasm-pack (first time only).

   ```sh
   cargo install wasm-pack
   ```

### Database Setup

Use D1 Database locally.

1. Create the D1 database (first time only).

   ```sh
   wrangler d1 create axi-itinerary-db --local
   ```

2. Apply migrations.

   ```sh
   wrangler d1 migrations apply axi-itinerary-db --local
   ```

3. Check migrations.

   ```sh
   wrangler d1 migrations list axi-itinerary-db --local
   ```

4. Verify database contents (optional).

   ```sh
   wrangler d1 execute axi-itinerary-db --local --command "SELECT name FROM sqlite_master WHERE type='table';"
   wrangler d1 execute axi-itinerary-db --local --command "SELECT * FROM users;"
   ```

### Start Development Server

```sh
make dev
```

This builds the WASM library and starts the local Cloudflare Workers development server. Access the app at `http://localhost:8787` in your browser.

### Build

```sh
make build
```

### Deploy

```sh
make deploy
```
