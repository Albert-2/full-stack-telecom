@echo off
echo ============================================
echo   TELECOM MONITORING SYSTEM
echo ============================================
echo.
echo [1/2] Compiling...
javac -cp lib\derby-10.14.2.0.jar -d out src\com\telecom\*.java
if %errorlevel% neq 0 (
    echo Compilation FAILED!
    pause
    exit /b 1
)
echo [2/2] Running...
echo.
java -cp out;lib\derby-10.14.2.0.jar com.telecom.TelecomApp
pause
