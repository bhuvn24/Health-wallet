

# Health Wallet (VitalVault) 🏥

A secure, intelligent digital health folder that allows users to track their vitals, manage medical reports, and obtain AI-powered health insights. Built with **Next.js** and **Express**.


*<img width="1631" height="801" alt="image" src="https://github.com/user-attachments/assets/4d8c1d44-cc46-409c-abed-aeb5a346bfdb" />
*

## ✨ Features

- **📊 Vitals Tracking**: Log and visualize Heart Rate, Blood Pressure, Blood Sugar, and Body Temp over time with interactive charts.
- **📄 Medical Report Storage**: Securely upload and store PDF or Image medical reports.
- **🔐 Secure Sharing**: Share specific reports with doctors or family members via email with read-only access.
- **🛡️ Privacy First**: Data is stored securely, and sharing can be revoked at any time.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend
- **Server**: Node.js & Express
- **Database**: SQLite (via Sequelize ORM)
- **AI Integration**: Groq SDK (Llama 3-70b)
- **File Handling**: Multer

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn


### 1. Clone the Repository
```bash
git clone https://github.com/bhuvn24/Health-wallet.git
cd Health-wallet
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder:
   ```env
   PORT=5000
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   *The server will run on `http://localhost:5000` and automatically create the SQLite database.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev -- -p 3001
   ```
4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📱 Usage Guide

1. **Sign Up/Login**: Create an account to start your secure session.
2. **Dashboard**: View your latest vital stats and health summary at a glance.
3. **Add Vitals**: Click "Add Vital" to log new readings.
4. **Upload Reports**:
   - Go to "Upload Report".
   - Select a file (Image/PDF) and type (e.g., Blood Test).
   - **Wait for AI**: The system will analyze the report and generate insights automatically..
5. **Share**: Use the share icon on any report to grant access to a doctor.

## 📂 Project Structure

```
Health-wallet/
├── Backend/
│   ├── config/         # Database configuration
│   ├── models/         # Sequelize models (User, Report, Vital, Share)
│   ├── routes/         # API routes
│   ├── services/       # AI Service logic
│   ├── uploads/        # Stored report files
│   └── server.js       # Entry point
│
├── Frontend/
│   ├── src/
│   │   ├── app/        # Next.js pages and server actions
│   │   └── components/ # React components (HealthWalletClient, etc.)
│   └── ...
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for better health management.*


