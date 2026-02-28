# 🚀 Meeting Room Booking System

Sistem pemesanan ruangan meeting modern yang dibangun dengan Next.js 16, Drizzle ORM, dan Neon PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-20c997?logo=database)

## 📋 Fitur

- ✅ **Daftar Ruangan** - Lihat semua ruangan meeting yang tersedia
- ✅ **Booking Ruangan** - Pesan ruangan dengan tanggal dan waktu yang dipilih
- ✅ **Anti-Conflict Logic** - Mencegah double booking dengan overlap algorithm
- ✅ **Dashboard Booking** - Lihat semua booking Anda
- ✅ **Admin Panel** - Kelola ruangan dan approve booking requests
- ✅ **Modern UI/UX** - Animasi smooth dengan Framer Motion
- ✅ **Toast Notifications** - Feedback real-time dengan Sonner
- ✅ **Dark Mode Support** - Tema gelap dan terang
- ✅ **Responsive Design** - Tampilan optimal di semua device
- ✅ **Authentication** - Login/Register dengan NextAuth.js
- ✅ **Role-Based Access** - Admin & Employee roles

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS + Shadcn/UI
- **Animations:** Framer Motion
- **Validation:** Zod + React Hook Form
- **Notifications:** Sonner
- **Auth:** NextAuth.js (Auth.js)

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd Meeting\ Room
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy file `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi dengan URL database Neon Anda:

```bash
DATABASE_URL=postgresql://user:password@your-neon-db.neon.tech/meeting-room?sslmode=require
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

> **💡 Tip:** 
> - Dapatkan connection string dari [Neon Dashboard](https://console.neon.tech)
> - Generate NEXTAUTH_SECRET dengan: `openssl rand -base64 32`

### 4. Setup Database

Push schema ke database:

```bash
npm run db:push
```

Atau generate migration files:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed Data (Optional)

Isi database dengan data dummy:

```bash
npm run db:seed
```

Ini akan membuat:
- 2 demo users (admin & employee)
- 5 demo rooms

**Demo Accounts:**
- **Admin:** admin@example.com / admin123
- **User:** user@example.com / user123

### 6. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Folder

```
src/
├── app/                    # App Router (Layouts & Pages)
│   ├── admin/              # Admin pages
│   │   ├── bookings/       # Manage bookings
│   │   ├── rooms/          # Manage rooms
│   │   └── page.tsx        # Admin dashboard
│   ├── api/
│   │   └── auth/           # NextAuth API routes
│   ├── my-bookings/        # User bookings dashboard
│   ├── rooms/
│   │   └── [roomId]/book/  # Booking page
│   ├── login/              # Login page
│   ├── register/           # Register page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # Client providers
├── actions/                # Server Actions
│   ├── createBooking.ts    # Create booking action
│   ├── register.ts         # User registration
│   └── index.ts            # Other actions (CRUD)
├── components/             # React Components
│   ├── ui/                 # UI components (Shadcn)
│   ├── BookingForm.tsx     # Booking form
│   ├── Navigation.tsx      # Navigation bar
│   ├── RoomCard.tsx        # Room card
│   └── RoomsList.tsx       # Rooms list
├── db/                     # Database
│   ├── index.ts            # DB connection
│   └── schema.ts           # Drizzle schema
├── hooks/                  # Custom hooks
│   ├── useShake.ts         # Shake animation hook
│   └── useLoadingState.ts  # Loading state hook
├── lib/                    # Utilities
│   └── utils.ts            # CN utility
└── types/                  # Type definitions
    └── next-auth.d.ts      # NextAuth types
```

## 📊 Database Schema

### Users
```typescript
{
  id: uuid,
  name: text,
  email: text (unique),
  password: text (hashed),
  role: 'admin' | 'employee',
  image: text (optional)
}
```

### Rooms
```typescript
{
  id: uuid,
  name: text,
  capacity: integer,
  location: text (optional),
  imageUrl: text (optional),
  isActive: boolean
}
```

### Bookings
```typescript
{
  id: uuid,
  userId: uuid (FK -> users),
  roomId: uuid (FK -> rooms),
  startTime: timestamp,
  endTime: timestamp,
  purpose: text (optional),
  status: 'pending' | 'confirmed' | 'cancelled'
}
```

## 🔐 Anti-Conflict Logic

Sistem menggunakan overlap algorithm untuk mencegah double booking:

```typescript
// Conflict exists if:
New_Start < Existing_End AND New_End > Existing_Start
```

Implementasi Drizzle Query:
```typescript
const conflict = await db.select().from(bookings).where(
  and(
    eq(bookings.roomId, targetRoomId),
    eq(bookings.status, 'confirmed'),
    lt(bookings.startTime, inputEndTime),
    gt(bookings.endTime, inputStartTime)
  )
);
```

## 🎨 UI/UX Features

- **Staggered Animations** - Entrance animations untuk list items
- **Shake Animation** - Feedback visual saat error (conflict booking)
- **Skeleton Loading** - Loading states yang smooth
- **Toast Notifications** - Real-time feedback dengan Sonner
- **Page Transitions** - Fade in/out transitions
- **Hover Effects** - Interactive card animations
- **Search & Pagination** - Modern search dengan debounce
- **Responsive Tables** - Table view desktop, card view mobile

## 📝 Use Case Scenarios

| Actor | Action | Main Flow | Exception |
|-------|--------|-----------|-----------|
| Employee | Book Room | Select Room → Pick Date/Time → Input Purpose → Submit | Jika konflik, tampilkan "Room occupied" dengan shake animation |
| Employee | View Schedule | Access "My Bookings" dashboard | Empty state dengan animasi jika tidak ada booking |
| Admin | Manage Rooms | Add, Edit, Delete room data via Admin Panel | Tidak bisa delete room dengan active confirmed bookings |
| Admin | Approve/Reject | Review pending bookings dan update status | Auto-reject overlapping pending requests saat salah satu confirmed |

## 🔧 Development Commands

```bash
# Development
npm run dev

# Build production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Database operations
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database (dev only)
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed demo data
```

## 🌐 Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Home - Daftar ruangan | Public |
| `/login` | Login page | Public |
| `/register` | Register page | Public |
| `/rooms/[id]/book` | Booking form | Authenticated |
| `/my-bookings` | Dashboard booking user | Authenticated |
| `/admin` | Admin dashboard | Admin only |
| `/admin/rooms` | Manage rooms | Admin only |
| `/admin/bookings` | Approve/reject bookings | Admin only |

## 🚀 Deployment

### Deploy to Vercel

1. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy ke Vercel:**
   - Buka [Vercel Dashboard](https://vercel.com/dashboard)
   - Klik "Add New Project"
   - Import repository GitHub Anda
   - Setup environment variables:
     - `DATABASE_URL` - Neon PostgreSQL connection string
     - `NEXTAUTH_SECRET` - Random secret key
     - `NEXTAUTH_URL` - Your production URL
   - Klik "Deploy"

3. **Setup Database di Production:**
   ```bash
   # Set environment variables di Vercel
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   
   # Push schema ke production
   vercel --prod
   npm run db:push
   ```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@your-neon-db.neon.tech/meeting-room?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-min-32-characters-long
NEXTAUTH_URL=http://localhost:3000  # Change to production URL in production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate NEXTAUTH_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Or use this online generator
# https://generate-secret.vercel.app/32
```

## 📦 Dependencies

### Production
- `next` - React framework (v16)
- `react`, `react-dom` - UI library (v19)
- `next-auth` - Authentication (v5 beta)
- `drizzle-orm` - TypeScript ORM
- `@neondatabase/serverless` - PostgreSQL driver
- `framer-motion` - Animation library
- `tailwindcss` - CSS framework
- `zod` - Validation
- `react-hook-form` - Form handling
- `sonner` - Toast notifications
- `date-fns` - Date utilities
- `bcryptjs` - Password hashing

### Development
- `typescript` - Type safety
- `drizzle-kit` - Database migrations
- `tailwindcss-animate` - Tailwind animations
- `tsx` - TypeScript execution
- `@types/bcryptjs` - TypeScript types

## 🔒 Security Features

- ✅ **Password Hashing** - bcryptjs dengan salt rounds
- ✅ **Session Management** - JWT-based sessions
- ✅ **Role-Based Access Control** - Admin & Employee roles
- ✅ **Protected Routes** - Authentication required
- ✅ **Environment Variables** - Sensitive data secured
- ✅ **SQL Injection Protection** - Drizzle ORM parameterized queries

## 📱 Responsive Design

- ✅ **Mobile-First** - Optimized for mobile devices
- ✅ **Bottom Navigation** - Easy mobile navigation
- ✅ **Touch-Friendly** - Large tap targets
- ✅ **Adaptive Layout** - Table desktop, card mobile
- ✅ **Scroll Protection** - Content not hidden by nav

## 📄 License

MIT License

## 👨‍💻 Author

Dibuat sebagai bagian dari project Meeting Room Booking System.

---

**Happy Coding! 🎉**
