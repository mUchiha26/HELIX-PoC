package fim;

public class ScanResult {
    private String path;
    private String sha256;
    private long size;
    private String status;

    public ScanResult(String path, String sha256, long size, String status) {
        this.path = path;
        this.sha256 = sha256;
        this.size = size;
        this.status = status;
    }

    public String getPath() {
        return path;
    }

    public String getSha256() {
        return sha256;
    }

    public long getSize() {
        return size;
    }

    public String getStatus() {
        return status;
    }
}
