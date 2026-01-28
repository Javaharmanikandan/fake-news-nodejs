# Backend Setup Instructions

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the backend directory:

```bash
# Copy the example file
cp env.example .env
```

Or create `.env` manually with these variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fake_news_db
DB_USER=postgres
DB_PASSWORD=root

# Server Configuration
PORT=3001
NODE_ENV=development

# AI Service URL
AI_SERVICE_URL=http://localhost:5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important:** Update `DB_PASSWORD` with your actual PostgreSQL password!

### Step 3: Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Step 4: Verify Server is Running

Open browser or use curl:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "fake-news-detection-backend",
  "timestamp": "2024-..."
}
```

## Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | localhost | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | Yes |
| `DB_NAME` | Database name | fake_news_db | Yes |
| `DB_USER` | PostgreSQL user | postgres | Yes |
| `DB_PASSWORD` | PostgreSQL password | (none) | Yes |
| `PORT` | Backend server port | 3001 | No |
| `NODE_ENV` | Environment mode | development | No |
| `AI_SERVICE_URL` | AI service endpoint | http://localhost:5000 | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 | No |

## Common Issues

### Database Connection Error

**Error:** `❌ Unexpected error on idle client`

**Solutions:**
1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure database `fake_news_db` exists
4. Test connection manually:
   ```bash
   psql -U postgres -d fake_news_db
   ```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solutions:**
1. Change PORT in `.env` file
2. Kill the process using port 3001:
   ```bash
   # On Windows:
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # On Linux/Mac:
   lsof -ti:3001 | xargs kill
   ```

### Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solutions:**
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Check Node.js version: `node --version` (should be v18+)

### AI Service Not Responding

**Error:** `AI service error: connect ECONNREFUSED`

**Solutions:**
1. Make sure AI service is running on port 5000
2. Check `AI_SERVICE_URL` in `.env`
3. Test AI service: `curl http://localhost:5000/health`

## API Endpoints

Once the server is running, you can test these endpoints:

- **Health Check:** GET http://localhost:3001/health
- **Register:** POST http://localhost:3001/api/auth/register
- **Login:** POST http://localhost:3001/api/auth/login

## Project Structure

```
backend/
├── controllers/      # Business logic handlers
├── routes/          # API route definitions
├── db/              # Database connection
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env            # Environment variables (create this)
```

