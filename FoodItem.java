// FoodItem.java
// UNIT II: Abstract class representing a general item on the canteen menu
public abstract class FoodItem {
    // UNIT II: Private fields (Encapsulation / Access Modifiers)
    // UNIT I: Primitive data types (int, double)
    private int id;
    private String name;
    private double price;

    // UNIT II: Parameterized Constructor using 'this' keyword to initialize private fields
    public FoodItem(int id, String name, double price) {
        this.id = id;
        // UNIT III: String methods trim() to clean user input
        this.name = (name != null) ? name.trim() : "";
        this.price = price;
    }

    // UNIT II: Public Getters and Setters (Encapsulation)
    public int getId() {
        return this.id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        // UNIT III: String method trim()
        this.name = (name != null) ? name.trim() : "";
    }

    public double getPrice() {
        return this.price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    // UNIT II: Abstract method - must be implemented by concrete subclasses (Meal, Snack, Beverage)
    public abstract String getCategory();

    // UNIT II: Normal concrete method inherited by all subclasses
    public String getDescription() {
        // UNIT III: String methods toUpperCase() and string concatenation
        // UNIT I: Comparison operator (price > 0)
        String cat = getCategory().toUpperCase();
        return "[" + cat + "] " + this.name + " - ₹" + String.format("%.2f", this.price);
    }
}
