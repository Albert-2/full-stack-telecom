#!/bin/bash
echo "============================================"
echo "  TELECOM MONITORING SYSTEM"
echo "============================================"
echo ""
echo "[1/2] Compiling..."
javac -cp lib/derby-10.14.2.0.jar -d out src/com/telecom/*.java
if [ $? -ne 0 ]; then
    echo "Compilation FAILED!"
    exit 1
fi
echo "[2/2] Running..."
echo ""
java -cp out:lib/derby-10.14.2.0.jar com.telecom.TelecomApp
