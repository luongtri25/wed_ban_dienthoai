# wed_ban_dienthoai

Fullstack phone-store project with:
- `backend`: Node.js + Express + MongoDB (Mongoose), JWT auth, Joi validation
- `frontend`: Next.js App Router + React + Tailwind CSS

## 1) Project structure

```text
wed_ban_dienthoai/
  backend/
    src/
      app.js
      server.js
      config/
      controllers/
      middlewares/
      models/
      routes/
      services/
      validations/
  frontend/
    src/
      app/
      components/
      lib/
  postman/
    phone-store-backend.postman_collection.json
```

## 2) Prerequisites

- Node.js 18+ (recommended 20+)
- npm
- MongoDB Atlas cluster (or local MongoDB)

## 3) Environment variables

Create these files:

### `backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority&appName=<appName>
JWT_SECRET=<your_secret>
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<google_oauth_web_client_id>
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same_google_oauth_web_client_id>
```

Notes:
- Backend reads `backend/.env`.
- Frontend reads `frontend/.env.local`.
- Do not commit real secrets.

## 4) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 5) Run in development

Open 2 terminals.

Terminal A:

```bash
cd backend
npm run dev
```

Terminal B:

```bash
cd frontend
npm run dev
```

URLs:
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 6) Authentication and roles

Auth endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`

Login/Register response includes:
- `token` (JWT)
- `user` object

Protected routes use:
- `Authorization: Bearer <token>`

Role rules:
- `admin` required for create/update/delete on products, brands, categories
- `admin` required for user management and order read/update/delete
- Authenticated user can create order (`POST /api/orders`)

## 7) API summary

### Public

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`
- `GET /api/brands`
- `GET /api/brands/:id`
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`

### Auth + Admin

- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/brands`
- `PUT /api/brands/:id`
- `DELETE /api/brands/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`

### Auth only

- `POST /api/orders`

## 8) Postman

Import:
- `postman/phone-store-backend.postman_collection.json`

Suggested order:
1. `Auth - Register`
2. `Auth - Login`
3. `Brands - Create`
4. `Categories - Create`
5. `Products - Create`
6. `Orders - Create`

## 9) Frontend behavior

- Home, products list, product detail are SSR data-driven pages.
- Login/Register are client pages that call backend auth API.
- Login page supports Google Sign-In and then stores backend JWT in `localStorage`.
- Header reads auth state from `localStorage` and switches between:
  - `Dang nhap` button
  - user name + `Dang xuat`

## 10) Google OAuth setup

1. Go to Google Cloud Console -> APIs & Services -> Credentials.
2. Create OAuth Client ID, choose **Web application**.
3. Add Authorized JavaScript origins:
   - `http://localhost:3000`
4. Put Client ID into:
   - `backend/.env` -> `GOOGLE_CLIENT_ID`
   - `frontend/.env.local` -> `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
5. Restart backend + frontend dev servers.

## 11) Common issues

- `MongoServerError: bad auth`: wrong `MONGODB_URI` credentials or not URL-encoded password.
- Frontend cannot reach API: check `NEXT_PUBLIC_API_URL`.
- Google button not showing: check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and origin config in Google Console.
- 403 on create/update/delete: token user is not `admin`.
