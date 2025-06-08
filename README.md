# Wine Inventory Management System

A full-stack web application for managing wine products and ingredients with import/export functionality.

## Features

- **Product Management**: Create, edit, delete wine products with detailed information
- **Ingredient Management**: Manage ingredients with allergen tracking
- **Image Upload**: Upload and manage product images
- **Excel Import/Export**: Bulk import/export products and ingredients via Excel files
- **Authentication**: User login and registration system
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **File Upload**: Multer for image handling
- **Excel Processing**: XLSX library for import/export

## Local Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wine-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a PostgreSQL database named `wine_inventory`
   - Update the `DATABASE_URL` in `.env` file with your database credentials

4. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your local settings:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/wine_inventory
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   BASE_URL=http://localhost:5000
   ```

5. **Database Migration**
   ```bash
   npm run db:push
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── lib/          # Utilities and configurations
│   │   └── hooks/        # Custom React hooks
├── server/               # Backend Express application
│   ├── auth.ts          # Authentication logic
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema definitions
└── uploads/             # File upload directory
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/confirm-email` - Email confirmation

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/image` - Upload product image
- `DELETE /api/products/:id/image` - Delete product image
- `GET /api/products/export` - Export products to Excel
- `POST /api/products/import` - Import products from Excel

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/:id` - Get single ingredient
- `POST /api/ingredients` - Create new ingredient
- `PUT /api/ingredients/:id` - Update ingredient
- `DELETE /api/ingredients/:id` - Delete ingredient
- `GET /api/ingredients/export` - Export ingredients to Excel
- `POST /api/ingredients/import` - Import ingredients from Excel

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `brand` - Brand name (optional)
- `netVolume` - Volume information
- `vintage` - Wine vintage year
- `wineType` - Type of wine
- `sugarContent` - Sugar content level
- `appellation` - Wine appellation
- `sku` - Stock keeping unit
- `imageUrl` - Product image path

### Ingredients Table
- `id` - Primary key
- `name` - Ingredient name
- `category` - Ingredient category
- `eNumber` - E-number identifier
- `allergens` - Array of allergens
- `details` - Additional details

### Users Table
- `id` - Primary key
- `username` - User's username
- `email` - User's email
- `password` - Hashed password
- `isEmailConfirmed` - Email confirmation status
- `emailConfirmationToken` - Email confirmation token

## Import/Export Format

### Products Excel Format
Required columns:
- `Name` - Product name
- `Net Volume` - Volume information
- `Vintage` - Vintage year
- `Type` - Wine type
- `Sugar Content` - Sugar content
- `Appellation` - Appellation
- `SKU` - Stock keeping unit

### Ingredients Excel Format
Required columns:
- `Name` - Ingredient name
- `Category` - Category
- `E Number` - E-number
- `Allergens` - Comma-separated allergens
- `Details` - Additional details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.