# JP Clothing update notes

## Changes included
- Replaced the store logo image with the uploaded JP Clothing logo.
- UPI Pay button uses `cmvinoth24-2@okicici` and opens a UPI app using a `upi://pay` link.
- Removed coupon-code entry from cart.
- Free delivery threshold is ₹1,000; delivery fee is ₹49 below that threshold.
- Admin product form includes available stock quantity; product cards display stock when product data includes `stock` or `quantity`.
- Admin order table has View / Print Invoice, and it prints order/customer/items/totals and invoice number after approval.

## Important
A plain UPI deep link cannot automatically verify whether payment succeeded. Verify payment in your UPI/bank app before approving an order. Never treat the customer's checkbox as proof of payment.

## Deployment
- Main customer site: deploy the project root as a Vite app.
- Separate admin app: deploy `admin-panel` as another Vite app if you want a separate admin URL.
- Backend: deploy `server` as a Render Web Service (`npm install`, `npm start`).
- Set `VITE_API_URL` in each Vite deployment to the deployed backend API base URL including `/api`, e.g. `https://YOUR-SERVICE.onrender.com/api`.
- For the main customer frontend set `VITE_UPI_ID=cmvinoth24-2@okicici` and `VITE_UPI_NAME=JP Clothing`.
- Configure `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` as Render environment variables. Do not upload `.env` files or secrets to GitHub.
- Update `FRONTEND_URL`/CORS allow-list to your deployed frontend origins before production.
