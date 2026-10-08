import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;

// FileStorage.java
// UNIT IV: File I/O class handling reading and writing of CSV files
public class FileStorage {

    // Folder and file paths
    private static final String DATA_DIR = "data";
    private static final String MENU_FILE = "data/menu.csv";
    private static final String ORDERS_FILE = "data/orders.csv";

    // UNIT II: Constructor
    public FileStorage() {
        // UNIT IV: Ensure directory and empty files exist automatically
        ensureDataFilesExist();
    }

    // UNIT IV: Helper to create the data folder and empty CSV files if not present
    public void ensureDataFilesExist() {
        try {
            File dir = new File(DATA_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File menuFile = new File(MENU_FILE);
            if (!menuFile.exists()) {
                menuFile.createNewFile();
            }

            File ordersFile = new File(ORDERS_FILE);
            if (!ordersFile.exists()) {
                ordersFile.createNewFile();
            }
        } catch (IOException e) {
            // UNIT III: Handling built-in IOException
            System.err.println("Error initializing data storage files: " + e.getMessage());
        }
    }

    // UNIT IV: Reading menu CSV with BufferedReader and FileReader
    // UNIT II: Returning an ArrayList of FoodItem objects
    public ArrayList<FoodItem> loadMenu() {
        ArrayList<FoodItem> menuList = new ArrayList<FoodItem>();
        File file = new File(MENU_FILE);

        // UNIT I: Comparison operator and if check
        if (!file.exists() || file.length() == 0) {
            return menuList; // Starts empty as per requirement
        }

        // UNIT IV & III: try-with-resources statement with BufferedReader and FileReader
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            
            // UNIT I: while loop to read each line
            while ((line = reader.readLine()) != null) {
                // UNIT III: String method trim()
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                // UNIT III: String method split() to parse CSV columns
                // Expected format: id,name,price,category
                String[] parts = line.split(",");
                
                // UNIT I: Comparison operator on array length
                if (parts.length >= 4) {
                    try {
                        // UNIT III: Parsing numbers; potential NumberFormatException handled
                        int id = Integer.parseInt(parts[0].trim());
                        String name = parts[1].trim();
                        double price = Double.parseDouble(parts[2].trim());
                        String category = parts[3].trim();

                        // UNIT II: Object instantiation based on category
                        FoodItem item = createItem(id, name, price, category);
                        if (item != null) {
                            menuList.add(item);
                        }
                    } catch (NumberFormatException nfe) {
                        // UNIT III: Handling NumberFormatException gracefully
                        System.err.println("Skipping malformed menu line: " + line);
                    }
                }
            }
        } catch (IOException e) {
            // UNIT III & IV: Catching built-in IOException
            System.err.println("IOException while loading menu: " + e.getMessage());
        }

        return menuList;
    }

    // UNIT II: Method returning a FoodItem object (Polymorphism)
    public FoodItem createItem(int id, String name, double price, String category) {
        if (category == null) return null;
        
        // UNIT III: String method equalsIgnoreCase()
        // UNIT I: if/else if control structure
        if (category.equalsIgnoreCase("Meal")) {
            return new Meal(id, name, price);
        } else if (category.equalsIgnoreCase("Snack")) {
            return new Snack(id, name, price);
        } else if (category.equalsIgnoreCase("Beverage")) {
            return new Beverage(id, name, price);
        } else {
            return null;
        }
    }

    // UNIT IV: Writing menu to CSV file using BufferedWriter and FileWriter
    public synchronized void saveMenu(ArrayList<FoodItem> menuList) {
        ensureDataFilesExist();
        File file = new File(MENU_FILE);

        // UNIT IV: try-with-resources with BufferedWriter & FileWriter
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, false))) {
            // UNIT I: for loop
            for (int i = 0; i < menuList.size(); i++) {
                FoodItem item = menuList.get(i);
                
                // UNIT III: StringBuilder for assembling the CSV record
                StringBuilder sb = new StringBuilder();
                sb.append(item.getId()).append(",")
                  .append(escapeCsv(item.getName())).append(",")
                  .append(item.getPrice()).append(",")
                  // UNIT II: Dynamic method dispatch - calls polymorphic getCategory()
                  .append(item.getCategory());

                writer.write(sb.toString());
                writer.newLine();
            }
            writer.flush();
        } catch (IOException e) {
            // UNIT III & IV: Handling IOException
            System.err.println("IOException while saving menu: " + e.getMessage());
        }
    }

    // UNIT IV: Reading orders CSV with BufferedReader and FileReader
    // UNIT II: Passing menu list as parameter to reconstruct Order objects
    public ArrayList<Order> loadOrders(ArrayList<FoodItem> menu) {
        ArrayList<Order> orderList = new ArrayList<Order>();
        File file = new File(ORDERS_FILE);

        if (!file.exists() || file.length() == 0) {
            return orderList;
        }

        int highestOrderNumber = 0;

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                // CSV format: orderNumber,studentName,status,timestamp,itemsSpec
                // itemsSpec format: id:qty;id:qty;...
                String[] parts = line.split(",", 5);
                if (parts.length >= 4) {
                    try {
                        int orderNum = Integer.parseInt(parts[0].trim());
                        String studentName = parts[1].trim();
                        String status = parts[2].trim();
                        long timestamp = Long.parseLong(parts[3].trim());

                        Order order = new Order(orderNum, studentName, status, timestamp);

                        if (parts.length >= 5 && parts[4].trim().length() > 0) {
                            String itemsSpec = parts[4].trim();
                            // UNIT III: String method split() with semicolon
                            String[] itemTokens = itemsSpec.split(";");
                            for (String token : itemTokens) {
                                if (token.trim().isEmpty()) continue;
                                String[] idQty = token.split(":");
                                if (idQty.length == 2) {
                                    int itemId = Integer.parseInt(idQty[0].trim());
                                    int qty = Integer.parseInt(idQty[1].trim());

                                    // Find item in menu
                                    FoodItem foundItem = findItemInList(menu, itemId);
                                    if (foundItem != null) {
                                        order.addItem(foundItem, qty);
                                    }
                                }
                            }
                        }

                        orderList.add(order);

                        // UNIT I: Comparison operator
                        if (orderNum > highestOrderNumber) {
                            highestOrderNumber = orderNum;
                        }

                    } catch (Exception ex) {
                        System.err.println("Skipping malformed order line: " + line + " (" + ex.getMessage() + ")");
                    }
                }
            }

            // UNIT II: Static method invocation to sync counter with highest saved order number
            Order.updateOrderCounter(highestOrderNumber);

        } catch (IOException e) {
            System.err.println("IOException while loading orders: " + e.getMessage());
        }

        return orderList;
    }

    // UNIT IV: Writing orders to CSV file using BufferedWriter and FileWriter
    public synchronized void saveOrders(ArrayList<Order> orders) {
        ensureDataFilesExist();
        File file = new File(ORDERS_FILE);

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, false))) {
            for (int i = 0; i < orders.size(); i++) {
                Order ord = orders.get(i);
                
                // UNIT III: StringBuilder for assembling order record
                StringBuilder sb = new StringBuilder();
                sb.append(ord.getOrderNumber()).append(",")
                  .append(escapeCsv(ord.getStudentName())).append(",")
                  .append(ord.getStatus()).append(",")
                  .append(ord.getTimestamp()).append(",");

                // Serialize items: id:qty;id:qty
                ArrayList<FoodItem> items = ord.getItems();
                ArrayList<Integer> quantities = ord.getQuantities();
                StringBuilder itemSb = new StringBuilder();
                for (int j = 0; j < items.size(); j++) {
                    if (j > 0) itemSb.append(";");
                    itemSb.append(items.get(j).getId()).append(":").append(quantities.get(j));
                }
                sb.append(itemSb.toString());

                writer.write(sb.toString());
                writer.newLine();
            }
            writer.flush();
        } catch (IOException e) {
            System.err.println("IOException while saving orders: " + e.getMessage());
        }
    }

    // UNIT II: Returning FoodItem object
    private FoodItem findItemInList(ArrayList<FoodItem> list, int id) {
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId() == id) {
                return list.get(i);
            }
        }
        return null;
    }

    // Helper to sanitize CSV field
    private String escapeCsv(String text) {
        if (text == null) return "";
        return text.replace(",", " ").replace("\n", " ").replace("\r", " ").trim();
    }
}
