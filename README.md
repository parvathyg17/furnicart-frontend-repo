# FurniCart Frontend

React + Vite single-page application for the FurniCart customer storefront and admin panel.

## Prerequisites

- Node.js 18+
- Running FurniCart backend (`http://localhost:8000`)

## Setup

```bash
cd frontend/furnicart-frontend
npm install
```

### Environment variables

Create `.env` in this directory:

```env
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend origin without `/api` suffix |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (must match backend `RAZORPAY_KEY_ID`) |

### Development

```bash
npm run dev
```

App: `http://localhost:5173`

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── pages/
│   ├── user/          # Storefront pages (shop, cart, checkout, profile, orders)
│   └── admin/         # Admin panel pages
├── features/            # API modules, Redux slices, hooks
├── components/        # Shared layout and UI components
├── routes/              # React Router (user + admin)
├── services/            # Axios API client
├── styles/              # CSS
└── utils/               # Helpers
```

## Customer routes

| Route | Page |
|-------|------|
| `/` | Home |
| `/shop` | Product listing (search, filter, sort) |
| `/product/:slug` | Product detail |
| `/login` | Login |
| `/signup` | Signup (supports `?ref=` referral token) |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/profile` | Profile (includes Refer & Earn when active) |
| `/profile/edit` | Edit profile |
| `/orders` | My orders |
| `/purchases` | My purchases |
| `/wallet` | Wallet balance and transactions |
| `/wishlist` | Wishlist |
| `/address` | Shipping addresses |

## Admin routes

Login: `/admin/login` (requires backend superuser)

| Route | Page |
|-------|------|
| `/admin/dashboard` | Dashboard analytics |
| `/admin/users` | User management |
| `/admin/products` | Products |
| `/admin/categories` | Categories |
| `/admin/room-types` | Room types |
| `/admin/inventory` | Inventory |
| `/admin/orders` | Orders |
| `/admin/orders/returns` | Returns |
| `/admin/reviews` | Reviews |
| `/admin/coupons` | Coupons |
| `/admin/offers` | Offers |
| `/admin/referral` | Referral program settings |
| `/admin/reports/sales` | Sales reports |

## API client

- Axios instance: `src/services/api.js`
- Base URL: `${VITE_API_URL}/api/`
- Sends cookies (`withCredentials: true`) for JWT auth
- Attaches CSRF token from cookies on mutating requests
- Automatically refreshes expired access tokens

## Payments (Razorpay)

1. User selects Razorpay at checkout.
2. Frontend calls `POST /api/orders/razorpay/initiate/`.
3. Razorpay checkout modal opens (`src/features/payments/razorpayCheckout.js`).
4. On success, frontend calls `POST /api/orders/razorpay/verify/`.

**Note:** Razorpay test accounts have per-transaction limits. Use smaller cart totals during development, or complete KYC and use live keys for production.

## Referral flow

- Signup links: `/signup?ref=<referral_token>`
- Referral code can also be entered manually on the signup form.
- Profile page shows referral code and share link when the admin referral program is active.

## State management

Redux Toolkit slices live under `src/features/` (auth, cart, profile, admin, etc.).

## Related documentation

- [Project overview](../../README.md)
- [Backend API](../../backend/README.md)
