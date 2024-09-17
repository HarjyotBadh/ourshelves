@echo off
setlocal enabledelayedexpansion

REM Get the IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    goto :found
)

:found
REM Set the environment variable
setx REACT_NATIVE_PACKAGER_HOSTNAME %IP%
if %errorlevel% neq 0 (
    echo Failed to set REACT_NATIVE_PACKAGER_HOSTNAME. Please run this script as administrator.
    pause
    exit /b 1
)

REM Display success message and instructions
echo.
echo Successfully set REACT_NATIVE_PACKAGER_HOSTNAME to %IP%
echo.
echo Please follow these steps:
echo 1. Close all instances of VS Code
echo 2. Open Task Manager and end any remaining VS Code processes
echo 3. Reopen VS Code
echo 4. Open a new terminal in VS Code
echo 5. Run 'npm start' in the terminal
echo.
echo Press any key to exit...
pause >nul

endlocal