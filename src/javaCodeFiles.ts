export interface ProjectSourceFile {
  name: string;
  path: string;
  language: string;
  unit: string;
  purpose: string;
  content: string;
}

export const PROJECT_FILES: ProjectSourceFile[] = [
  {
    name: 'Main.java',
    path: 'Main.java',
    language: 'java',
    unit: 'Unit I, II, III, IV',
    purpose: 'HTTP Server on port 8080, route definitions, auto-save background thread, and manual JSON builder.',
    content: `import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

// Main.java
// Entry point for Smart Canteen Pre-Order System
public class Main {

    // UNIT II: final keyword - constant for the HTTP server port
    // UNIT I: Primitive data type int
    public static final int PORT = 8080;

    // UNIT I: Array of Strings storing available food categories
    public static final String[] CATEGORIES = {"Meal", "Snack", "Beverage"};

    // UNIT II: In-memory collections of objects using standard ArrayList
    private static ArrayList<FoodItem> menu = new ArrayList<FoodItem>();
    private static ArrayList<Order> orders = new ArrayList<Order>();

    // FileStorage instance for handling CSV persistence
    private static FileStorage storage = new FileStorage();

    // Auto-increment ID generator for food items
    private static int nextFoodId = 1;

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("  Smart Canteen Pre-Order System (Java OOP)      ");
        System.out.println("=================================================");

        // UNIT IV: Load persisted data from plain CSV files on startup
        menu = storage.loadMenu();
        orders = storage.loadOrders(menu);

        // Calculate next available Food ID
        // UNIT I: for loop
        for (int i = 0; i < menu.size(); i++) {
            // UNIT I: Comparison operator (>), arithmetic (+)
            if (menu.get(i).getId() >= nextFoodId) {
                nextFoodId = menu.get(i).getId() + 1;
            }
        }

        System.out.println("Loaded " + menu.size() + " menu items and " + orders.size() + " orders from storage.");

        // UNIT IV: Multithreading - Background Thread created by implementing Runnable
        // Automatically saves all data to CSV files every 30 seconds
        AutoSaveTask autoSaver = new AutoSaveTask();
        Thread autoSaveThread = new Thread(autoSaver);
        autoSaveThread.setDaemon(true); // Allows JVM to exit cleanly when main server stops
        autoSaveThread.start();
        System.out.println("[Background Thread] Auto-save background thread started (30s interval).");

        // Start JDK built-in HTTP server
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

            // API Routes
            server.createContext("/api/menu", new MenuHandler());
            server.createContext("/api/menu/delete", new MenuDeleteHandler());
            server.createContext("/api/orders", new OrdersHandler());
            server.createContext("/api/orders/status", new OrderStatusHandler());

            // Static File Serving (public/ folder for HTML & CSS)
            server.createContext("/", new StaticFileHandler());

            server.setExecutor(null); // Default single/multi thread executor
            server.start();

            System.out.println("Server running on: http://localhost:" + PORT + "/index.html");
            System.out.println("Student Portal:    http://localhost:" + PORT + "/index.html");
            System.out.println("Staff Portal:      http://localhost:" + PORT + "/staff.html");
            System.out.println("Press Ctrl+C to stop the server.");
        } catch (IOException e) {
            // UNIT III: Catching built-in IOException
            System.err.println("Fatal: Could not start HTTP server on port " + PORT + ": " + e.getMessage());
        }
    }

    // =========================================================================
    // UNIT IV: Multithreading - Class implementing Runnable for background auto-save
    // =========================================================================
    static class AutoSaveTask implements Runnable {
        @Override
        public void run() {
            // UNIT I: Primitive data type boolean
            boolean running = true;
            
            // UNIT I: while loop
            while (running) {
                try {
                    // Sleep for 30 seconds (30,000 milliseconds)
                    Thread.sleep(30000);
                    
                    // Synchronized block to prevent concurrent write collisions
                    synchronized (storage) {
                        storage.saveMenu(menu);
                        storage.saveOrders(orders);
                    }
                    System.out.println("[AutoSaveThread] Auto-saved data to CSV files.");
                } catch (InterruptedException e) {
                    System.out.println("[AutoSaveThread] Thread interrupted. Exiting auto-save loop.");
                    running = false;
                }
            }
        }
    }

    // =========================================================================
    // HELPER METHODS: Search and Business Logic
    // =========================================================================

    // UNIT II: Method returning a FoodItem object
    // UNIT II: Passing primitive int as parameter
    public static synchronized FoodItem findItemById(int id) {
        // UNIT I: for loop
        for (int i = 0; i < menu.size(); i++) {
            // UNIT I: Comparison operator (==)
            if (menu.get(i).getId() == id) {
                return menu.get(i);
            }
        }
        return null;
    }

    // UNIT II: Method returning an Order object
    public static synchronized Order findOrderByNumber(int orderNumber) {
        for (int i = 0; i < orders.size(); i++) {
            if (orders.get(i).getOrderNumber() == orderNumber) {
                return orders.get(i);
            }
        }
        return null;
    }

    // Synchronously save both files to guarantee immediate persistence on changes
    public static synchronized void persistAll() {
        storage.saveMenu(menu);
        storage.saveOrders(orders);
    }

    // =========================================================================
    // HTTP HANDLERS
    // =========================================================================

    // Handler for /api/menu (GET: list menu, POST: add item)
    static class MenuHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);

            String method = exchange.getRequestMethod().toUpperCase();
            if (method.equals("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (method.equals("GET")) {
                // Return all menu items as JSON
                // UNIT III: StringBuilder for assembling JSON manually
                StringBuilder json = new StringBuilder();
                json.append("[");
                synchronized (menu) {
                    for (int i = 0; i < menu.size(); i++) {
                        FoodItem item = menu.get(i);
                        if (i > 0) json.append(",");
                        json.append("{");
                        json.append(\"\\\\\\"id\\\\\\":\").append(item.getId()).append(\",\");
                        json.append(\"\\\\\\"name\\\\\\":\\\\\\"\").append(escapeJson(item.getName())).append(\"\\\\\\",\");
                        // UNIT II: Dynamic method dispatch - polymorphism through FoodItem reference!
                        json.append(\"\\\\\\"category\\\\\\":\\\\\\"\").append(escapeJson(item.getCategory())).append(\"\\\\\\",\");
                        json.append(\"\\\\\\"price\\\\\\":\").append(String.format(\"%.2f\", item.getPrice())).append(\",\");
                        json.append(\"\\\\\\"description\\\\\\":\\\\\\"\").append(escapeJson(item.getDescription())).append(\"\\\\\\"\");
                        json.append("}");
                    }
                }
                json.append("]");
                sendResponse(exchange, 200, "application/json", json.toString());

            } else if (method.equals("POST")) {
                // Staff adds a new item: name, price, category
                try {
                    Map<String, String> params = parseRequestBody(exchange);
                    String name = params.get("name");
                    String priceStr = params.get("price");
                    String category = params.get("category");

                    // UNIT III: Validation and user-defined exception throwing
                    if (name == null || name.trim().length() == 0) {
                        throw new InvalidOrderException("Item name cannot be empty.");
                    }
                    if (priceStr == null || priceStr.trim().length() == 0) {
                        throw new InvalidOrderException("Price cannot be empty.");
                    }
                    if (category == null || category.trim().length() == 0) {
                        throw new InvalidOrderException("Category must be selected.");
                    }

                    // UNIT III: Parsing price with try/catch for NumberFormatException
                    double price;
                    try {
                        price = Double.parseDouble(priceStr.trim());
                    } catch (NumberFormatException nfe) {
                        throw new InvalidOrderException("Price must be a valid numeric number.");
                    }

                    // UNIT I: Comparison operator (<= 0)
                    if (price <= 0.0) {
                        throw new InvalidOrderException("Price must be greater than zero.");
                    }

                    // UNIT I: Validation of category with array search
                    // UNIT I: Primitive boolean flag
                    boolean validCategory = false;
                    for (int c = 0; c < CATEGORIES.length; c++) {
                        // UNIT III: String method equalsIgnoreCase
                        if (CATEGORIES[c].equalsIgnoreCase(category.trim())) {
                            validCategory = true;
                            category = CATEGORIES[c];
                            break;
                        }
                    }

                    if (!validCategory) {
                        throw new InvalidOrderException("Invalid category. Allowed: Meal, Snack, Beverage.");
                    }

                    FoodItem newItem;
                    int id;
                    synchronized (Main.class) {
                        id = nextFoodId++;
                        newItem = storage.createItem(id, name.trim(), price, category);
                        menu.add(newItem);
                        persistAll();
                    }

                    String successJson = "{\\"success\\":true,\\"message\\":\\"Item added successfully.\\",\\"id\\":" + id + "}";
                    sendResponse(exchange, 201, "application/json", successJson);

                } catch (InvalidOrderException ioe) {
                    // UNIT III: Catch user-defined exception
                    sendErrorResponse(exchange, 400, ioe.getMessage());
                } catch (Exception ex) {
                    sendErrorResponse(exchange, 500, "Internal server error: " + ex.getMessage());
                }
            } else {
                sendErrorResponse(exchange, 405, "Method not allowed");
            }
        }
    }

    // Handler for /api/menu/delete (POST: remove item by id)
    static class MenuDeleteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod().toUpperCase();
            if (method.equals("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!method.equals("POST")) {
                sendErrorResponse(exchange, 405, "Method not allowed");
                return;
            }

            try {
                Map<String, String> params = parseRequestBody(exchange);
                String idStr = params.get("id");
                if (idStr == null || idStr.trim().length() == 0) {
                    throw new InvalidOrderException("Item ID is required for deletion.");
                }

                int id;
                try {
                    id = Integer.parseInt(idStr.trim());
                } catch (NumberFormatException nfe) {
                    throw new InvalidOrderException("Item ID must be an integer.");
                }

                boolean removed = false;
                synchronized (menu) {
                    for (int i = 0; i < menu.size(); i++) {
                        if (menu.get(i).getId() == id) {
                            menu.remove(i);
                            removed = true;
                            break;
                        }
                    }
                    if (removed) {
                        persistAll();
                    }
                }

                if (!removed) {
                    throw new InvalidOrderException("Item with ID " + id + " was not found.");
                }

                sendResponse(exchange, 200, "application/json", "{\\"success\\":true,\\"message\\":\\"Item removed.\\"}");

            } catch (InvalidOrderException ioe) {
                sendErrorResponse(exchange, 400, ioe.getMessage());
            } catch (Exception ex) {
                sendErrorResponse(exchange, 500, "Internal error: " + ex.getMessage());
            }
        }
    }

    // Handler for /api/orders (GET: list orders for staff, POST: place order for student)
    static class OrdersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod().toUpperCase();
            if (method.equals("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (method.equals("GET")) {
                // List all orders (for staff dashboard)
                StringBuilder json = new StringBuilder();
                json.append("[");
                synchronized (orders) {
                    for (int i = 0; i < orders.size(); i++) {
                        if (i > 0) json.append(",");
                        json.append(orders.get(i).toJson());
                    }
                }
                json.append("]");
                sendResponse(exchange, 200, "application/json", json.toString());

            } else if (method.equals("POST")) {
                // Student places an order: studentName, items (format: "id:qty,id:qty")
                try {
                    Map<String, String> params = parseRequestBody(exchange);
                    String studentName = params.get("studentName");
                    String itemsSpec = params.get("items");

                    // UNIT III: Custom exception check for empty student name
                    if (studentName == null || studentName.trim().length() == 0) {
                        throw new InvalidOrderException("Student name cannot be empty.");
                    }

                    // UNIT III: Custom exception check for empty cart
                    if (itemsSpec == null || itemsSpec.trim().length() == 0) {
                        throw new InvalidOrderException("Your cart is empty. Please select at least one item.");
                    }

                    // Instantiate new Order
                    Order newOrder = new Order(studentName.trim());

                    // UNIT III: String method split(",") to parse each item entry
                    String[] tokens = itemsSpec.split(",");
                    int addedCount = 0;

                    for (String token : tokens) {
                        if (token.trim().isEmpty()) continue;
                        // Format: "id:qty"
                        String[] pair = token.split(":");
                        if (pair.length != 2) {
                            throw new InvalidOrderException("Invalid item format: " + token);
                        }

                        int itemId;
                        int qty;
                        try {
                            // UNIT III: NumberFormatException handling
                            itemId = Integer.parseInt(pair[0].trim());
                            qty = Integer.parseInt(pair[1].trim());
                        } catch (NumberFormatException nfe) {
                            throw new InvalidOrderException("Item ID and quantity must be numbers.");
                        }

                        // UNIT I: Comparison operator
                        if (qty < 1) {
                            throw new InvalidOrderException("Quantity must be at least 1 for all items.");
                        }

                        // Lookup FoodItem in memory
                        // UNIT II: Return object from method findItemById
                        FoodItem item = findItemById(itemId);
                        if (item == null) {
                            // UNIT III: Custom exception for unknown item id
                            throw new InvalidOrderException("Item with ID " + itemId + " was not found in the canteen menu.");
                        }

                        // UNIT II: Pass object as parameter to addItem()
                        newOrder.addItem(item, qty);
                        addedCount++;
                    }

                    if (addedCount == 0) {
                        throw new InvalidOrderException("Your cart is empty. Please select at least one item.");
                    }

                    // Save order in memory and persist to CSV
                    synchronized (orders) {
                        orders.add(newOrder);
                        persistAll();
                    }

                    // Return order summary and order number
                    StringBuilder responseJson = new StringBuilder();
                    responseJson.append("{")
                                .append("\\"success\\":true,")
                                .append("\\"orderNumber\\":").append(newOrder.getOrderNumber()).append(",")
                                .append("\\"studentName\\":\\"").append(escapeJson(newOrder.getStudentName())).append("\\",")
                                .append("\\"total\\":").append(String.format("%.2f", newOrder.calculateTotal())).append(",")
                                .append("\\"status\\":\\"").append(escapeJson(newOrder.getStatus())).append("\\",")
                                .append("\\"message\\":\\"Order placed successfully! Show your order number at the counter.\\"")
                                .append("}");

                    sendResponse(exchange, 201, "application/json", responseJson.toString());

                } catch (InvalidOrderException ioe) {
                    sendErrorResponse(exchange, 400, ioe.getMessage());
                } catch (Exception ex) {
                    sendErrorResponse(exchange, 500, "Order failed: " + ex.getMessage());
                }
            } else {
                sendErrorResponse(exchange, 405, "Method not allowed");
            }
        }
    }

    // Handler for /api/orders/status (GET: track one order, POST: staff updates status)
    static class OrderStatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod().toUpperCase();
            if (method.equals("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (method.equals("GET")) {
                // Tracking a specific order: /api/orders/status?number=N
                try {
                    String query = exchange.getRequestURI().getQuery();
                    Map<String, String> queryParams = parseQuery(query);
                    String numStr = queryParams.get("number");

                    if (numStr == null || numStr.trim().length() == 0) {
                        throw new InvalidOrderException("Order number is required to track status.");
                    }

                    int orderNumber;
                    try {
                        orderNumber = Integer.parseInt(numStr.trim());
                    } catch (NumberFormatException nfe) {
                        throw new InvalidOrderException("Order number must be a valid integer.");
                    }

                    Order order = findOrderByNumber(orderNumber);
                    if (order == null) {
                        // UNIT III: Custom exception for unknown order number
                        throw new InvalidOrderException("Order #" + orderNumber + " not found. Please check your number.");
                    }

                    // Return status JSON
                    StringBuilder sb = new StringBuilder();
                    sb.append("{")
                      .append("\\"success\\":true,")
                      .append("\\"orderNumber\\":").append(order.getOrderNumber()).append(",")
                      .append("\\"studentName\\":\\"").append(escapeJson(order.getStudentName())).append("\\",")
                      // UNIT III: Calling interface method getStatus() on Trackable order
                      .append("\\"status\\":\\"").append(escapeJson(order.getStatus())).append("\\",")
                      .append("\\"total\\":").append(String.format("%.2f", order.calculateTotal())).append(",")
                      .append("\\"summary\\":\\"").append(escapeJson(order.getOrderSummary())).append("\\"")
                      .append("}");

                    sendResponse(exchange, 200, "application/json", sb.toString());

                } catch (InvalidOrderException ioe) {
                    sendErrorResponse(exchange, 404, ioe.getMessage());
                } catch (Exception ex) {
                    sendErrorResponse(exchange, 500, "Server error: " + ex.getMessage());
                }

            } else if (method.equals("POST")) {
                // Staff updates status: number, status ("Placed", "Preparing", "Ready")
                try {
                    Map<String, String> params = parseRequestBody(exchange);
                    String numStr = params.get("number");
                    String status = params.get("status");

                    if (numStr == null || numStr.trim().length() == 0) {
                        throw new InvalidOrderException("Order number is required.");
                    }
                    if (status == null || status.trim().length() == 0) {
                        throw new InvalidOrderException("Status value is required.");
                    }

                    int orderNumber;
                    try {
                        orderNumber = Integer.parseInt(numStr.trim());
                    } catch (NumberFormatException nfe) {
                        throw new InvalidOrderException("Order number must be an integer.");
                    }

                    Order order = findOrderByNumber(orderNumber);
                    if (order == null) {
                        throw new InvalidOrderException("Order #" + orderNumber + " not found.");
                    }

                    // Update status
                    order.setStatus(status.trim());
                    persistAll();

                    StringBuilder sb = new StringBuilder();
                    sb.append("{")
                      .append("\\"success\\":true,")
                      .append("\\"orderNumber\\":").append(order.getOrderNumber()).append(",")
                      .append("\\"status\\":\\"").append(escapeJson(order.getStatus())).append("\\",")
                      .append("\\"message\\":\\"Order status updated successfully.\\"")
                      .append("}");

                    sendResponse(exchange, 200, "application/json", sb.toString());

                } catch (InvalidOrderException ioe) {
                    sendErrorResponse(exchange, 400, ioe.getMessage());
                } catch (Exception ex) {
                    sendErrorResponse(exchange, 500, "Server error: " + ex.getMessage());
                }
            } else {
                sendErrorResponse(exchange, 405, "Method not allowed");
            }
        }
    }

    // =========================================================================
    // STATIC FILE HANDLER: Serves public/index.html, public/staff.html, public/style.css
    // =========================================================================
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            
            // Map root "/" to "/index.html"
            if (path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            File file = new File("public" + path);

            // UNIT I: Comparison operator and if check
            if (!file.exists() || file.isDirectory()) {
                String notFound = "<h1>404 Not Found</h1><p>The requested file " + path + " was not found.</p>";
                sendResponse(exchange, 404, "text/html", notFound);
                return;
            }

            // Determine MIME content type
            String contentType = "text/plain";
            // UNIT III: String method endsWith()
            if (path.endsWith(".html")) {
                contentType = "text/html; charset=UTF-8";
            } else if (path.endsWith(".css")) {
                contentType = "text/css; charset=UTF-8";
            } else if (path.endsWith(".js")) {
                contentType = "application/javascript; charset=UTF-8";
            }

            // Read file and send bytes
            byte[] bytes = new byte[(int) file.length()];
            try (FileInputStream fis = new FileInputStream(file)) {
                fis.read(bytes);
            }

            exchange.getResponseHeaders().set("Content-Type", contentType);
            addCorsHeaders(exchange);
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }

    // =========================================================================
    // UTILITY METHODS: Parsing and Responses
    // =========================================================================

    // Parse form-encoded (application/x-www-form-urlencoded) request body
    private static Map<String, String> parseRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        byte[] buffer = new byte[4096];
        StringBuilder bodyBuilder = new StringBuilder();
        int bytesRead;
        // UNIT I: while loop
        while ((bytesRead = is.read(buffer)) != -1) {
            bodyBuilder.append(new String(buffer, 0, bytesRead, StandardCharsets.UTF_8));
        }
        return parseQuery(bodyBuilder.toString());
    }

    // Parse URL query string or form body into Key-Value Map
    private static Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<String, String>();
        if (query == null || query.trim().length() == 0) {
            return map;
        }

        // UNIT III: String method split("&")
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            if (pair.trim().isEmpty()) continue;
            // UNIT III: String method split("=", 2)
            String[] kv = pair.split("=", 2);
            try {
                String key = URLDecoder.decode(kv[0].trim(), StandardCharsets.UTF_8.name());
                String value = (kv.length > 1) ? URLDecoder.decode(kv[1].trim(), StandardCharsets.UTF_8.name()) : "";
                map.put(key, value);
            } catch (Exception e) {
                // Ignore encoding errors
            }
        }
        return map;
    }

    // Add CORS headers so frontend fetch requests succeed without restriction
    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    // Send HTTP Response
    private static void sendResponse(HttpExchange exchange, int statusCode, String contentType, String body) throws IOException {
        byte[] responseBytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        addCorsHeaders(exchange);
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(responseBytes);
        os.close();
    }

    // Send JSON error response
    private static void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        // UNIT III: StringBuilder for assembling error JSON
        StringBuilder json = new StringBuilder();
        json.append("{")
            .append("\\"success\\":false,")
            .append("\\"error\\":\\"").append(escapeJson(message)).append("\\"")
            .append("}");
        sendResponse(exchange, statusCode, "application/json", json.toString());
    }

    // Escape special characters for valid JSON
    private static String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\\\", "\\\\\\\\")
                   .replace("\\"", "\\\\\\"")
                   .replace("\\b", "\\\\b")
                   .replace("\\f", "\\\\f")
                   .replace("\\n", "\\\\n")
                   .replace("\\r", "\\\\r")
                   .replace("\\t", "\\\\t");
    }
}`
  },
  {
    name: 'FoodItem.java',
    path: 'FoodItem.java',
    language: 'java',
    unit: 'Unit II',
    purpose: 'Abstract base class defining fields, getters, abstract getCategory(), and concrete getDescription().',
    content: `// FoodItem.java
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
}`
  },
  {
    name: 'Meal.java',
    path: 'Meal.java',
    language: 'java',
    unit: 'Unit II',
    purpose: 'Subclass representing full meals, invoking super() and overriding getCategory().',
    content: `// Meal.java
// UNIT II: Subclass extending abstract class FoodItem (Inheritance)
public class Meal extends FoodItem {

    // UNIT II: Constructor using super(...) to invoke the parent class constructor
    public Meal(int id, String name, double price) {
        super(id, name, price);
    }

    // UNIT II: Method Overriding - concrete implementation of abstract method getCategory()
    @Override
    public String getCategory() {
        return "Meal";
    }
}`
  },
  {
    name: 'Snack.java',
    path: 'Snack.java',
    language: 'java',
    unit: 'Unit II',
    purpose: 'Subclass representing snacks, invoking super() and overriding getCategory().',
    content: `// Snack.java
// UNIT II: Subclass extending abstract class FoodItem (Inheritance)
public class Snack extends FoodItem {

    // UNIT II: Constructor using super(...) to invoke the parent class constructor
    public Snack(int id, String name, double price) {
        super(id, name, price);
    }

    // UNIT II: Method Overriding - concrete implementation of abstract method getCategory()
    @Override
    public String getCategory() {
        return "Snack";
    }
}`
  },
  {
    name: 'Beverage.java',
    path: 'Beverage.java',
    language: 'java',
    unit: 'Unit II',
    purpose: 'Subclass representing drinks/beverages, invoking super() and overriding getCategory().',
    content: `// Beverage.java
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
}`
  },
  {
    name: 'Order.java',
    path: 'Order.java',
    language: 'java',
    unit: 'Unit II & III & IV',
    purpose: 'Implements Trackable, static order counter, synchronized generation, overloaded calculateTotal, dynamic dispatch summary.',
    content: `import java.util.ArrayList;

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
        sb.append(\"\\"orderNumber\\":\").append(this.orderNumber).append(\",\");
        sb.append(\"\\"studentName\\":\\"\").append(escapeJson(this.studentName)).append(\"\\",\");
        sb.append(\"\\"status\\":\\"\").append(escapeJson(this.status)).append(\"\\",\");
        sb.append(\"\\"timestamp\\":\").append(this.timestamp).append(\",\");
        sb.append(\"\\"total\\":\").append(String.format(\"%.2f\", calculateTotal())).append(\",\");
        sb.append(\"\\"items\\":[\");
        
        for (int i = 0; i < this.items.size(); i++) {
            FoodItem item = this.items.get(i);
            int qty = this.quantities.get(i);
            if (i > 0) sb.append(\",\");
            sb.append(\"{\");
            sb.append(\"\\"id\\":\").append(item.getId()).append(\",\");
            sb.append(\"\\"name\\":\\"\").append(escapeJson(item.getName())).append(\"\\",\");
            // UNIT II: Dynamic method dispatch in JSON export
            sb.append(\"\\"category\\":\\"\").append(escapeJson(item.getCategory())).append(\"\\",\");
            sb.append(\"\\"price\\":\").append(String.format(\"%.2f\", item.getPrice())).append(\",\");
            sb.append(\"\\"quantity\\":\").append(qty);
            sb.append(\"}\");
        }
        sb.append(\"]}\");
        return sb.toString();
    }

    // Helper method to escape quotes and control characters for manual JSON
    private String escapeJson(String text) {
        if (text == null) return \"\";
        // UNIT III: String replacement methods
        return text.replace(\"\\\\\\\\\", \"\\\\\\\\\\\\\\\\\")
                   .replace(\"\\\\\\"\", \"\\\\\\\\\\\\\\\"\")
                   .replace(\"\\\\b\", \"\\\\\\\\b\")
                   .replace(\"\\\\f\", \"\\\\\\\\f\")
                   .replace(\"\\\\n\", \"\\\\\\\\n\")
                   .replace(\"\\\\r\", \"\\\\\\\\r\")
                   .replace(\"\\\\t\", \"\\\\\\\\t\");
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
}`
  },
  {
    name: 'Trackable.java',
    path: 'Trackable.java',
    language: 'java',
    unit: 'Unit III',
    purpose: 'Interface defining getStatus() method contract for status tracking.',
    content: `// Trackable.java
// UNIT III: Interface definition - provides a contract for any class that can report progress
public interface Trackable {
    // UNIT III: Abstract method declaration in an interface
    String getStatus();
}`
  },
  {
    name: 'InvalidOrderException.java',
    path: 'InvalidOrderException.java',
    language: 'java',
    unit: 'Unit III',
    purpose: 'Custom exception thrown for empty cart, invalid quantities, unknown items, negative prices.',
    content: `// InvalidOrderException.java
// UNIT III: User-defined custom Exception extending the checked Exception class
public class InvalidOrderException extends Exception {
    
    // UNIT II: Constructor calling super(message) to pass error details to Exception
    public InvalidOrderException(String message) {
        super(message);
    }
}`
  },
  {
    name: 'FileStorage.java',
    path: 'FileStorage.java',
    language: 'java',
    unit: 'Unit IV',
    purpose: 'CSV File I/O using BufferedReader/FileReader and BufferedWriter/FileWriter for data/menu.csv & data/orders.csv.',
    content: `import java.io.BufferedReader;
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
        return text.replace(",", " ").replace("\\n", " ").replace("\\r", " ").trim();
    }
}`
  },
  {
    name: 'index.html',
    path: 'public/index.html',
    language: 'html',
    unit: 'Frontend / Client',
    purpose: 'Student Pre-Order interface: category menu, live cart, order number display, 5s status polling.',
    content: `<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Canteen - Student Pre-Order</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- See public/index.html in project files -->
</body>
</html>`
  },
  {
    name: 'staff.html',
    path: 'public/staff.html',
    language: 'html',
    unit: 'Frontend / Client',
    purpose: 'Staff Management interface: add item form, delete button, orders queue, Placed -> Preparing -> Ready transitions.',
    content: `<!-- public/staff.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Canteen - Staff Management Portal</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- See public/staff.html in project files -->
</body>
</html>`
  },
  {
    name: 'style.css',
    path: 'public/style.css',
    language: 'css',
    unit: 'Frontend / Styling',
    purpose: 'Clean, responsive, mobile-friendly styles adhering to design standards and zero-pill discipline.',
    content: `/* public/style.css */
/* Clean, responsive design for Student and Staff portals */`
  }
];
