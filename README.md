# EzShop

A full-stack e-commerce web application built on the MERN stack (MongoDB, Express, React, Node.js) featuring customer authentication, product catalog browsing, wishlist management, shopping cart, and Razorpay checkout integration.

---

## Features

- **Authentication & Security**: User registration, login, and session persistence using JWT stored in secure `HttpOnly` cookies. Passwords hashed with `bcryptjs`.
- **Product Catalog**: Server-side pagination, search, category filtering, and detailed product view.
- **Wishlist**: Per-user saved items with toggle add/remove functionality.
- **Shopping Cart**: Dynamic bag management with quantity controls, subtotal/tax calculations, and custom confirmation modals.
- **Checkout & Orders**: Razorpay payment gateway integration, order creation, payment verification, and past order history tracking.
- **Modern UI**: Built with React 19, Vite, Tailwind CSS v4, and Framer Motion for responsive layouts and subtle micro-interactions.
- **Deployment Ready**: Configured for unified multi-service deployment on Vercel using `vercel.json` rewrites.

---

## Tech Stack

### Frontend
- **Framework**: React 19 (SPA via Vite)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `cookie-parser`, `bcryptjs`
- **Payments**: Razorpay SDK
- **CORS**: Configured with credential support for local development and production domains

---

## Project Structure

```text
ShopKart-Lab/
├── backend/
│   ├── config/          # Database and service configs (Razorpay, etc.)
│   ├── controllers/     # Route controller logic
│   ├── middlewares/     # Auth and validation middleware
│   ├── models/          # Mongoose schemas (Customer, Product, Cart, Wishlist, Order)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helper functions (token generation, etc.)
│   ├── .env.example     # Environment template
│   ├── index.js         # Backend server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Shared UI components (Navbar, Modals, etc.)
│   │   ├── context/     # React context providers (CartContext, etc.)
│   │   ├── pages/       # Route views (Home, Products, Cart, Orders, Auth)
│   │   ├── services/    # Axios instance and API abstraction
│   │   ├── App.jsx      # Routing configuration
│   │   └── main.jsx     # Frontend entrypoint
│   ├── vite.config.js   # Vite configuration with local API proxy
│   └── package.json
├── vercel.json          # Multi-service Vercel deployment orchestration
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A running MongoDB instance (local or MongoDB Atlas connection string)
- A [Razorpay](https://razorpay.com/) account for test API keys

### 1. Clone the repository

```bash
git clone https://github.com/w3bxrj/EzShop.git
cd EzShop
```

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` directory based on `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Fill in the required values:

```env
dbUrl="mongodb+srv://<username>:<password>@cluster.mongodb.net/ezshop?retryWrites=true&w=majority"
JWT_SECRET="your_secure_jwt_secret"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
PORT=8001
CLIENT_URL="http://localhost:5173"
```

For the frontend (optional during local development since Vite dev proxy is pre-configured):
Create `frontend/.env` if you want to override the default API endpoint:

```env
VITE_API_URL="http://localhost:8001/api"
```

### 3. Install Dependencies & Run

#### Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:8001`.

#### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start on `http://localhost:5173`.

---

## API Reference

All backend routes are mounted under `/api` (and backward-compatible on `/`):

| Resource | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Health** | `GET` | `/api/` | Service health status check | No |
| **Auth** | `POST` | `/api/customers/register` | Register a new user | No |
| **Auth** | `POST` | `/api/customers/login` | Authenticate user & issue cookie | No |
| **Auth** | `POST` | `/api/customers/logout` | Clear auth token cookie | Yes |
| **Auth** | `GET` | `/api/customers/profile` | Retrieve authenticated profile | Yes |
| **Products** | `GET` | `/api/products` | Get paginated products (filters, search) | No |
| **Products** | `GET` | `/api/products/:id` | Get single product details | No |
| **Products** | `POST` | `/api/products` | Create a product entry | Admin |
| **Wishlist** | `GET` | `/api/wishlist` | Get current user's wishlist items | Yes |
| **Wishlist** | `POST` | `/api/wishlist/:productId`| Add item to wishlist | Yes |
| **Wishlist** | `DELETE`| `/api/wishlist/:productId`| Remove item from wishlist | Yes |
| **Cart** | `GET` | `/api/cart` | Get current user's cart | Yes |
| **Cart** | `POST` | `/api/cart` | Add item / update quantity | Yes |
| **Cart** | `DELETE`| `/api/cart/:productId` | Remove specific item from cart | Yes |
| **Cart** | `DELETE`| `/api/cart` | Clear entire cart | Yes |
| **Orders** | `POST` | `/api/orders/create` | Initialize Razorpay order | Yes |
| **Orders** | `POST` | `/api/orders/verify` | Verify payment signature & save order | Yes |
| **Orders** | `GET` | `/api/orders` | List user order history | Yes |
| **Orders** | `GET` | `/api/orders/:id` | View order breakdown by ID | Yes |

---

## Deployment

To deploy:
1. Connect this repository to your Vercel account.
2. Add your production environment variables (`dbUrl`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) in **Vercel Project Settings > Environment Variables**.
3. Deploy directly via git push or Vercel CLI.
