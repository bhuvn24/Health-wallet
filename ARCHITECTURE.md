# System Architecture

## Overview
The Digital Health Wallet is a web application designed to allow users to manage their health data, including vitals and medical reports, and share them securely.

## Architecture

The system follows a standard Client-Server architecture.

### 1. Frontend (ReactJS/Next.js)
- **Framework**: Next.js (React)
- **Responsibility**: UI rendering, user interaction, state management.
- **Integration**: Communicates with the backend via REST APIs (currently mocked, future integration via HTTP).

### 2. Backend (Node.js/Express)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Responsibility**: API handling, authentication, business logic, data persistence.
- **Port**: 5000 (default)

### 3. Database (SQLite)
- **Type**: Relational Database (Embedded)
- **File**: `health_wallet.sqlite`
- **Responsibility**: Storing user data, vitals logs, report metadata, and sharing permissions.

### 4. File Storage
- **Strategy**: Local File System (for simplicity and privacy)
- **Location**: `Backend/uploads/`
- **Responsibility**: Storing the actual PDF/Image files for medical reports.

## Architecture Diagram

```mermaid
graph TD
    Client[Frontend (React/Next.js)] <-->|REST API| Server[Backend API (Node.js/Express)]
    Server <-->|SQL Queries| DB[(SQLite Database)]
    Server <-->|File I/O| FS[File Storage (Local Disk)]
```

## Security Considerations

### 1. Data Protection
- **Passwords**: Hashed using `bcryptjs` before storage.
- **JWT**: Stateless authentication using JSON Web Tokens. Access tokens are required for all protected routes.

### 2. Access Control
- **Role-Based**: Basic role separation (e.g., Owner vs Viewer) can be enforced at the API level.
- **Resource Ownership**: Middleware ensures users can only access their own data or data explicitly shared with them.

### 3. Secure File Uploads
- **Validation**: File types restricted to PDF and Images (JPG/PNG).
- **Sanitization**: Filenames sanitized to prevent path traversal attacks.
- **Storage**: Files stored outside the public web root where possible, served via controlled API endpoints.
