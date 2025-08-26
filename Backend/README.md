# Web3 Authentication Backend

A Node.js backend with MongoDB integration for user authentication and transaction management.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- MongoDB integration with Mongoose
- Protected routes for transactions
- CORS enabled for frontend integration
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB running locally on port 27017
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Option 1: Run the setup script (recommended)
node setup-env.js

# Option 2: Manually copy env.sample to .env
cp env.sample .env
```

3. **IMPORTANT**: Update the `.env` file with your own values:
   - Change `JWT_SECRET` to a strong, unique secret key
   - Modify `MONGODB_URI` if using a different database
   - Adjust `PORT` if needed

4. Make sure MongoDB is running on your local machine:
```bash
# Start MongoDB (if not running as a service)
mongod
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Environment Configuration

### Required Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/web3_auth` |
| `JWT_SECRET` | Secret key for JWT tokens | **Required** - No default |
| `PORT` | Server port | `3000` |

### Optional Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NODE_ENV` | Environment mode | `development` |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` |

### Example `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/web3_auth
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=86400
```

## API Endpoints

### Authentication

#### POST `/api/v1/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "walletAddress": "optional_wallet_address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "walletAddress": "optional_wallet_address"
  }
}
```

#### POST `/api/v1/auth/signin`
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "walletAddress": "optional_wallet_address"
  }
}
```

### Protected Routes

#### POST `/api/v1/txn/sign`
Sign a transaction (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### GET `/api/v1/txn`
Get transaction information (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Health Check

#### GET `/api/v1/health`
Check server status.

## Database Schema

### User Model
- `username`: Unique username (min 3 characters)
- `email`: Unique email address
- `password`: Hashed password (min 6 characters)
- `walletAddress`: Optional wallet address
- `createdAt`: Timestamp of account creation

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 24 hours (configurable)
- Protected routes require valid JWT tokens
- Input validation and sanitization
- Environment-based configuration for sensitive data

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

## Testing the API

You can test the endpoints using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

### Example cURL commands:

**Signup:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Signin:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Protected Route:**
```bash
curl -X GET http://localhost:3000/api/v1/txn \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running: `brew services list | grep mongodb`
   - Check connection string in `.env` file
   - Verify MongoDB port (default: 27017)

2. **JWT Token Invalid**
   - Check if `JWT_SECRET` is set in `.env`
   - Ensure token hasn't expired
   - Verify token format: `Bearer <token>`

3. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill process using the port: `lsof -ti:3000 | xargs kill -9`

### Environment Setup Issues

If you encounter issues with environment variables:

1. Run the setup script: `node setup-env.js`
2. Verify `.env` file exists in the Backend directory
3. Check file permissions
4. Restart the server after making changes 