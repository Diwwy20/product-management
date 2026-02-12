# Product Management System 🚀

A robust Full-Stack Web Application for managing products and categories, featuring secure authentication and real-time multilingual support. This project is developed as part of the **Full-Stack Developer Challenge**.

## 🚀 Features

- **Secure Authentication:** - **JWT Strategy:** Implemented using Access and Refresh tokens for enhanced security.
    - **Email Verification:** Account activation via 6-digit OTP sent to the user's email.
    - **Password Recovery:** Secure forgot password flow with email-based reset links.
- **Product Management:**
    - **Advanced CRUD:** Create, read, update, and delete products with multi-image upload support.
    - **Data Grid:** Display products in a paginated table with server-side RegEx search.
    - **Category Association:** Assign products to specific categories with an easy-to-use interface.
- **Category Management:**
    - Dedicated dashboard to manage product categories and their active/inactive status.
- **Flexible Deletion:** - Support for both **Soft Delete** (moving to trash) and **Hard Delete** (permanent removal) to ensure data safety.
- **Multilingual Support:** Fully integrated **Thai & English** localization using Vue-i18n for a seamless global experience.
- **Layered Architecture:** Built with a clean separation of concerns for scalability and maintainability.

## 🛠 Tech Stack

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Language:** TypeScript
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **Localization:** Vue-i18n
- **HTTP Client:** Axios (with Interceptors for automatic token refreshing)

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Security:** Argon2 (Password Hashing) & JWT
- **File Handling:** Multer (Dynamic category-based folder structuring)
- **Architecture:** Layered Architecture (Controller, Service, Repository)

---

## ⚙️ Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js**: Version 22.19.0 or higher (LTS recommended).
   - **Tip**: This project includes an `.nvmrc` file. You can run `nvm use` to switch to the required version automatically.
2. **MongoDB**: Local instance or MongoDB Atlas connection string.

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Diwwy20/product-management
cd product-management
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Configuration (.env):** Create a .env file in the backend directory.

> **Note for Evaluators:** For security reasons, sensitive keys (Secrets and API Keys) are not included in this repository. Please refer to the **Google Drive link** provided in the assessment submission email to retrieve the full configuration values for testing.
```language
PORT=5000
NODE_ENV="development"
MONGO_URI="mongodb://localhost:27017/product-management"
API_PREFIX="/api"

# JWT Secrets -> Gen key use command (node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Email Service (Brevo API)
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=

FRONTEND_URL="http://localhost:5173"
COOKIE_SECURE=false
COOKIE_SAME_SITE="lax" 
```

Start the Server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal via the root directory:
```bash
cd frontend
npm install
```


**Configuration (.env):** Create a .env file in the frontend directory.

> **Note for Evaluators:** For your convenience, the testing keys and secrets are pre-filled below so the application can be tested immediately without additional configuration. (In a production environment, these secrets should be kept private and never committed to version control).
```language
VITE_API_URL=http://localhost:5000/api/v1
VITE_UPLOAD_URL=http://localhost:5000
```
Start the Application:
```bash
npm run dev
# Application runs on http://localhost:3000
```

## Project Architecture & Design Decisions
#### Backend Structure
I implemented a **Layered Architecture** (Controller-Service-Repository) pattern to ensure separation of concerns and maintainability.
```
backend/src/
├── config/          # Database & Environment configs
├── constants/       # Global Enums (HttpCodes, Roles)
├── controllers/     # Handling incoming HTTP requests and responses
├── database/        # DB connection setup
├── interfaces/      # Service contracts & Payload types
├── middlewares/     # Auth, Upload (Multer), & Global Error Handling
├── models/          # Mongoose Schemas (Data Layer)
├── repositories/    # Database interactions (DAL) - abstracts DB logic
├── routes/          # API Route definitions
├── services/        # Business logic & Email integration
├── templates/       # Email HTML templates
├── utils/           # Utility classes (Tokens, Passwords, AppError)
└── index.ts         # Application entry point
```

#### Frontend Structure
Using Vue 3 with a feature-based organization and Pinia for global state management.
- **Token Management:** Implemented an Axios Interceptor to handle 401 Unauthorized errors by automatically attempting to refresh the session using the Refresh Token, ensuring a smooth user experience.
- **Reusability:** Developed shared components like ConfirmModal and MainLayout to maintain UI consistency across the app.

```
frontend/src/
├── api/             # Axios instance with Refresh Token Interceptors
├── components/      # Reusable UI components (Modals, Navigation)
├── constants/       # App paths & Constant definitions
├── interfaces/      # TypeScript interfaces for API responses
├── layouts/         # MainLayout with Sidebar & Header integration
├── locales/         # i18n localization files (TH/EN)
├── router/          # Vue Router with Navigation Guards (Auth/Role)
├── services/        # API communication logic
├── stores/          # Pinia stores (Authentication state)
├── utils/           # Image URL formatting & Helper functions
└── views/           # Page components (Auth, Products, Categories)
```

---

## 📝 API Endpoints
Base URL: `/api/v1`

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | **Register:** Create account and send verification OTP code. |
| `POST` | `/auth/login` | **Login:** Authenticate and receive Access/Refresh tokens. |
| `POST` | `/auth/verify-email` | **Verify Email:** Activate account using 6-digit OTP code. |
| `POST` | `/auth/resend-otp` | **Resend OTP:** Request a new verification code. |
| `POST` | `/auth/forgot-password` | **Forgot Password:** Send recovery link to user email. |
| `POST` | `/auth/reset-password` | **Reset Password:** Set new password using token from email. |
| `POST` | `/auth/refresh-token` | **Refresh Token:** Obtain a new Access Token. |
| `GET` | `/auth/me` | **Profile:** Retrieve currently authenticated user data. |
| `PUT` | `/auth/me` | **Update Profile:** Edit personal info and upload avatar image. |
| `PUT` | `/auth/me/change-password` | **Change Password:** Update password while logged in. |
| `POST` | `/auth/logout` | **Logout:** Revoke tokens and clear session. |

### Products
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | **List Products:** Get products with Pagination and RegEx search. |
| `GET` | `/products/:id` | **Product Detail:** Get full info of a single product. |
| `POST` | `/products` | **Create Product:** Add product with multi-image upload (Admin). |
| `PUT` | `/products/:id` | **Update Product:** Edit product details and images (Admin). |
| `DELETE` | `/products/:id` | **Delete Product:** Supports `?mode=soft` or `hard` (Admin). |

### Categories
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/categories` | **List Categories:** Get all categories with Pagination and Search. |
| `GET` | `/categories/:id` | **Category Detail:** Get specific category info. |
| `POST` | `/categories` | **Create Category:** Add a new product category (Admin). |
| `PUT` | `/categories/:id` | **Update Category:** Modify category name or details (Admin). |
| `DELETE` | `/categories/:id` | **Delete Category:** Supports `?mode=soft` or `hard` (Admin). |

---
