package fim;

import java.util.Map;

public class BaselineOperation extends AbstractScanOperation {

    public BaselineOperation(FileHasher hasher, BaselineStorage storage) {
        super(hasher, storage);
    }

    @Override
    public String execute(String targetDir, String baselineFile) throws Exception {
        Map<String, String> baseline = scanDirectory(targetDir);
        storage.save(baselineFile, baseline);

        return "{\"mode\": \"baseline\", \"path\": \"" + escapeJson(targetDir) +
               "\", \"file_count\": " + baseline.size() +
               ", \"baseline_file\": \"" + escapeJson(baselineFile) + "\"}";
    }
}
