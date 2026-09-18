# Financial Analytics Dashboard

A full-stack financial analytics application for tracking and analyzing company transactions, with JWT authentication, interactive charts, a searchable/filterable transaction table, and configurable CSV export.

## Features

- **Authentication**: JWT-based login with protected API routes
- **Dashboard**: Summary metrics (total revenue, total expenses, net balance), a revenue vs. expenses trend chart, and a category breakdown pie chart
- **Transaction Table**: Server-side pagination, multi-field filtering (category, status, user, date range, amount range), real-time search, and column sorting
- **CSV Export**: User-selectable columns, respects current filters, downloads directly through the browser

## Tech Stack

**Frontend**
- React + TypeScript (Vite)
- Material UI (MUI) for components
- Recharts for data visualization
- Axios for API requests
- React Router for client-side routing

**Backend**
- Node.js + TypeScript (Express)
- MongoDB Atlas via Mongoose
- JWT (`jsonwebtoken`) for authentication, `bcryptjs` for password hashing
- `csv-stringify` for CSV generation

## Prerequisites

- Node.js and npm installed
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/virens27/financial-analytics-dashboard.git
cd financial-analytics-dashboard
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following variables:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
ADMIN_USERNAME=your_chosen_username
ADMIN_PASSWORD_HASH=a_bcrypt_hash_of_your_chosen_password
```

To generate `ADMIN_PASSWORD_HASH`, create a temporary script (e.g. `hashPassword.ts`) with:

```ts
import bcrypt from "bcryptjs";
console.log(bcrypt.hashSync("your_chosen_password", 10));
```

Run it with `npx ts-node src/hashPassword.ts`, copy the printed hash into `.env`, then delete the script.

Seed the database with the provided sample data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API will run at `http://localhost:4000`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` with:

```
VITE_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

The app will run at `http://localhost:5173`.

### 4. Log in

Open `http://localhost:5173`, and log in with the username/password you chose when generating `ADMIN_PASSWORD_HASH` above.

## API Documentation

All endpoints are prefixed with `/api`. Endpoints other than login require an `Authorization: Bearer <token>` header.

### POST /api/auth/login

Authenticates a user and returns a JWT valid for 8 hours.

**Request body:**
```json
{ "username": "string", "password": "string" }
```

**Response (200):**
```json
{ "token": "jwt_string" }
```

**Response (401):** `{ "error": "Invalid username or password" }`

### GET /api/transactions

Returns a paginated, filtered, sorted list of transactions. All query parameters are optional.

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Case-insensitive partial match across user, category, and status |
| `category` | string | `Revenue` or `Expense` |
| `status` | string | `Paid` or `Pending` |
| `userId` | string | Partial match on user ID |
| `dateFrom` / `dateTo` | date string | Inclusive date range |
| `amountMin` / `amountMax` | number | Inclusive amount range |
| `sortBy` | string | Field to sort by (default: `date`) |
| `sortOrder` | `asc` \| `desc` | Sort direction (default: `desc`) |
| `page` | number | Page number, 1-indexed (default: `1`) |
| `limit` | number | Results per page (default: `10`) |

**Response (200):**
```json
{
  "data": [ { "transactionId": 1, "date": "...", "amount": 100, "category": "Revenue", "status": "Paid", "userId": "user_001" } ],
  "pagination": { "total": 300, "page": 1, "limit": 10, "totalPages": 30 }
}
```

### GET /api/transactions/export

Streams a CSV file of all transactions matching the given filters (same filter parameters as above, no pagination applied). Requires a `columns` parameter.

| Parameter | Type | Description |
|---|---|---|
| `columns` | string | **Required.** Comma-separated list of fields to include, e.g. `transactionId,date,amount,category,status,userId` |

**Response (200):** A `text/csv` file with `Content-Disposition: attachment`, triggering a browser download.

## Project Structure

```
financial-dashboard/
├── backend/
│   ├── src/
│   │   ├── index.ts            # Express app entry point
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # auth, transactions, export
│   │   ├── middleware/          # JWT auth middleware
│   │   ├── utils/                # Shared filter-building logic
│   │   ├── data/                 # Sample transaction data
│   │   └── seed.ts              # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── api/                  # API client and typed request functions
│   │   ├── components/           # ProtectedRoute, TransactionsTable, ExportModal
│   │   └── pages/                # Login, Dashboard
```

## Notes and Assumptions

- Authentication uses a single admin account configured via environment variables, rather than a full user-registration system, since the assignment's scope is transaction analytics rather than user management.
- Charts aggregate all transactions client-side; this is a reasonable simplification for a dataset of this size (300 records) but would move to a database aggregation pipeline for a larger production dataset.
- The MongoDB Atlas cluster's network access is set to allow connections from any IP, appropriate for local development on this free-tier project.