# Hackathon Platform – Backend

REST API for the Hackathon Platform: user accounts, JWT login, profiles and hackathon listings.

## Tech stack
Node.js, Express 5, MongoDB + Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `dotenv`, `cors`, Nodemon (dev).

## Folder structure
```
src/
├── config/db.js            MongoDB connection
├── routes/                 URL -> controller mapping
├── controllers/            HTTP request/response handling
├── services/               Business logic
├── models/                 Mongoose schemas (User, Hackathon)
├── middleware/             Auth (JWT), 404 and error handling
├── utils/generateToken.js  JWT helper
├── app.js                  Express app (middleware + routes)
└── server.js               Loads env, connects to DB, starts server
```
Flow: Routes → Controllers → Services → Models → Database.

## Installation
```bash
cd backend
npm install
cp .env.example .env   # then fill in the values
npm run dev            # development (Nodemon)
npm start              # production
```

## Environment variables
| Name | Description |
|------|-------------|
| `PORT` | Port the API listens on (default 5000) |
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Long random string used to sign tokens |
| `FRONTEND_URL` | Frontend origin allowed by CORS (Vite: `http://localhost:5173`) |

## API endpoints
All responses look like `{ "success": true|false, "message": "...", "data": ... }`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | – | Health check |
| POST | `/api/auth/register` | – | Body: `name`, `email`, `password` |
| POST | `/api/auth/login` | – | Body: `email`, `password` |
| GET | `/api/users/profile` | Yes | Current user's profile |
| PUT | `/api/users/profile` | Yes | Update `name`, `profileImage`, `skills` |
| GET | `/api/hackathons` | – | List. Query: `search`, `domain`, `mode`, `skill`, `sort` (`deadline` or `newest`) |
| GET | `/api/hackathons/:id` | – | Hackathon details |
| POST | `/api/hackathons` | Yes | Create a hackathon |

Hackathon fields: `title`, `description`, `organizer`, `domain`, `location`, `mode` (`Online` / `In-Person` / `Hybrid`), `startDate`, `endDate`, `registrationDeadline`, `registrationLink`, `image`, `skills`, `prize`, `participantCount`.

## How authentication works
1. `register` / `login` return `{ token, user }`. Passwords are hashed with bcrypt and never returned.
2. The frontend stores the token and sends `Authorization: Bearer <token>` on protected requests.
3. `authMiddleware` verifies the token, loads the user and attaches it to `req.user`. New users always get the `student` role.

## Connecting the frontend
The frontend's only network layer is `frontend/src/services/api.js` and `auth.js` (currently mock data). Point them at `http://localhost:5000/api` (e.g. through `VITE_API_BASE_URL`) and replace the mock functions with `fetch` calls to the endpoints above.
