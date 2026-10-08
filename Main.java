import com.sun.net.httpserver.HttpExchange;
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
                        json.append("\"id\":").append(item.getId()).append(",");
                        json.append("\"name\":\"").append(escapeJson(item.getName())).append("\",");
                        // UNIT II: Dynamic method dispatch - polymorphism through FoodItem reference!
                        json.append("\"category\":\"").append(escapeJson(item.getCategory())).append("\",");
                        json.append("\"price\":").append(String.format("%.2f", item.getPrice())).append(",");
                        json.append("\"description\":\"").append(escapeJson(item.getDescription())).append("\"");
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

                    String successJson = "{\"success\":true,\"message\":\"Item added successfully.\",\"id\":" + id + "}";
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

                sendResponse(exchange, 200, "application/json", "{\"success\":true,\"message\":\"Item removed.\"}");

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
                                .append("\"success\":true,")
                                .append("\"orderNumber\":").append(newOrder.getOrderNumber()).append(",")
                                .append("\"studentName\":\"").append(escapeJson(newOrder.getStudentName())).append("\",")
                                .append("\"total\":").append(String.format("%.2f", newOrder.calculateTotal())).append(",")
                                .append("\"status\":\"").append(escapeJson(newOrder.getStatus())).append("\",")
                                .append("\"message\":\"Order placed successfully! Show your order number at the counter.\"")
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
                      .append("\"success\":true,")
                      .append("\"orderNumber\":").append(order.getOrderNumber()).append(",")
                      .append("\"studentName\":\"").append(escapeJson(order.getStudentName())).append("\",")
                      // UNIT III: Calling interface method getStatus() on Trackable order
                      .append("\"status\":\"").append(escapeJson(order.getStatus())).append("\",")
                      .append("\"total\":").append(String.format("%.2f", order.calculateTotal())).append(",")
                      .append("\"summary\":\"").append(escapeJson(order.getOrderSummary())).append("\"")
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
                      .append("\"success\":true,")
                      .append("\"orderNumber\":").append(order.getOrderNumber()).append(",")
                      .append("\"status\":\"").append(escapeJson(order.getStatus())).append("\",")
                      .append("\"message\":\"Order status updated successfully.\"")
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
            .append("\"success\":false,")
            .append("\"error\":\"").append(escapeJson(message)).append("\"")
            .append("}");
        sendResponse(exchange, statusCode, "application/json", json.toString());
    }

    // Escape special characters for valid JSON
    private static String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\b", "\\b")
                   .replace("\f", "\\f")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}
