#!/bin/bash
mkdir -p build
javac -d build src/fim/ScanResult.java src/fim/HashCalculator.java src/fim/BaselineStore.java src/fim/FileIntegrityMonitor.java
echo "Compilation complete"
