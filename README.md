# Sweet Shop Management System

A full-stack web application for managing a sweet shop inventory, built with Node.js/TypeScript, React, and PostgreSQL (Vercel DB). This project demonstrates Test-Driven Development (TDD), clean coding practices, and modern development workflows.

**Repository**: [GitHub](https://github.com/tusharrr017-arch/sweet-shop-management)

## Features

### Backend API
- **User Authentication**: JWT-based authentication with registration and login
- **Sweets Management**: Full CRUD operations for managing sweets
- **Inventory Management**: Purchase and restock functionality
- **Search & Filter**: Search sweets by name, category, and price range
- **Role-Based Access**: Admin and regular user roles with appropriate permissions

### Frontend Application
- **Modern UI**: Beautiful, responsive design built with Ant Design
- **User Dashboard**: View all available sweets with real-time updates
- **Search & Filter**: Advanced search functionality with multiple filters
- **Purchase System**: One-click purchase with stock validation
- **Admin Panel**: Full management interface for admins (add, edit, delete, restock)
- **Pagination**: Efficient pagination with 8 items per page
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Vercel DB)
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest with Supertest
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Library**: Ant Design
- **Icons**: Ant Design Icons

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

**Database:**
- **PostgreSQL** (Vercel DB): Required. The application uses PostgreSQL for all database operations.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project_01
```

### 2. Database Setup

**Using Vercel DB (Recommended for Production)**

1. Create a PostgreSQL database in Vercel:
   - Go to your Vercel project dashboard
   - Navigate to the "Storage" tab
   - Click "Create Database" and select "Postgres"
   - Follow the setup wizard to create your database

2. Get your connection string:
   - In Vercel, go to your database settings
   - Copy the `POSTGRES_URL` connection string
   - This will be used as your `DATABASE_URL`

3. Run the database migration:
```bash
cd backend
# Using psql with your Vercel DB connection string
psql $DATABASE_URL -f migrations/001_initial_schema.sql

# Or if you have the connection string directly:
psql "postgresql://user:password@host:port/database" -f migrations/001_initial_schema.sql
```

**For Local Development (PostgreSQL)**

1. Install PostgreSQL locally if you haven't already

2. Create a local PostgreSQL database:
```bash
createdb sweet_shop_db
```

3. Run the database migration:
```bash
cd backend
psql -d sweet_shop_db -f migrations/001_initial_schema.sql
```

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
```

   **For Vercel DB**: Use the `POSTGRES_URL` from your Vercel dashboard as the `DATABASE_URL`
   
   **For Local Development**: Use your local PostgreSQL connection string

5. Seed the database with default admin user:
```bash
npm run seed
```

   **Optional**: To seed sample sweets data, set `SEED_SAMPLE_DATA=true` in your `.env` file before running the seed command:
```env
SEED_SAMPLE_DATA=true
```

6. Start the backend server:
```bash
npm run dev
```

The backend API will be running on `http://localhost:3001`

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will be running on `http://localhost:5173` (Vite default port)

### 5. Running Tests

#### Backend Tests
```bash
cd backend
npm test
```

To run tests with coverage:
```bash
npm run test:coverage
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "token": "...", "user": { "id": 1, "email": "...", "role": "user" } }`

- `POST /api/auth/login` - Login and get JWT token
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "token": "...", "user": { "id": 1, "email": "...", "role": "user" } }`

### Sweets (Protected - Requires Authentication)
- `POST /api/sweets` - Create a new sweet (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "Chocolate Bar", "category": "Chocolate", "price": 2.50, "quantity": 100 }`

- `GET /api/sweets` - Get all sweets
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "sweets": [...] }`

- `GET /api/sweets/search?name=&category=&minPrice=&maxPrice=` - Search sweets
  - Headers: `Authorization: Bearer <token>`
  - Query params: `name`, `category`, `minPrice`, `maxPrice`

- `PUT /api/sweets/:id` - Update a sweet (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "Updated Name", "price": 3.00 }`

- `DELETE /api/sweets/:id` - Delete a sweet (Admin only)
  - Headers: `Authorization: Bearer <token>`

### Inventory (Protected - Requires Authentication)
- `POST /api/sweets/:id/purchase` - Purchase a sweet (decreases quantity)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "quantity": 1 }` (optional, defaults to 1)

- `POST /api/sweets/:id/restock` - Restock a sweet (Admin only, increases quantity)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "quantity": 50 }`

## Project Structure

```
project_01/
├── api/
│   └── index.ts                 # Vercel serverless function entry point
├── backend/
│   ├── src/
│   │   ├── __tests__/          # Test files
│   │   ├── config/             # Database configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth middleware
│   │   ├── routes/             # API routes
│   │   ├── types/              # TypeScript types
│   │   └── index.ts            # Entry point
│   ├── migrations/             # Database migrations
│   ├── scripts/                # Utility scripts (seed, make-admin, etc.)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React context (Auth)
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── vercel.json                  # Vercel deployment configuration
└── README.md
```

## Usage

1. **Login**: Use the default admin credentials (see below) or register a new account
2. **Browse Sweets**: View all available sweets on the dashboard
3. **Search**: Use the search bar to filter sweets by name, category, or price
4. **Purchase**: Click the "Purchase" button to buy a sweet (decreases stock)
5. **Admin Features**: As an admin, you can:
   - Add new sweets
   - Edit existing sweets
   - Delete sweets
   - Restock inventory

### Default Admin Credentials

For testing and review purposes, a default admin user is automatically created when you run the seed script:

```
Email: admin@sweetshop.com
Password: admin123
Role: admin
```

**To create the admin user and sample data:**
```bash
cd backend
npm run seed
```

### Creating Additional Admin Users

To create additional admin users, you can use the make-admin script:
```bash
cd backend
# Edit scripts/make-admin.ts to set your email
npx ts-node scripts/make-admin.ts
```

## Screenshots

### Login Page
The login page features a clean, modern design with the application logo and a simple email/password form.

### Dashboard
The main dashboard displays all available sweets in a responsive grid layout. Users can search, filter, and purchase sweets. Admins have additional options to add, edit, delete, and restock items.

### Admin Features
Admin users can access the full management interface from the header, including:
- Add new sweets with name, category, price, and initial quantity
- Edit existing sweet details
- Delete sweets from inventory
- Restock items to increase quantity

### Responsive Design
The application is fully responsive and works seamlessly on:
- Desktop (full sidebar and header layout)
- Tablet (hamburger menu with drawer)
- Mobile (optimized touch interface)

*Note: Add your actual screenshots here by placing image files in a `screenshots/` directory and referencing them.*

## Testing

The project follows Test-Driven Development (TDD) principles. Tests are written before implementation to ensure code quality and reliability.

### Backend Test Coverage
- Authentication endpoints (register, login)
- Sweets CRUD operations
- Search functionality
- Purchase and restock operations
- Authorization and role-based access control

### Running Tests

**Backend:**
```bash
cd backend
npm test
npm run test:coverage
```

**Frontend:**
```bash
cd frontend
npm test
```

### Test Report

To generate a test coverage report:

```bash
cd backend
npm run test:coverage
```

The coverage report will be generated in the `backend/coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view the detailed coverage report.

**Expected Coverage:**
- Authentication: ~90%+
- Sweets CRUD: ~85%+
- Search: ~80%+
- Overall: ~85%+

*Note: Include your actual test coverage report here or link to the coverage report file.*

## Deployment

This application can be deployed to Vercel (recommended) or other platforms.

### Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Set Environment Variables:**
   - `JWT_SECRET`: Your JWT secret key
   - `JWT_EXPIRES_IN`: Token expiration (e.g., "24h")
   - `DATABASE_URL`: PostgreSQL connection string (required)

4. **Configure Database:**
   - Use a PostgreSQL database (Supabase, Neon, or Vercel Postgres)
   - Run migrations on your production database
   - Seed initial data if needed

### Live Application

After deployment, your application will be available at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-project.vercel.app/api`

**Note**: The application requires PostgreSQL. Vercel Postgres is recommended for seamless integration, but you can also use Supabase, Neon, or any other PostgreSQL database.

## My AI Usage

### AI Tools Used
I used **Cursor AI** (powered by Claude) extensively throughout the development of this project.

### How AI Was Used

1. **Project Structure & Boilerplate**
   - Used AI to generate the initial project structure for both backend and frontend
   - Generated TypeScript configuration files (tsconfig.json, vite.config.ts)
   - Created package.json files with appropriate dependencies

2. **Backend Development**
   - **API Endpoints**: AI assisted in generating the initial structure for Express routes, controllers, and middleware
   - **Database Schema**: Used AI to design and generate the PostgreSQL schema with proper constraints and indexes
   - **Authentication Logic**: AI helped implement JWT authentication flow, password hashing with bcrypt, and middleware for route protection
   - **Error Handling**: AI suggested patterns for consistent error handling across controllers
   - **Database Setup**: AI helped set up PostgreSQL database configuration and migrations

3. **Frontend Development**
   - **Component Structure**: AI generated the initial React component structure and routing setup
   - **State Management**: Used AI to implement React Context for authentication state management
   - **API Integration**: AI helped create the API service layer with TypeScript interfaces
   - **UI Components**: AI assisted in implementing Ant Design components and responsive layouts
   - **Pagination**: AI helped implement pagination with localStorage persistence

4. **Testing**
   - **Test Structure**: AI generated the initial test file structure and Jest configuration
   - **Test Cases**: Used AI to brainstorm comprehensive test cases covering edge cases
   - **Mock Data**: AI suggested patterns for test data setup and teardown

5. **Code Quality**
   - **TypeScript Types**: AI helped define proper TypeScript interfaces and types throughout the codebase
   - **Code Review**: Used AI to review code for potential bugs, security issues, and best practices
   - **Documentation**: AI assisted in generating comprehensive README documentation
   
## Test Report

### Backend Test Coverage

To generate the test coverage report, run:
cd backend
npm run test:coverage**Coverage Summary:**

6. **Deployment**
   - **Vercel Configuration**: AI helped set up Vercel configuration for monorepo deployment
   - **Serverless Functions**: AI assisted in creating the serverless function entry point

### Reflection on AI Impact

**Positive Impacts:**
- **Speed**: Significantly accelerated development by generating boilerplate code and common patterns
- **Best Practices**: AI suggested modern patterns and best practices I might have overlooked
- **Consistency**: Helped maintain consistent code style and structure across the project
- **Learning**: Exposed me to new patterns and approaches I can apply in future projects
- **Problem Solving**: AI helped debug complex issues like database compatibility and parameter handling

**Challenges & Learnings:**
- **Over-reliance**: Had to be careful not to blindly accept AI suggestions without understanding them
- **Context Management**: Sometimes needed to provide more context for better AI suggestions
- **Debugging**: AI-generated code still required thorough testing and debugging
- **Customization**: Often needed to modify AI suggestions to fit specific project requirements

**Responsible Usage:**
- Reviewed all AI-generated code before committing
- Tested thoroughly to ensure functionality
- Understood the code before using it
- Made customizations based on project needs
- Used AI as a tool to augment, not replace, my development skills

**Conclusion:**
AI was an invaluable tool that significantly enhanced my productivity while building this project. It helped me focus on solving business logic problems rather than writing boilerplate code. However, I ensured that I understood every piece of code and maintained full ownership of the final implementation.

## Future Enhancements

- [ ] Add order history for users
- [ ] Implement shopping cart functionality
- [ ] Add image uploads for sweets
- [ ] Add email notifications
- [ ] Implement rate limiting for API endpoints
- [ ] Add comprehensive logging
- [ ] Add analytics dashboard for admins

## License

This project is created for educational purposes as part of a TDD Kata exercise.

## Author

Developed as part of a Test-Driven Development exercise, with AI assistance as documented above.
