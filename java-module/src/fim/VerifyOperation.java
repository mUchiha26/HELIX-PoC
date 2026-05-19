package fim;

import java.nio.file.*;
import java.util.*;

public class VerifyOperation extends AbstractScanOperation {

    public VerifyOperation(FileHasher hasher, BaselineStorage storage) {
        super(hasher, storage);
    }

    @Override
    public String execute(String targetDir, String baselineFile) throws Exception {
        Map<String, String> oldBaseline = storage.load(baselineFile);
        Map<String, String> currentScan = scanDirectory(targetDir);

        ResultCollector<ScanResult> results = new ResultCollector<>();

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

        return resultsToJson(results);
    }
}
