# Test API Endpoints

This module provides comprehensive API endpoints for querying the `test` table with performance monitoring capabilities.

## 🚀 Available Endpoints

### 1. **Get All Records with Pagination & Search**
```
GET /test
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Records per page (default: 20)
- `search` (string): Search in data field
- `startDate` (string): Filter from date (ISO format)
- `endDate` (string): Filter to date (ISO format)
- `sortBy` (string): Sort field ('createdAt' | 'data')
- `sortOrder` (string): Sort direction ('asc' | 'desc')

**Example:**
```
GET /test?page=1&limit=50&search=Lorem&startDate=2024-10-01&endDate=2024-11-01&sortBy=createdAt&sortOrder=desc
```

### 2. **Get Record by ID**
```
GET /test/:id
```

**Example:**
```
GET /test/123
```

### 3. **Get Statistics**
```
GET /test/stats
```

Returns:
- Total record count
- Monthly distribution
- Recent records count (last 7 days)
- Query execution time

### 4. **Performance Metrics**
```
GET /test/performance
```

Runs multiple query types and measures performance:
- Count all records
- Find recent 100 records
- Search by data content
- Date range queries

### 5. **Search by Date Range (Simple)**
```
GET /test/search?startDate=2024-10-01&endDate=2024-11-01&limit=100
```

### 6. **Search by Text**
```
GET /test/search/text?q=Lorem&page=1&limit=20
```

### 7. **Search by Date Range (Detailed)**
```
GET /test/search/date-range?startDate=2024-10-01&endDate=2024-11-01&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

## 📊 Response Format

All endpoints return performance metrics including `queryTime` in milliseconds:

```json
{
  "data": [...],
  "total": 100000,
  "page": 1,
  "limit": 20,
  "totalPages": 5000,
  "queryTime": 45
}
```

## 🎯 Performance Testing

Use these endpoints to measure query performance before and after applying database partitions:

1. **Before Partitioning**: Run performance tests to establish baseline
2. **Apply Migration**: Run the partitioning migration
3. **After Partitioning**: Re-run tests to compare performance improvements

## 🔍 Key Features

- ✅ **Pagination**: Efficient data retrieval with pagination
- ✅ **Search**: Full-text search in data field
- ✅ **Date Filtering**: Range-based date queries
- ✅ **Sorting**: Multiple sort options
- ✅ **Performance Monitoring**: Built-in query timing
- ✅ **Statistics**: Comprehensive data insights
- ✅ **Type Safety**: Full TypeScript support

## 📈 Expected Performance Improvements

After partitioning, you should see:
- **Faster date range queries** (partition pruning)
- **Improved search performance** (smaller data sets per partition)
- **Better concurrent query handling**
- **Reduced I/O operations** for time-based queries
