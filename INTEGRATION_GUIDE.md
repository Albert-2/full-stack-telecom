# Frontend-Backend Integration Guide

## What Was Done

### Backend Changes

1. **Created `ApiServer.java`** - REST API server using Java's built-in `HttpServer`
   - Listens on `http://localhost:8080`
   - Exposes `/api/locations` endpoint that returns JSON array of location data
   - Includes CORS headers for frontend access
   - Includes `/api/health` endpoint for health checks

2. **Updated `Main.java`** - Modified to start API server alongside simulation
   - Added `IOException` import
   - Calls `ApiServer.start()` during initialization
   - Simulation continues to run in console (optional, can be removed)

### Frontend Changes

1. **Created `location-api.service.ts`** - HTTP service to fetch backend data
   - Signals: `locations`, `loading`, `error`
   - Method: `fetchLocations()` - Calls backend API

2. **Updated `app.config.ts`** - Added HTTP support
   - Added `provideHttpClient()` to enable Angular HTTP requests

## Testing the Integration

### Step 1: Start Backend

```bash
cd server
./run.sh    # On Linux/Mac
# or
run.bat     # On Windows
```

Expected output:

```
✓ API Server started on http://localhost:8080
[Stop #1]
 📍 Location: ...
```

### Step 2: Test API Endpoint

Open browser or use curl:

```bash
curl http://localhost:8080/api/locations
```

Should return JSON:

```json
[
  {"id":1,"lat":20.5937,"lng":78.9629,"signalType":"5G","latency":15},
  {"id":2,"lat":20.5945,"lng":78.9640,"signalType":"5G","latency":18},
  ...
]
```

### Step 3: Start Frontend

```bash
cd client/angular_client
npm install
npm start
```

Frontend runs on `http://localhost:4200`

### Step 4: Use Location API Service

In any component, inject and use the service:

```typescript
import { LocationApiService } from "../../services/location-api.service";

export class YourComponent {
  locationApi = inject(LocationApiService);

  ngOnInit() {
    this.locationApi.fetchLocations();
    const locations = this.locationApi.getLocations();
  }
}
```

## Next Steps (Optional Enhancements)

1. **Create location-streaming service** - Use WebSocket for real-time location updates
2. **Update dashboard components** - Replace mock data with backend locations
3. **Add authentication** - Token-based auth for API endpoints
4. **Error handling** - Retry logic and user-friendly error messages
5. **Caching** - Cache API responses and implement refresh intervals
