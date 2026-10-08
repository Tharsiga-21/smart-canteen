// Beverage.java
// UNIT II: Subclass extending abstract class FoodItem (Inheritance)
public class Beverage extends FoodItem {

    // UNIT II: Constructor using super(...) to invoke the parent class constructor
    public Beverage(int id, String name, double price) {
        super(id, name, price);
    }

    // UNIT II: Method Overriding - concrete implementation of abstract method getCategory()
    @Override
    public String getCategory() {
        return "Beverage";
    }
}
