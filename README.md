# Multi-Store Management System

A scalable, multi-tenant Store Management System built with a modern React frontend and a robust Spring Boot backend. 

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## Features

- **Omnichannel Retail:** Unified order pipeline across the customer-facing e-commerce storefront and the staff-facing Point of Sale (POS) system.
- **Real-Time Inventory Tracking:** Automated stock deductions instantly reflect across all channels.
- **Glassmorphism UI:** A sleek, modern, and highly interactive user interface built with CSS Custom Properties and Lucide React icons.
- **Secure Authentication:** Stateless JWT (JSON Web Token) authentication secured with Spring Security and BCrypt password hashing.
- **Multi-Tenant Architecture Ready:** Built to support multiple businesses and storefronts from a single deployment.

## Technology Stack

**Frontend:**
- React 18 + Vite
- React Router DOM
- CSS3 (Vanilla CSS + Glassmorphism Design System)
- Lucide React (Iconography)

**Backend:**
- Java 17 + Spring Boot 3.2.4
- Spring Data JPA (Hibernate)
- Spring Security + io.jsonwebtoken
- PostgreSQL (Database)
- Maven

## Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17 JDK
- PostgreSQL installed and running on port `5432`

### 1. Database Setup
Create a PostgreSQL database named `store_management`:
```sql
CREATE DATABASE store_management;
```
Ensure your `backend/src/main/resources/application.yml` matches your local Postgres credentials (default `postgres`/`postgres`).

### 2. Run the Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*The backend will run on `http://localhost:8080`.*

### 3. Run the Frontend
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000` (or `http://localhost:5173`).*

## Navigation
- **Dashboard / Admin Panel:** `http://localhost:3000/login`
- **Customer Storefront:** `http://localhost:3000/store`

## Security
This system implements Role-Based Access Control (RBAC) with three primary roles: `ADMIN`, `MANAGER`, and `CASHIER`. Endpoints are protected by a stateless `OncePerRequestFilter` that intercepts and validates the `Authorization: Bearer <token>` header.

## License
This project is licensed under the MIT License.
