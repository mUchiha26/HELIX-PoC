package fim;

import java.io.*;
import java.nio.file.*;
import java.util.*;

public class FileIntegrityMonitor {
    public static void main(String[] args) {
        try {
            if (args.length < 2) {
                System.err.println("{\"error\": \"Usage: <baseline|verify> <target_dir> [baseline_file]\"}");
                System.exit(1);
            }

            String mode = args[0];
            String targetDir = args[1];
            String baselineFile = args.length > 2 ? args[2] : "baseline.dat";

            if (mode.equals("baseline")) {
                runBaseline(targetDir, baselineFile);
            } else if (mode.equals("verify")) {
                runVerify(targetDir, baselineFile);
            } else {
                System.err.println("{\"error\": \"Unknown mode: " + escapeJson(mode) + "\"}");
                System.exit(1);
            }
        } catch (Exception e) {
            System.err.println("{\"error\": \"" + escapeJson(e.getMessage()) + "\"}");
            System.exit(1);
        }
    }

    private static void runBaseline(String dir, String baselineFile) throws Exception {
        Map<String, String> baseline = new LinkedHashMap<>();

        Files.walk(Paths.get(dir))
             .filter(Files::isRegularFile)
             .forEach(path -> {
                 try {
                     String hash = HashCalculator.sha256(path.toString());
                     baseline.put(path.toString(), hash);
                 } catch (Exception e) {
                     // Skip unreadable files
                 }
             });

        BaselineStore.save(baselineFile, baseline);

        System.out.println("{\"mode\": \"baseline\", \"path\": \"" + escapeJson(dir) +
                           "\", \"file_count\": " + baseline.size() +
                           ", \"baseline_file\": \"" + escapeJson(baselineFile) + "\"}");
    }

    private static void runVerify(String dir, String baselineFile) throws Exception {
        Map<String, String> oldBaseline = BaselineStore.load(baselineFile);
        Map<String, String> currentScan = new LinkedHashMap<>();

        Files.walk(Paths.get(dir))
             .filter(Files::isRegularFile)
             .forEach(path -> {
                 try {
                     String hash = HashCalculator.sha256(path.toString());
                     currentScan.put(path.toString(), hash);
                 } catch (Exception e) {
                     // Skip unreadable files
                 }
             });

        List<ScanResult> results = new ArrayList<>();

        for (Map.Entry<String, String> entry : oldBaseline.entrySet()) {
            String path = entry.getKey();
            String oldHash = entry.getValue();
            if (currentScan.containsKey(path)) {
                String newHash = currentScan.get(path);
                String status = oldHash.equals(newHash) ? "unchanged" : "modified";
                long size = Files.size(Paths.get(path));
                results.add(new ScanResult(path, newHash, size, status));
            } else {
                results.add(new ScanResult(path, "", 0, "deleted"));
            }
        }

        for (Map.Entry<String, String> entry : currentScan.entrySet()) {
            if (!oldBaseline.containsKey(entry.getKey())) {
                String path = entry.getKey();
                long size = Files.size(Paths.get(path));
                results.add(new ScanResult(path, entry.getValue(), size, "added"));
            }
        }

        System.out.println(resultsToJson(results));
    }

    private static String resultsToJson(List<ScanResult> results) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"results\": [");
        for (int i = 0; i < results.size(); i++) {
            ScanResult r = results.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"path\": \"").append(escapeJson(r.path)).append("\",");
            sb.append("\"sha256\": \"").append(r.sha256).append("\",");
            sb.append("\"size\": ").append(r.size).append(",");
            sb.append("\"status\": \"").append(r.status).append("\"}");
        }
        sb.append("]}");
        return sb.toString();
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
