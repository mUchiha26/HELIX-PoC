package fim;

import java.util.ArrayList;
import java.util.List;

public class ResultCollector<T> {
    private final List<T> results;

    public ResultCollector() {
        this.results = new ArrayList<>();
    }

    public void add(T result) {
        results.add(result);
    }

    public List<T> getAll() {
        return results;
    }

    public int size() {
        return results.size();
    }

    public boolean isEmpty() {
        return results.isEmpty();
    }
}
