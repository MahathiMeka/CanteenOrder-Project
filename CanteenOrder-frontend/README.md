# CanteenOrder Frontend

Responsive React + Bootstrap frontend for the CanteenOrder Spring Boot assignment.

## Features
- Add canteen orders (the ID is never entered by the user)
- Display orders from the backend
- Delete an order
- Search by order ID, order code, or pickup status
- Filter by pickup status
- Frontend validation and feedback messages
- Loading, empty, and backend connection-error states
- Responsive desktop/mobile layouts

## Requirements
- Node.js 18 or newer
- Spring Boot backend running locally

## Run it
1. Open a terminal in this folder.
2. Install packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown by Vite, usually `http://localhost:5173`.

## Backend URL
The API base URL is at the top of `src/App.jsx`:
```js
const API_BASE_URL = 'http://localhost:8080/api/canteen-orders';
```
Change it to match the actual `@RequestMapping` in your Spring Boot controller.

This frontend expects:
- `GET /api/canteen-orders` -> JSON array of orders
- `POST /api/canteen-orders` -> creates an order
- `DELETE /api/canteen-orders/{id}` -> deletes an order

The frontend sends `orderCode`, `itemCount`, `totalCost`, and `pickupStatus` as JSON. It does not send an ID.

## CORS
If the browser reports a CORS error, allow `http://localhost:5173` from your Spring Boot controller or global CORS configuration. Do not disable browser security.

## Build check
Run:
```bash
npm run build
```
