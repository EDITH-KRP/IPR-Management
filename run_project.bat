@echo off
color 0B
cls
echo.
echo  ======================================================================
echo  ^|                                                                    ^|
echo  ^|                PATENT REGISTRY BLOCKCHAIN PLATFORM                 ^|
echo  ^|                                                                    ^|
echo  ======================================================================
echo.
echo  Starting Patent Registry DApp...
echo.

:: Check if Python is installed
python --version > nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Python is not installed or not in the PATH.
    echo Please install Python and try again.
    echo.
    pause
    exit /b 1
)

:: Navigate to the project directory
cd /d "p:\IPR-Manager\backend"
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Could not navigate to the project directory.
    echo Please make sure the path "p:\IPR-Manager\backend" exists.
    echo.
    pause
    exit /b 1
)

echo  Checking for required files...
if not exist "app.py" (
    color 0C
    echo ERROR: app.py not found in the backend directory.
    echo Please make sure all project files are in place.
    echo.
    pause
    exit /b 1
)

echo  All checks passed!
echo.
echo  ======================================================================
echo  ^|                                                                    ^|
echo  ^|                     STARTING APPLICATION...                        ^|
echo  ^|                                                                    ^|
echo  ======================================================================
echo.
echo  The application will be available at: http://localhost:5000
echo.
echo  * Open your web browser and navigate to: http://localhost:5000
echo  * Connect your wallet to access all features
echo  * Press Ctrl+C to stop the server when you're done
echo.
echo  Starting Flask application...
echo.

:: Start the Flask application
python app.py

:: This will only execute if the Python application exits
color 0C
echo.
echo  ======================================================================
echo  ^|                                                                    ^|
echo  ^|                     APPLICATION STOPPED                            ^|
echo  ^|                                                                    ^|
echo  ======================================================================
echo.
pause