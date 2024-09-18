@echo off
setlocal enabledelayedexpansion

REM Find the Wireless LAN adapter Wi-Fi section and get its IPv4 address
set "found_wifi=0"
for /f "tokens=*" %%a in ('ipconfig') do (
    echo %%a | findstr /C:"Wireless LAN adapter Wi-Fi" >nul
    if !errorlevel! equ 0 (
        set "found_wifi=1"
    )
    if !found_wifi! equ 1 (
        echo %%a | findstr /C:"IPv4 Address" >nul
        if !errorlevel! equ 0 (
            for /f "tokens=2 delims=:" %%b in ("%%a") do (
                set "IP=%%b"
                set "IP=!IP:~1!"
                goto :found
            )
        )
    )
)

:notfound
echo Wireless LAN adapter Wi-Fi IPv4 address not found.
pause
exit /b 1

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