package fim;

public interface FileHasher {
    String hash(String filePath) throws HashingException;
}
