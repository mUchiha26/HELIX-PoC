package fim;

public class ScanResult {
    public String path;
    public String sha256;
    public long size;
    public String status;

    public ScanResult(String path, String sha256, long size, String status) {
        this.path = path;
        this.sha256 = sha256;
        this.size = size;
        this.status = status;
    }
}
