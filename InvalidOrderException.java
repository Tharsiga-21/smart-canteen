// InvalidOrderException.java
// UNIT III: User-defined custom Exception extending the checked Exception class
public class InvalidOrderException extends Exception {
    
    // UNIT II: Constructor calling super(message) to pass error details to Exception
    public InvalidOrderException(String message) {
        super(message);
    }
}
