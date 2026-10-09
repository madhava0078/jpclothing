# JP Clothing — MongoDB Full Stack

This is the existing React/Vite project with a Node.js + Express + MongoDB backend added.

## 1. Start MongoDB

### Local MongoDB
Use:
`mongodb://127.0.0.1:27017/jp_clothing`

### MongoDB Atlas
Create `server/.env` from `server/.env.example` and set `MONGODB_URI` to your Atlas connection string.

## 2. Start backend

```bash
cd server
npm install
npm start
```

Backend: `http://localhost:5000`

## 3. Start frontend

Open another terminal in the project root:

```bash
npm install
npm run dev
```

Frontend: the Vite URL shown in the terminal.

## Admin

Default credentials:
- Username: `jpadmin`
- Password: `jp007`

Change them in `server/.env` for real deployment.

## MongoDB data

The backend stores:
- Users
- Orders
- Admin-added products

The browser localStorage is still used only for UI preferences, cart, wishlist, and the login session/token. Passwords are never stored in browser localStorage.
