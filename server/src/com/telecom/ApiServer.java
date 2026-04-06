package com.telecom;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class ApiServer {
    private static final int PORT = 5000;

    public static void start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // CORS middleware
        server.createContext("/api/locations", new LocationsHandler());

        // Health check endpoint
        server.createContext("/api/health", exchange -> {
            sendResponse(exchange, 200, "{\"status\":\"ok\"}");
        });

        server.setExecutor(null);
        server.start();
        System.out.println("✓ API Server started on http://localhost:" + PORT);
    }

    static class LocationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // CORS headers
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");

            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            if ("GET".equals(exchange.getRequestMethod())) {
                try {
                    LocationDAO dao = new LocationDAO();
                    List<LocationPoint> locations = dao.fetchAll();
                    String json = toJson(locations);
                    sendResponse(exchange, 200, json);
                } catch (Exception e) {
                    e.printStackTrace();
                    sendResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
                }
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    private static String toJson(List<LocationPoint> locations) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < locations.size(); i++) {
            if (i > 0)
                json.append(",");
            LocationPoint p = locations.get(i);
            json.append("{")
                    .append("\"id\":").append(p.getId()).append(",")
                    .append("\"lat\":").append(p.getLat()).append(",")
                    .append("\"lng\":").append(p.getLang()).append(",")
                    .append("\"signalType\":\"").append(p.getSignalType()).append("\",")
                    .append("\"latency\":").append(p.getLatency())
                    .append("}");
        }
        json.append("]");
        return json.toString();
    }

    private static void sendResponse(HttpExchange exchange, int status, String content) throws IOException {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
            os.flush();
        }
    }
}
