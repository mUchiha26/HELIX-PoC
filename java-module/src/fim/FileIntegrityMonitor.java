package fim;

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

            FileHasher hasher = new Sha256Hasher();
            BaselineStorage storage = new FileBaselineStorage();

            AbstractScanOperation operation;

            if (mode.equals("baseline")) {
                operation = new BaselineOperation(hasher, storage);
            } else if (mode.equals("verify")) {
                operation = new VerifyOperation(hasher, storage);
            } else {
                System.err.println("{\"error\": \"Unknown mode: " + escapeJson(mode) + "\"}");
                System.exit(1);
                return;
            }

            String output = operation.execute(targetDir, baselineFile);
            System.out.println(output);

        } catch (BaselineNotFoundException e) {
            System.err.println("{\"error\": \"" + escapeJson(e.getMessage()) + "\"}");
            System.exit(1);
        } catch (HashingException e) {
            System.err.println("{\"error\": \"" + escapeJson(e.getMessage()) + "\"}");
            System.exit(1);
        } catch (Exception e) {
            System.err.println("{\"error\": \"" + escapeJson(e.getMessage()) + "\"}");
            System.exit(1);
        }
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
