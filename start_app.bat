@echo off
echo Starting Health Wallet Application...

cd Backend
start "HealthWallet Backend" cmd /k "node server.js"
cd ..

cd Frontend
start "HealthWallet Frontend" cmd /k "npm run dev -- -p 3001"
cd ..

echo Application starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
pause
