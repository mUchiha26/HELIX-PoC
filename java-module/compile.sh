#!/bin/bash
mkdir -p build
javac -d build \
  src/fim/FileHasher.java \
  src/fim/BaselineStorage.java \
  src/fim/HashingException.java \
  src/fim/BaselineNotFoundException.java \
  src/fim/ScanResult.java \
  src/fim/ResultCollector.java \
  src/fim/Sha256Hasher.java \
  src/fim/FileBaselineStorage.java \
  src/fim/AbstractScanOperation.java \
  src/fim/BaselineOperation.java \
  src/fim/VerifyOperation.java \
  src/fim/FileIntegrityMonitor.java
echo "Compilation complete"
