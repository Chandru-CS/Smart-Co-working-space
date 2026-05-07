# 🏢 CoWork Platform
### Smart Co-Working Space Management Using Real-Time Monitoring

A full-stack web application for discovering, comparing, and booking co-working spaces with real-time availability tracking and role-based dashboards.

---

## 📁 Folder Structure

```
cowork-platform/
│
├── backend/                        # Node.js + Express API
│   ├── models/
│   │   ├── User.js                 # User schema (user / owner / admin)
│   │   ├── Space.js                # Co-working space schema
│   │   ├── Booking.js              # Booking schema with status lifecycle
│   │   └── Amenity.js              # Amenity + Inquiry schemas
│   │
│   ├── routes/
│   │   ├── authRoutes.js           # Register, login, profile
│   │   ├── spaceRoutes.js          # CRUD + smart search + reviews
│   │   ├── bookingRoutes.js        # Booking lifecycle management
│   │   ├── amenityRoutes.js        # Amenity CRUD
│   │   ├── adminRoutes.js          # Admin: stats, user/space management
│   │   └── userRoutes.js           # Notifications
│   │
│   ├── middleware/
│   │   └── auth.js                 # JWT protect + role-based authorize
│   │
│   ├── utils/
│   │   └── seed.js                 # Database seed script
│   │
│   ├── .env.example                # Environment variables template
│   ├── package.json
│   └── server.js                   # Express app + Socket.IO + MongoDB
│
└── frontend/                       # React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/
    │   │   ├── shared/
    │   │   │   ├── Navbar.jsx       # Responsive navbar with auth state
    │   │   │   ├── Footer.jsx       # Site footer
    │   │   │   └── Spinner.jsx      # Loading indicators
    │   │   ├── spaces/
    │   │   │   ├── SpaceCard.jsx    # Space listing card
    │   │   │   └── SearchFilters.jsx # Smart search + advanced filters
    │   │   └── booking/
    │   │       └── BookingStatusBadge.jsx
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx      # Global auth state
    │   │
    │   ├── pages/
    │   │   ├── HomePage.jsx         # Hero + featured + popular spaces
    │   │   ├── SpacesPage.jsx       # Browse + filter all spaces
    │   │   ├── SpaceDetailPage.jsx  # Full space info + real-time socket
    │   │   ├── BookingPage.jsx      # Booking form with price calc
    │   │   ├── LoginPage.jsx        # Sign in with demo accounts
    │   │   ├── RegisterPage.jsx     # Role-based registration
    │   │   ├── UserDashboard.jsx    # My bookings + notifications
    │   │   ├── OwnerDashboard.jsx   # Manage spaces + approve bookings
    │   │   ├── AdminDashboard.jsx   # Platform stats + user/space mgmt
    │   │   └── NotFoundPage.jsx     # 404
    │   │
    │   ├── utils/
    │   │   └── api.js               # Axios instance with JWT interceptor
    │   │
    │   ├── App.jsx                  # Router + route guards
    │   ├── main.jsx                 # React entry point
    │   └── index.css                # Tailwind + custom component classes
    │
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local or Atlas) → https://www.mongodb.com
- **npm** or **yarn**
- **Git**

---

## ⚙️ Step-by-Step Setup

### Step 1 — Clone / Download the Project

```bash
# If using git
git clone <repo-url>
cd cowork-platform

# Or extract the downloaded ZIP
```

---

### Step 2 — Set Up the Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Now edit `.env` and set your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cowork_platform
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

> **Using MongoDB Atlas?** Replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/cowork_platform`

---

### Step 3 — Seed the Database

```bash
# Still inside /backend
node utils/seed.js
```

This creates:
- 2 space owners, 2 regular users, 1 admin
- 18 amenities
- 6 co-working spaces (Bangalore + Pune)
- 3 sample bookings

**Demo login credentials:**
| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@cowork.com | admin123 |
| Owner | priya@spaces.com | owner123 |
| Owner | rahul@spaces.com | owner123 |
| User  | arjun@example.com | user123 |
| User  | sneha@example.com | user123 |

---

### Step 4 — Start the Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

✅ Server runs at: `http://localhost:5000`
✅ Health check: `http://localhost:5000/api/health`

---

### Step 5 — Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend runs at: `http://localhost:3000`

---

### Step 6 — Open in Browser

Navigate to **http://localhost:3000**

You should see the CoWork homepage with featured spaces loaded from the database.

---

## 🌐 API Reference

All routes are prefixed with `/api`

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login | Public |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/profile` | Update profile | ✅ |

### Spaces
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/spaces` | Smart search + filter | Public |
| GET | `/spaces/featured` | Featured spaces | Public |
| GET | `/spaces/popular` | Most booked spaces | Public |
| GET | `/spaces/:id` | Space details + availability | Public |
| POST | `/spaces` | Create space | Owner/Admin |
| PUT | `/spaces/:id` | Update space | Owner/Admin |
| DELETE | `/spaces/:id` | Delete (soft) space | Owner/Admin |
| POST | `/spaces/:id/review` | Add review | User |
| GET | `/spaces/owner/my-spaces` | Owner's spaces | Owner |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/bookings` | Create booking request | User |
| GET | `/bookings/my` | User's bookings | User |
| GET | `/bookings/owner` | Owner's received bookings | Owner |
| GET | `/bookings/:id` | Booking details | User/Owner |
| PUT | `/bookings/:id/status` | Approve/reject | Owner/Admin |
| PUT | `/bookings/:id/cancel` | Cancel booking | User |

### Amenities
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/amenities` | All amenities | Public |
| POST | `/amenities` | Create amenity | Admin |
| DELETE | `/amenities/:id` | Delete amenity | Admin |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Platform statistics | Admin |
| GET | `/admin/users` | All users | Admin |
| PUT | `/admin/users/:id` | Update user (activate/deactivate) | Admin |
| GET | `/admin/spaces` | All spaces | Admin |
| PUT | `/admin/spaces/:id/feature` | Toggle featured | Admin |
| GET | `/admin/bookings` | All bookings | Admin |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/notifications` | User notifications | ✅ |
| PUT | `/users/notifications/read-all` | Mark all as read | ✅ |

---

## 🔍 Search & Filter Parameters

`GET /api/spaces?<params>`

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `search` | string | `Innovation` | Text search on name/city/desc |
| `city` | string | `Bangalore` | Filter by city |
| `type` | string | `private_cabin` | Filter by space type |
| `capacity` | number | `10` | Minimum seating capacity |
| `area` | number | `500` | Minimum area in sq ft |
| `minPrice` | number | `500` | Min daily price |
| `maxPrice` | number | `5000` | Max daily price |
| `amenities` | string | `id1,id2` | Comma-separated amenity IDs |
| `sort` | string | `-rating.average` | Sort field |
| `page` | number | `1` | Pagination |
| `limit` | number | `12` | Results per page |

---

## 🗄️ MongoDB Schemas Summary

### User
```
name, email, password (hashed), role (user|owner|admin),
phone, company, avatar, notifications[], isActive
```

### Space
```
owner (ref: User), name, description, location {address, city, state, coordinates},
type, areaSize {value, unit}, seatingCapacity, pricing {hourly, daily, monthly},
amenities[] (ref: Amenity), images[], availability {isAvailable, openTime, closeTime, workingDays},
rating {average, count}, reviews[], isFeatured, totalBookings, isActive
```

### Booking
```
user (ref: User), space (ref: Space), owner (ref: User),
bookingType (hourly|daily|monthly), startDate, endDate,
startTime, endTime, numberOfPersons, totalAmount,
status (pending|approved|rejected|cancelled|completed),
specialRequests, statusNote, paymentStatus
```

### Amenity
```
name, icon (emoji), category (connectivity|facility|comfort|security|food|transport|other)
```

---

## ⚡ Real-Time Features (Socket.IO)

The backend emits and listens to these Socket.IO events:

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_space` | Client → Server | Subscribe to a space's updates |
| `availability_update` | Server → Client | Space availability changed |
| `new_booking` | Server → Client | New booking created for space |
| `booking_update_{userId}` | Server → Client | Booking status changed for user |

**Frontend usage (SpaceDetailPage.jsx):**
```js
const socket = io('http://localhost:5000');
socket.emit('join_space', spaceId);
socket.on('availability_update', ({ isAvailable }) => { /* update UI */ });
```

---

## 🎨 UI Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Hero, stats, featured & popular spaces |
| Browse Spaces | `/spaces` | Smart search, filters, paginated grid |
| Space Detail | `/spaces/:id` | Full info, images, amenities, live status |
| Booking | `/book/:spaceId` | Booking form with live price calculation |
| Login | `/login` | Auth with demo accounts |
| Register | `/register` | Role-based signup (user/owner) |
| User Dashboard | `/dashboard` | Bookings, status, notifications |
| Owner Dashboard | `/owner/dashboard` | Manage spaces + approve/reject bookings |
| Admin Dashboard | `/admin/dashboard` | Platform stats, user/space management |

---

## 🔧 Production Build

### Frontend
```bash
cd frontend
npm run build
# Output in /frontend/dist — deploy to Vercel, Netlify, or serve statically
```

### Backend
```bash
# Set NODE_ENV=production in .env
# Deploy to AWS EC2, Railway, Render, or DigitalOcean

# Or use PM2 for process management
npm install -g pm2
pm2 start server.js --name cowork-api
```

### Environment for Production
```env
NODE_ENV=production
MONGODB_URI=<atlas-connection-string>
JWT_SECRET=<cryptographically-random-64-char-string>
CLIENT_URL=https://your-frontend-domain.com
```

---

## 🚀 Future Improvements

### Phase 2 (Recommended)
- [ ] **Payment Gateway** — Razorpay / Stripe integration for online payments
- [ ] **Image Upload** — Multer + Cloudinary for real image hosting
- [ ] **Email Notifications** — Nodemailer for booking confirmation emails
- [ ] **Mobile App** — React Native with shared API

### Phase 3 (Advanced)
- [ ] **AI Recommendations** — Collaborative filtering based on booking history
- [ ] **Dynamic Pricing** — ML model for demand-based price suggestions
- [ ] **Analytics Dashboard** — Recharts for revenue, occupancy, usage trends
- [ ] **Google Maps Integration** — Location-based search radius filter
- [ ] **Review System Enhancement** — Photos, tags, verified reviewer badge
- [ ] **Subscription Plans** — Monthly passes, team accounts, enterprise contracts
- [ ] **Calendar View** — Visual availability calendar per space
- [ ] **Chat System** — In-app messaging between users and owners

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-Time | Socket.IO |
| HTTP Client | Axios (with interceptors) |
| Fonts | Syne (display) + DM Sans (body) |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Date Utils | date-fns |
| Dev Tools | Nodemon, Vite HMR |

---

## 🐛 Troubleshooting

**MongoDB not connecting?**
- Make sure `mongod` is running: `sudo service mongod start`
- Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

**Port already in use?**
- Change `PORT` in `.env` (backend) or `port` in `vite.config.js` (frontend)

**CORS errors?**
- Ensure `CLIENT_URL=http://localhost:3000` is set in backend `.env`

**Socket.IO not connecting?**
- Check that backend URL in `SpaceDetailPage.jsx` matches your backend port

**Seed fails?**
- Ensure MongoDB is running first before running `node utils/seed.js`

---

## 📄 License

MIT License — Free to use for educational and commercial projects.

---

Built with ❤️ for smart workspace management.
