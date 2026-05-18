package fim;

import java.io.*;
import java.util.*;

public class BaselineStore {
    public static void save(String baselineFile, Map<String, String> baseline) throws Exception {
        try (PrintWriter out = new PrintWriter(new FileWriter(baselineFile))) {
            for (Map.Entry<String, String> entry : baseline.entrySet()) {
                out.println(entry.getKey() + "|" + entry.getValue());
            }
        }
    }

    public static Map<String, String> load(String baselineFile) throws Exception {
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
