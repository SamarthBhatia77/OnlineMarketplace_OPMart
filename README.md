# OOPMart

OOPMart is a full-stack, multi-role e-commerce platform built around a three-tier marketplace that connects wholesalers, retailers, and customers in one coordinated supply chain.[cite:1] The system is designed to support bulk procurement, retailer-led resale, customer shopping, wallet-based payments, ratings, and location-aware product discovery in a single product lifecycle.[cite:1]

It is presented in the technical documentation as a production-ready project with 10,000+ lines of code, 25+ REST API endpoints, 8 role-specific dashboard pages, 7 MongoDB collections, real-time inventory behavior, and multi-layer authentication.[cite:1]

## Table of Contents

- [Overview](#overview)
- [Why OOPMart](#why-oopmart)
- [Core Features](#core-features)
- [User Roles](#user-roles)
- [Product Lifecycle](#product-lifecycle)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Application Structure](#application-structure)
- [Authentication and Authorization](#authentication-and-authorization)
- [Key Modules](#key-modules)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [Transactions and Wallet Logic](#transactions-and-wallet-logic)
- [Location-Based Commerce](#location-based-commerce)
- [State Management](#state-management)
- [Security Practices](#security-practices)
- [Performance and Scalability](#performance-and-scalability)
- [Error Handling and Testing](#error-handling-and-testing)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Future Roadmap](#future-roadmap)
- [Learning Outcomes](#learning-outcomes)

## Overview

OOPMart models real-world commerce through three layers. Wholesalers upload products in fixed bulk quantities, retailers purchase those products and assign their own resale price, and customers discover and buy from retailer inventory rather than directly from wholesalers.[cite:1]

The platform uses separate data models for each stage of the commerce chain: `WProd` for wholesale products, `RProd` for retailer inventory, and `CProd` for customer purchases and reviews.[cite:1] This creates a clean and traceable flow from supply creation to resale to final consumption.[cite:1]

## Why OOPMart

Most simple e-commerce projects focus only on a seller and a buyer. OOPMart is different because it models the operational complexity of a marketplace where inventory changes ownership, margins are created between procurement and retail sale, and payments must remain consistent across multiple parties.[cite:1]

The platform also introduces location-aware sorting, wallet-based transactions, OTP verification, Google OAuth, role-specific dashboards, and pseudo-real-time updates through browser events.[cite:1] As a result, it serves both as a usable application and as a strong full-stack systems case study.[cite:1]

## Core Features

- Three-tier marketplace connecting wholesalers, retailers, and customers.[cite:1]
- Role-based dashboards with isolated workflows for each actor.[cite:1]
- Email/password authentication plus Google OAuth sign-in.[cite:1]
- OTP-based email verification with expiry and single-use enforcement.[cite:1]
- Wholesale catalog creation with category, pricing, stock, and image upload.[cite:1]
- Retailer procurement flow with atomic stock and wallet transfer logic.[cite:1]
- Customer product discovery with sorting by rating, price, stock, and distance.[cite:1]
- Cart, checkout, wallet top-up, order history, and review submission.[cite:1]
- Real-time UI refresh patterns through custom browser events such as `inventoryUpdated`, `walletUpdated`, and `searchQueryChanged`.[cite:1]
- Ratings aggregation and review-driven product ranking.[cite:1]

## User Roles

| Role | Primary Responsibility | Key Capabilities |
|------|------------------------|------------------|
| Wholesaler | Supply-side inventory owner.[cite:1] | Add products in bulk quantities, manage stock, edit/delete products, view what retailers buy.[cite:1] |
| Retailer | Middle layer between wholesale and consumer demand.[cite:1] | Buy inventory from wholesalers, set resale prices, manage retail stock, track profit potential.[cite:1] |
| Customer | End consumer in the marketplace.[cite:1] | Browse retailer products, sort/filter items, add to cart, pay via wallet, track orders, leave reviews.[cite:1] |

The role selected at signup is central to the product experience and determines the dashboard and operations available to the user.[cite:1] The documentation explicitly notes that role assignment is immutable in the current flow and is enforced in both frontend routing and backend authorization logic.[cite:1]

## Product Lifecycle

A product begins as a wholesaler-owned `WProd` record with wholesale pricing and stock quantity.[cite:1] When a retailer buys from a wholesaler, the platform creates an `RProd` record representing retailer-owned sellable inventory, with the retailer’s chosen selling price and carried-over product metadata.[cite:1]

When a customer completes a purchase, the platform creates a `CProd` record containing the purchase snapshot and, later, the review value for that item.[cite:1] This record functions as both an order log and a review record, allowing downstream use in ratings aggregation and order history views.[cite:1]

## System Architecture

OOPMart follows a full-stack web architecture using Next.js and React on the frontend, Express.js and Node.js on the backend, and MongoDB Atlas with Mongoose in the data layer.[cite:1] The technical report describes this architecture as intentionally modular, with clear separation between rendering, business logic, persistence, and third-party integrations.[cite:1]

High-level system flow:

1. A user signs up or logs in.[cite:1]
2. The system authenticates and redirects based on role.[cite:1]
3. Wholesalers create source inventory in `WProd`.[cite:1]
4. Retailers purchase inventory and create `RProd` entries.[cite:1]
5. Customers browse `RProd` items, add them to cart, and check out.[cite:1]
6. Purchases create `CProd` records and wallet transactions while updating balances and stock atomically.[cite:1]
7. Customers later rate products, which feeds the ranking system.[cite:1]

## Tech Stack

| Layer | Technology | Purpose |
|------|------------|---------|
| Frontend | Next.js + React.[cite:1] | UI rendering, routing, role dashboards, interactive client behavior.[cite:1] |
| Styling | Tailwind CSS.[cite:1] | Responsive UI and utility-first design system.[cite:1] |
| Backend | Node.js + Express.js.[cite:1] | REST APIs, middleware, business logic, transaction workflows.[cite:1] |
| Database | MongoDB Atlas + Mongoose.[cite:1] | Document storage, schema validation, indexed querying, transaction sessions.[cite:1] |
| Auth | JWT, bcrypt, Google OAuth2.[cite:1] | Session management, password hashing, social sign-in.[cite:1] |
| Media | ImageKit.[cite:1] | Cloud image hosting and CDN delivery.[cite:1] |

## Application Structure

The report documents a Next.js App Router layout with pages dedicated to authentication, role dashboards, cart, wallet, orders, and order confirmation.[cite:1]

```text
app/
├── layout.js
├── page.js
├── signin/
│   └── page.js
├── verify_otp/
│   └── page.js
├── wholesaler/
│   └── page.js
├── retailer/
│   └── page.js
├── customer/
│   └── page.js
├── cart/
│   └── page.js
├── buy/
│   └── page.js
├── add-money/
│   └── page.js
└── thank-you/
    └── page.js

components/
├── navbar.jsx
├── footer.jsx
└── ...

lib/
└── searchFilter.js
```

This structure reflects a role-centric application design rather than a generic storefront layout.[cite:1] Each route corresponds to a major business workflow, keeping navigation and implementation aligned with the platform’s three-actor model.[cite:1]

## Authentication and Authorization

OOPMart supports both traditional credentials and Google sign-in. Users can register with email and password, then verify their email using a 6-digit OTP that expires in 10 minutes and can only be used once.[cite:1]

After verification, or after successful Google OAuth validation, the backend issues a JWT that contains user ID, role, and expiration metadata.[cite:1] The frontend stores the JWT and user object in `localStorage` and includes the token in the `Authorization` header for subsequent authenticated requests.[cite:1]

Role-based access control is enforced in two layers. The frontend redirects users away from pages that do not match their role, and the backend validates protected routes before allowing state-changing operations.[cite:1]

### Authentication flow

- Signup captures role, email, password, and optional location fields.[cite:1]
- Backend creates a user with `isEmailVerified: false` and generates an OTP.[cite:1]
- OTP is validated using email match, expiry check, and single-use check.[cite:1]
- Login supports email/password verification using bcrypt hash comparison.[cite:1]
- Google OAuth validates the `idToken` against Google before allowing access.[cite:1]

## Key Modules

### 1. Authentication and User Management

The authentication module handles signup, OTP verification, login, Google OAuth, JWT session creation, and role-based redirection.[cite:1] It also supports optional geolocation capture during registration, which later powers distance-based product sorting for customers.[cite:1]

### 2. Wholesale Product Management

Wholesalers can add products with a name, description, category, image, wholesale price, and quantity.[cite:1] Quantities are constrained to specific options: 100, 300, 500, 1000, and 5000 units, reinforcing the wholesale character of the platform.[cite:1]

The wholesaler dashboard shows product cards with image, description, category, price, quantity, and item actions such as edit and delete.[cite:1] Search functionality filters these records in real time by product name, description, and category.[cite:1]

### 3. Retail Inventory Operations

The retailer dashboard has two modes: buying from wholesalers and managing retailer sell inventory.[cite:1] In the first mode, retailers browse all wholesale inventory, specify purchase quantity, set their own selling price, and confirm the procurement action.[cite:1]

If wallet balance is sufficient, the backend executes an atomic transaction that debits the retailer, credits the wholesaler, creates wallet logs, reduces wholesale stock, and creates a new `RProd` entry.[cite:1] In the second mode, the retailer monitors current sellable inventory, retail price, stock quantity, and profit potential based on margin over wholesale cost.[cite:1]

### 4. Customer Shopping and Sorting

Customers browse all `RProd` entries across retailers from the customer dashboard.[cite:1] The platform supports sorting by rating, price, stock, and distance, which gives customers multiple ways to prioritize products depending on trust, affordability, availability, or proximity.[cite:1]

Search and category filtering are also available. Product cards surface the details a customer needs for quick decision-making, including image, title, price, quantity, distance, and average rating.[cite:1]

### 5. Cart, Checkout, and Wallet

Customers can add retailer inventory to a cart, where each entry stores `customerId`, `rprodId`, quantity, and timestamp.[cite:1] If the same product is added more than once, the existing cart quantity is incremented instead of creating duplicate records.[cite:1]

At checkout, the backend validates requested quantity, available stock, and customer wallet balance before processing the purchase.[cite:1] On success, it debits the customer, credits the retailer, logs wallet transactions, creates a `CProd` order record, updates stock, and removes the cart item in a single atomic unit of work.[cite:1]

### 6. Orders and Tracking

Completed purchases appear in the customer’s orders page, where the system displays product snapshot data, quantity, total paid, review state, and actions such as “Buy Again” and “Leave Review.”[cite:1] The documentation also sketches a conceptual five-stage order lifecycle consisting of Order Received, Dispatched, Shipped, Out For Delivery, and Delivered, intended for future implementation.[cite:1]

### 7. Feedback and Quality Assurance

Customers can rate purchased products on a 1–5 scale after purchase.[cite:1] These ratings are stored in `CProd.review` and aggregated by a dedicated endpoint to compute `averageRating` and `reviewCount`, which are then displayed on product cards and reused in sorting logic.[cite:1]

## Database Design

OOPMart uses seven MongoDB collections, each mapped to a distinct responsibility in the business workflow.[cite:1]

| Collection | Purpose |
|-----------|---------|
| `User` | Stores identity, role, address/location, email verification status, and wallet balance.[cite:1] |
| `WProd` | Stores wholesaler-owned source inventory.[cite:1] |
| `RProd` | Stores retailer-owned sell inventory derived from wholesale purchases.[cite:1] |
| `CProd` | Stores customer purchases and associated review values.[cite:1] |
| `Cart` | Stores customer cart entries with uniqueness on customer-product pairs.[cite:1] |
| `WalletTransaction` | Stores credit/debit logs for all wallet activity.[cite:1] |
| `Otp` | Stores OTP codes with expiration and single-use state.[cite:1] |

### Important relationships

- A wholesaler owns many `WProd` items.[cite:1]
- A retailer can transform a `WProd` item into one or more `RProd` records through procurement.[cite:1]
- A customer buys `RProd` items, creating `CProd` records.[cite:1]
- Reviews are attached to completed customer purchases rather than to a separate review-only collection.[cite:1]

### Indexing

The documentation highlights index usage on frequently queried fields to improve performance.[cite:1]

- `User.email` for login.[cite:1]
- `User.location` as a geospatial index for location-aware operations.[cite:1]
- `WProd.wholesalerId`, `WProd.productName`, and `WProd.category` for dashboard and search retrieval.[cite:1]
- `RProd.retailerId`, `RProd.productName`, and `RProd.category` for retail inventory and shopping queries.[cite:1]
- `CProd.customerId` and `CProd.productId` for order history and ratings aggregation.[cite:1]
- `Cart.customerId` plus a unique compound index on customer-product pairs.[cite:1]
- `WalletTransaction.userId` and timestamp-based lookup indexes for transaction history.[cite:1]
- `Otp.expiresAt` using TTL behavior for automatic expiry cleanup.[cite:1]

## API Overview

The technical report documents a RESTful backend with more than 25 endpoints overall and shows representative handlers for authentication, product creation, cart operations, and purchase execution.[cite:1]

### Representative endpoints

| Endpoint | Method | Purpose |
|---------|--------|---------|
| `/auth/signup` | POST | Create a new user account and trigger OTP flow.[cite:1] |
| `/auth/verify_otp` | POST | Verify email ownership using the issued OTP.[cite:1] |
| `/auth/login` | POST | Log in with email and password.[cite:1] |
| `/auth/google` | POST | Authenticate with Google OAuth.[cite:1] |
| `/wprods/create` | POST | Create a new wholesale product entry.[cite:1] |
| `/rprods` | GET / POST | Fetch retailer inventory for customers or create retailer inventory from wholesale procurement, depending on route usage shown in the report.[cite:1] |
| `/cart` | POST | Add or update an item in the shopping cart.[cite:1] |
| `/cprods` | POST | Complete a customer purchase atomically.[cite:1] |
| `/api/wallet-add` | POST | Add funds to a user wallet in demo mode.[cite:1] |
| `/api/product-rating/:productId` | GET | Compute aggregate rating data for a product.[cite:1] |
| `/cprods/user/:customerId` | GET | Fetch a customer’s order history.[cite:1] |
| `/cprods/:id/rate` | PUT | Submit a rating for a completed purchase.[cite:1] |

## Transactions and Wallet Logic

One of the strongest architectural aspects of OOPMart is the treatment of financial operations as atomic transaction groups.[cite:1] The report repeatedly emphasizes that no transaction should leave the system in a partial state such as debited money without corresponding stock updates, or stock updates without corresponding ledger records.[cite:1]

### Retailer buys from wholesaler

When a retailer sources stock from a wholesaler, the system:

1. Validates retailer wallet balance against procurement cost.[cite:1]
2. Debits the retailer account.[cite:1]
3. Credits the wholesaler account.[cite:1]
4. Creates wallet transaction records for both users.[cite:1]
5. Reduces `WProd.numberOfItems`.[cite:1]
6. Creates an `RProd` record for the retailer.[cite:1]

### Customer buys from retailer

When a customer checks out, the system:

1. Validates requested quantity.[cite:1]
2. Validates stock availability in `RProd`.[cite:1]
3. Validates customer wallet balance.[cite:1]
4. Debits the customer.[cite:1]
5. Credits the retailer.[cite:1]
6. Creates wallet transactions.[cite:1]
7. Creates a `CProd` purchase record.[cite:1]
8. Reduces retailer stock.[cite:1]
9. Removes the item from the cart.[cite:1]

The implementation uses MongoDB sessions so either every step succeeds or every step is rolled back.[cite:1] This ACID-style protection is essential for a system handling inventory and money together.[cite:1]

## Location-Based Commerce

A distinguishing feature of OOPMart is distance-based product discovery. During signup, users can optionally provide location information or use browser geolocation to store coordinates in their profile.[cite:1]

When customers sort products by distance, the frontend computes the distance between customer coordinates and retailer coordinates using the haversine formula.[cite:1] This allows the system to rank inventory by proximity and surface products that may offer lower delivery time and shipping cost.[cite:1]

Practical benefits described in the report include:

- Better local business discovery.[cite:1]
- Faster delivery expectations, including same-day or next-day scenarios for nearby sellers.[cite:1]
- Reduced shipping cost.[cite:1]
- A meaningful differentiator compared with a standard nationwide product list.[cite:1]

## State Management

OOPMart deliberately uses a lightweight state-management model. Instead of Redux or Zustand, it relies on React hooks, `localStorage`, and custom browser events to synchronize components.[cite:1]

This event-driven pattern is used for cart count updates, inventory refreshes, wallet balance updates, and shared search queries.[cite:1] According to the documentation, this approach reduces prop drilling and keeps components loosely coupled while remaining sufficient for the platform’s current scale.[cite:1]

Examples of events mentioned in the report include:

- `cartUpdated`.[cite:1]
- `inventoryUpdated`.[cite:1]
- `walletUpdated`.[cite:1]
- `searchQueryChanged`.[cite:1]

## Security Practices

The report documents several defensive measures built into the platform.[cite:1]

- Passwords are hashed using bcrypt with salt rounds set to 10.[cite:1]
- OTP verification reduces fake account creation and replay risk through expiry and single-use checks.[cite:1]
- Google OAuth tokens are validated server-side with Google, rather than trusting the frontend.[cite:1]
- JWTs contain no sensitive data and expire after 7 days.[cite:1]
- Protected routes validate authentication and role before performing privileged actions.[cite:1]
- Server-side validation checks quantities, prices, categories, and financial constraints before committing changes.[cite:1]
- CORS is restricted to the frontend origin shown in the report.[cite:1]

### Production note

The documentation explicitly notes that storing JWTs in `localStorage` exposes the application to XSS-related risk and recommends secure HTTP-only cookies as a production-hardening improvement.[cite:1]

## Performance and Scalability

The current implementation is designed for correctness and moderate scale, but the report also outlines a practical path to higher throughput and larger datasets.[cite:1]

### Current optimization choices

- Indexed query paths for login, dashboards, search, cart retrieval, order history, and rating lookups.[cite:1]
- Image hosting through ImageKit CDN.[cite:1]
- Event-driven UI updates instead of expensive full reloads.[cite:1]

### Suggested improvements from the report

- Cursor-based pagination for large product lists.[cite:1]
- Redis caching for product and rating data.[cite:1]
- WebSockets for true real-time stock sync.[cite:1]
- Image compression and direct file handling instead of large base64 payloads.[cite:1]
- MongoDB sharding for horizontal scale.[cite:1]
- Load balancing across multiple Node.js instances.[cite:1]
- S3 and CloudFront-style backup/CDN strategies, plus monitoring with Prometheus, Grafana, and ELK.[cite:1]

## Error Handling and Testing

The report describes consistent frontend and backend error-handling patterns using `try/catch`, structured JSON responses, and user-friendly messages.[cite:1] Examples include clear insufficient-balance messages, duplicate-email warnings, and invalid-quantity errors that tell the user what went wrong instead of failing silently.[cite:1]

Manual testing scenarios documented in the report include:

- Successful and failed signup attempts.[cite:1]
- Successful and failed login attempts.[cite:1]
- Valid and invalid wholesaler product creation.[cite:1]
- Retailer purchase success and insufficient-balance failure.[cite:1]
- Customer cart and checkout flow, including insufficient funds.[cite:1]
- Review submission after purchase.[cite:1]
- Correct sorting by rating, price, stock, and distance.[cite:1]

## Getting Started

The technical documentation does not provide a complete public setup guide with exact repository commands, but it does provide enough architectural detail to reconstruct a standard local development workflow around a Next.js frontend and an Express/MongoDB backend.[cite:1]

### Expected local setup

1. Install dependencies for both frontend and backend projects.[cite:1]
2. Configure environment variables for MongoDB, JWT, Google OAuth, email/OTP sending, and ImageKit.[cite:1]
3. Start the backend server on port `5000` as shown in the report.[cite:1]
4. Start the frontend application on port `3000` as implied by the CORS configuration.[cite:1]
5. Open the frontend in the browser and create accounts for each role to test the full supply-chain workflow.[cite:1]

### Example development flow

```bash
# frontend
npm install
npm run dev

# backend
npm install
npm run dev
```

Because the original report is documentation rather than the actual source tree, command names may differ slightly in the repository implementation.[cite:1]

## Environment Variables

The report mentions `dotenv`-based configuration and references multiple secrets and service keys used by the application.[cite:1] A practical `.env` file for a project matching the documented architecture would likely include entries such as the following.[cite:1]

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password_or_app_password
PORT=5000
FRONTEND_URL=http://localhost:3000
```

These names are consistent with the services explicitly described in the technical report, though the exact variable names in the codebase may differ.[cite:1]

## Future Roadmap

The documentation outlines a substantial roadmap beyond the current implementation.[cite:1]

- React Native apps for iOS and Android.[cite:1]
- Push notifications and offline cart sync.[cite:1]
- Recommendation engine for related-product suggestions.[cite:1]
- Seller ratings in addition to product ratings.[cite:1]
- Subscription and recurring wholesale orders.[cite:1]
- Analytics dashboards and vendor KPIs.[cite:1]
- Returns and refunds workflows.[cite:1]
- Multi-currency and international shipping support.[cite:1]
- Real payment gateway integrations such as Stripe or Razorpay.[cite:1]
- SMS, email automation, Shopify sync, and BI integrations.[cite:1]

## Learning Outcomes

OOPMart demonstrates practical understanding of object-oriented design, multi-tenant role modeling, RESTful API design, event-driven UI patterns, MongoDB schema design, indexing strategy, transaction safety, security practices, and scalable full-stack architecture.[cite:1]

It is also a strong example of how to turn a business workflow into a software system with explicit domain models and data transitions.[cite:1] The project’s value lies not only in the feature list but in the fact that product state, money state, and user permissions are all modeled deliberately rather than handled ad hoc.[cite:1]

## Status

OOPMart is a feature-complete full-stack marketplace prototype with core workflows for wholesalers, retailers, and customers fully implemented, including authentication, inventory management, wallet-based transactions, cart and checkout, order history, reviews, and location-aware product discovery.[cite:1]

The next phase of development focuses on production-grade integrations such as live payment gateway support, official maps services, and additional scalability enhancements.[cite:1]

