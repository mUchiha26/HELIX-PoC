package fim;

import java.util.Map;

public interface BaselineStorage {
    void save(String baselineFile, Map<String, String> baseline) throws Exception;
    Map<String, String> load(String baselineFile) throws Exception;
}
