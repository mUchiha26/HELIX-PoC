package fim;

import java.io.*;
import java.util.*;

public class FileBaselineStorage implements BaselineStorage {
    @Override
    public void save(String baselineFile, Map<String, String> baseline) throws Exception {
        try (PrintWriter out = new PrintWriter(new FileWriter(baselineFile))) {
            for (Map.Entry<String, String> entry : baseline.entrySet()) {
                out.println(entry.getKey() + "|" + entry.getValue());
            }
        }
    }

    @Override
    public Map<String, String> load(String baselineFile) throws Exception {
        File file = new File(baselineFile);
        if (!file.exists()) {
            throw new BaselineNotFoundException("Baseline file not found: " + baselineFile);
        }

        Map<String, String> baseline = new LinkedHashMap<>();
        try (BufferedReader br = new BufferedReader(new FileReader(baselineFile))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split("\\|", 2);
                if (parts.length == 2) {
                    baseline.put(parts[0], parts[1]);
                }
            }
        }
        return baseline;
    }
}
