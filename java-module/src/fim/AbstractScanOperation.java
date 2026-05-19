package fim;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

public abstract class AbstractScanOperation {
    protected final FileHasher hasher;
    protected final BaselineStorage storage;

    protected AbstractScanOperation(FileHasher hasher, BaselineStorage storage) {
        this.hasher = hasher;
        this.storage = storage;
    }

    protected Map<String, String> scanDirectory(String dir) {
        Map<String, String> hashes = new LinkedHashMap<>();

        try {
            Files.walk(Paths.get(dir))
                 .filter(Files::isRegularFile)
                 .forEach(path -> {
                     try {
                         String hash = hasher.hash(path.toString());
                         hashes.put(path.toString(), hash);
                     } catch (HashingException e) {
                         // Skip unreadable files
                     }
                 });
        } catch (IOException e) {
            // Directory walk failed — return partial results
        }

        return hashes;
    }

    protected String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    protected String resultsToJson(ResultCollector<ScanResult> collector) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"results\": [");
        List<ScanResult> results = collector.getAll();
        for (int i = 0; i < results.size(); i++) {
            ScanResult r = results.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"path\": \"").append(escapeJson(r.getPath())).append("\",");
            sb.append("\"sha256\": \"").append(r.getSha256()).append("\",");
            sb.append("\"size\": ").append(r.getSize()).append(",");
            sb.append("\"status\": \"").append(r.getStatus()).append("\"}");
        }
        sb.append("]}");
        return sb.toString();
    }

    public abstract String execute(String targetDir, String baselineFile) throws Exception;
}
