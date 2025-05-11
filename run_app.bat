@echo off
echo Starting IP NFT DApp...
echo.
echo This will start the backend server which also serves the frontend files.
echo.
echo Access the application at: http://127.0.0.1:5000
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.
cd /d %~dp0

REM Create data directory if it doesn't exist
if not exist "backend\data" mkdir backend\data

REM Open the browser automatically after a short delay
start "" cmd /c "timeout /t 2 /nobreak && start http://127.0.0.1:5000"

REM Start the Flask server
cd backend
python app.py