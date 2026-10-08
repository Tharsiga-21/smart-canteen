import java.util.ArrayList;

// Order.java
// UNIT III: Class implementing the Trackable interface
public class Order implements Trackable {

    // UNIT II: Static variable for auto-incrementing order numbers
    // UNIT I: Primitive data type int
    private static int orderCounter;

    // UNIT II: Static initialization block
    static {
        orderCounter = 0;
    }

    // UNIT II: Private fields (Encapsulation)
    private int orderNumber;
    private String studentName;
    private ArrayList<FoodItem> items; // UNIT II & IV: Standard ArrayList collection
    private ArrayList<Integer> quantities;
    private String status; // "Placed", "Preparing", "Ready"
    private long timestamp; // UNIT I: Primitive data type long

    // UNIT II: Parameterized Constructor
    public Order(String studentName) throws InvalidOrderException {
        // UNIT III: String method trim() and length()
        // UNIT I: Logical operator (||), Comparison operator (==)
        if (studentName == null || studentName.trim().length() == 0) {
            // UNIT III: Throwing user-defined exception
            throw new InvalidOrderException("Student name cannot be empty.");
        }
        
        // UNIT IV: Multithreading / Thread-safety: synchronized static method
        this.orderNumber = generateNextOrderNumber();
        this.studentName = studentName.trim();
        this.items = new ArrayList<FoodItem>();
        this.quantities = new ArrayList<Integer>();
        this.status = "Placed"; // Initial state
        this.timestamp = System.currentTimeMillis();
    }

    // Constructor for loading from storage
    public Order(int orderNumber, String studentName, String status, long timestamp) {
        this.orderNumber = orderNumber;
        this.studentName = (studentName != null) ? studentName.trim() : "";
        this.items = new ArrayList<FoodItem>();
        this.quantities = new ArrayList<Integer>();
        this.status = (status != null && status.trim().length() > 0) ? status.trim() : "Placed";
        this.timestamp = timestamp;
    }

    // UNIT II: Static synchronized helper method to safely generate order numbers across threads
    // UNIT IV: Synchronization
    public static synchronized int generateNextOrderNumber() {
        // UNIT I: Arithmetic operator (++)
        orderCounter++;
        return orderCounter;
    }

    // UNIT II: Static helper method to update the counter when reading from files
    public static synchronized void updateOrderCounter(int highestLoadedNumber) {
        // UNIT I: Comparison operator (>), if/else statement
        if (highestLoadedNumber > orderCounter) {
            orderCounter = highestLoadedNumber;
        }
    }

    // UNIT II: Static getter for the current order counter value
    public static synchronized int getCurrentOrderCounter() {
        return orderCounter;
    }

    // UNIT II: Passing object as parameter (FoodItem item)
    public void addItem(FoodItem item, int quantity) throws InvalidOrderException {
        // UNIT I: Comparison operator (<=), Logical operator (||)
        if (item == null) {
            // UNIT III: User-defined exception for unknown/null item
            throw new InvalidOrderException("Invalid item: item cannot be null.");
        }
        if (quantity < 1) {
            // UNIT III: User-defined exception for invalid quantity
            throw new InvalidOrderException("Quantity must be at least 1.");
        }
        
        this.items.add(item);
        this.quantities.add(quantity);
    }

    // UNIT II: Method Overloading - Version 1 (Calculates total for the ENTIRE order)
    public double calculateTotal() {
        // UNIT I: Primitive data type double and initialization
        double total = 0.0;
        
        // UNIT I: for loop to iterate through items array list
        for (int i = 0; i < this.items.size(); i++) {
            FoodItem currentItem = this.items.get(i);
            int qty = this.quantities.get(i);
            
            // UNIT I: Arithmetic operators (+ and *)
            // Calls overloaded Version 2 for individual line-item computation
            total += calculateTotal(currentItem, qty);
        }
        
        return total;
    }

    // UNIT II: Method Overloading - Version 2 (Calculates total for a SINGLE item and quantity)
    public double calculateTotal(FoodItem item, int quantity) {
        // UNIT I: if condition, arithmetic multiplication
        if (item == null || quantity <= 0) {
            return 0.0;
        }
        return item.getPrice() * quantity;
    }

    // UNIT III: Implementation of abstract method from Trackable interface
    @Override
    public String getStatus() {
        return this.status;
    }

    // UNIT II: Public Setter with validation and switch statement
    public void setStatus(String newStatus) throws InvalidOrderException {
        if (newStatus == null || newStatus.trim().length() == 0) {
            throw new InvalidOrderException("Status cannot be empty.");
        }
        
        String cleanStatus = newStatus.trim();
        // UNIT III: String method equalsIgnoreCase()
        // UNIT I: switch-case control structure
        switch (cleanStatus.toLowerCase()) {
            case "placed":
                this.status = "Placed";
                break;
            case "preparing":
                this.status = "Preparing";
                break;
            case "ready":
                this.status = "Ready";
                break;
            default:
                // UNIT III: Custom exception for invalid status value
                throw new InvalidOrderException("Invalid status: " + newStatus + ". Must be Placed, Preparing, or Ready.");
        }
    }

    // UNIT II: Dynamic Method Dispatch Demonstration
    // Calls item.getCategory() through the base class FoodItem reference at runtime!
    public String getOrderSummary() {
        // UNIT III: StringBuffer / StringBuilder usage
        StringBuilder sb = new StringBuilder();
        
        sb.append("Order #").append(this.orderNumber)
          .append(" for ").append(this.studentName)
          .append(" | Status: ").append(this.status)
          .append(" | Items: ");

        // UNIT I: while loop demonstration
        int index = 0;
        while (index < this.items.size()) {
            FoodItem item = this.items.get(index);
            int qty = this.quantities.get(index);
            
            // UNIT II: Dynamic Method Dispatch:
            // JVM dynamically determines whether Meal.getCategory(), Snack.getCategory(), or Beverage.getCategory() is called!
            String category = item.getCategory();
            
            sb.append(item.getName())
              .append(" (").append(category).append(")")
              .append(" x").append(qty);
            
            if (index < this.items.size() - 1) {
                sb.append(", ");
            }
            index++;
        }

        sb.append(" | Total: ₹").append(String.format("%.2f", calculateTotal()));
        return sb.toString();
    }

    // Build JSON representation manually without any external libraries
    public String toJson() {
        // UNIT III: StringBuilder for building JSON
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"orderNumber\":").append(this.orderNumber).append(",");
        sb.append("\"studentName\":\"").append(escapeJson(this.studentName)).append("\",");
        sb.append("\"status\":\"").append(escapeJson(this.status)).append("\",");
        sb.append("\"timestamp\":").append(this.timestamp).append(",");
        sb.append("\"total\":").append(String.format("%.2f", calculateTotal())).append(",");
        sb.append("\"items\":[");
        
        for (int i = 0; i < this.items.size(); i++) {
            FoodItem item = this.items.get(i);
            int qty = this.quantities.get(i);
            if (i > 0) sb.append(",");
            sb.append("{");
            sb.append("\"id\":").append(item.getId()).append(",");
            sb.append("\"name\":\"").append(escapeJson(item.getName())).append("\",");
            // UNIT II: Dynamic method dispatch in JSON export
            sb.append("\"category\":\"").append(escapeJson(item.getCategory())).append("\",");
            sb.append("\"price\":").append(String.format("%.2f", item.getPrice())).append(",");
            sb.append("\"quantity\":").append(qty);
            sb.append("}");
        }
        sb.append("]}");
        return sb.toString();
    }

    // Helper method to escape quotes and control characters for manual JSON
    private String escapeJson(String text) {
        if (text == null) return "";
        // UNIT III: String replacement methods
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\b", "\\b")
                   .replace("\f", "\\f")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    // UNIT II: Public Getters (Encapsulation)
    public int getOrderNumber() {
        return this.orderNumber;
    }

    public String getStudentName() {
        return this.studentName;
    }

    public ArrayList<FoodItem> getItems() {
        return this.items;
    }

    public ArrayList<Integer> getQuantities() {
        return this.quantities;
    }

    public long getTimestamp() {
        return this.timestamp;
    }
}
