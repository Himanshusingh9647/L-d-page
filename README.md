# L&D Training Portal - Production Deployment Guide

This is a production-grade Learning and Development Portal built with ASP.NET Core API (Backend), React + Tailwind (Frontend), and SQL Server 2014+ (Database).

## Features
- **SQL 2014 Compatible**: All data operations use highly optimized, native T-SQL stored procedures compatible with SQL Server 2014+.
- **Video & PDF Uploads**: Admins can easily drag-and-drop or select video/PDF files directly via the UI.
- **Precision Tracking**: Anti-skip video mechanics (HTML5 `timeupdate` + `seeked` validation) and mandatory PDF scroll-to-bottom consent.
- **Premium UI**: Sleek, minimal dark-mode Sidebar and glassmorphic Admin dashboards designed for a high-end corporate feel.

---

## 1. Office Deployment Instructions

### Prerequisites
1. **SQL Server 2014 (or higher)** installed and running.
2. **Node.js (v18+)** installed.
3. **.NET 8 SDK** installed.

### Step 1: Database Setup
The entire application logic is encapsulated in a single deployment script.
1. Open SQL Server Management Studio (SSMS).
2. Connect to your office SQL Server instance.
3. Open the file `database/deploy_database.sql`.
4. Execute the script.
   * This will automatically create the `LDTrainingPortal` database, all necessary tables, constraints, and the 2014-compatible stored procedures.
   * *Note: The script is idempotent. It will safely skip table creation if they exist but will accurately refresh all stored procedures.*

### Step 2: Backend API Setup
1. Navigate to the backend directory:
   ```cmd
   cd backend\LDPortal.API
   ```
2. Open `appsettings.json` and update the `DefaultConnection` string to point to your office SQL Server instance.
   * Example: `"Server=YOUR_SERVER_NAME;Database=LDTrainingPortal;Trusted_Connection=True;TrustServerCertificate=True"`
3. Run the backend server:
   ```cmd
   dotnet run
   ```
   * The API will run on `http://localhost:5155`.

### Step 3: Frontend Web App Setup
1. Open a new terminal and navigate to a safe path for the frontend (to avoid Windows path issues with the `&` symbol, ensure your path doesn't contain `&` or simply use the existing setup).
2. Navigate to the frontend directory:
   ```cmd
   cd frontend
   ```
3. Install dependencies and start the app:
   ```cmd
   npm install
   npm run dev
   ```
   * The Web App will run on `http://localhost:5173`.

---

## 2. Managing Video and PDF Uploads

### Where do uploaded videos go?
When an admin creates a new Training Module and uploads a `.mp4` or `.pdf` file via the web interface:
- The files are securely physically saved into the backend's designated media folder:
  `backend/LDPortal.API/wwwroot/media/`
- The system automatically serves them over HTTP so employees can stream them without any extra configuration.

### Can I manually place my own videos?
**Yes.** If you have massive video files (e.g., several GBs) that you prefer to copy via a USB drive in the office rather than uploading through the browser:
1. Copy your `.mp4` or `.pdf` files directly into the `backend\LDPortal.API\wwwroot\media\` folder.
2. In the Admin Dashboard, click **New Module**.
3. Under "Playlist Items", click the "Refresh list" link.
4. Your manually placed video will instantly appear in the dropdown menu for selection!

---

## 3. Initial Login Credentials
After deploying the database, the following accounts are automatically created:

**Admin Account:**
- **Email:** `arjun.kapoor@company.com`
- **Password:** `Training@123`

**Employee Account (for testing):**
- **Email:** `priya.sharma@company.com`
- **Password:** `Training@123`

*(Note: The system requires all passwords to be at least 6 characters. Be sure to change these in a real production environment!)*
