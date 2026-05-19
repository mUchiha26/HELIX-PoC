package fim;

import java.io.FileInputStream;
import java.io.InputStream;
import java.security.MessageDigest;

public class Sha256Hasher implements FileHasher {
    @Override
    public String hash(String filePath) throws HashingException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream fis = new FileInputStream(filePath)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = fis.read(buffer)) != -1) {
                    digest.update(buffer, 0, read);
                }
            }
            byte[] hashBytes = digest.digest();
            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new HashingException("Failed to hash file: " + filePath, e);
        }
    }
}
