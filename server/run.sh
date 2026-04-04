#!/bin/bash
echo "============================================"
echo "  TELECOM ROAMING SIGNAL TRACKER"
echo "============================================"
echo ""
echo "[1/2] Compiling..."
javac -cp lib/derby.jar -d out src/com/telecom/*.java
if [ $? -ne 0 ]; then
    echo "Compilation FAILED!"
    exit 1
fi
echo "[2/2] Running..."
echo ""
java -cp out:lib/derby.jar com.telecom.Main
