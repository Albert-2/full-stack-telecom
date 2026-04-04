@echo off
echo ============================================
echo   TELECOM ROAMING SIGNAL TRACKER
echo ============================================
echo.
echo [1/2] Compiling...
javac -cp lib\derby.jar -d out src\com\telecom\*.java
if %errorlevel% neq 0 (
    echo Compilation FAILED!
    pause
    exit /b 1
)
echo [2/2] Running...
echo.
java -cp out;lib\derby.jar com.telecom.Main
pause
