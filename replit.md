# Trade Confirmation System

## Overview

This is a comprehensive trade confirmation and lifecycle management system built for financial institutions. The application provides a full-stack solution for managing equity and FX trades, tracking workflows, analyzing failures, and handling document management throughout the trade lifecycle.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React hooks and local state
- **Data Visualization**: Recharts for analytics dashboards
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (fully integrated with 399 trades migrated, reduced from 500 to 400 as requested)
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development**: Hot reload with Vite middleware integration
- **Data Storage**: Database-backed storage replaced in-memory storage

### Project Structure
- **Client**: React frontend located in `/client/` directory
- **Server**: Express backend located in `/server/` directory  
- **Shared**: Common types and schemas in `/shared/` directory
- **Monorepo**: Single package.json managing both frontend and backend

## Key Components

### Trade Management
- **Trade Types**: Supports both Equity and FX trades with distinct schemas
- **Status Tracking**: Comprehensive status management (Confirmed, Pending, Failed, Settled, Disputed, Cancelled, Booked)
- **Filtering**: Advanced filtering by trade type, status, counterparty, dates, currency, trader, risk level
- **Data Import**: CSV parsing and generic data conversion utilities

### Workflow System
- **Workflow Steps**: Predefined workflow stages from trade booking to execution complete
- **Step Tracking**: Real-time status updates (pending, in-progress, completed, failed, requires-action)
- **Action Management**: Workflow actions with due dates and assignees
- **Priority Management**: Workflow prioritization (low, medium, high, urgent)

### Analytics & Reporting
- **Dashboard**: Real-time trade statistics and KPIs
- **Visualizations**: Charts for status distribution, volume trends, and failure analysis
- **Enhanced Analytics**: Multi-dimensional data analysis with drill-down capabilities
- **Failure Analysis**: Automated failure detection and resolution tracking

### Document Management
- **Document Types**: Trade confirmations, client agreements, risk disclosures, compliance checklists
- **Status Tracking**: Document submission, client signatures, bank signatures
- **Template Management**: Configurable document templates and fields
- **Integration**: Cloud storage connectivity (OneDrive simulation)
- **Enhanced Trade Confirmations**: All trade details from Excel files now included in confirmations (Order ID, Client ID, Trading Venue, Country of Trade, Operations Notes for equity trades; Trader ID, Product Type, Confirmation Method, Amendment Flag, Value Date, Maturity Date, Confirmation Timestamp for FX trades)

## Data Flow

### Trade Lifecycle
1. **Trade Booking**: Initial trade entry and validation
2. **Confirmation System**: Automated confirmation generation
3. **Client Interaction**: Affirmation and document signing
4. **Workflow Processing**: Multi-step approval and validation
5. **Settlement**: Final trade settlement and completion

### Data Processing
1. **Database Migration**: Successfully migrated 200 equity trades and 199 FX trades from CSV files
2. **Data Transformation**: Convert CSV data to typed database objects with Drizzle ORM
3. **Validation**: Schema validation using Zod with database constraints
4. **Storage**: PostgreSQL database with Drizzle ORM for full data persistence
5. **Real-time Updates**: Live status updates across the system via database

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL (active with 399 trades)
- **Drizzle ORM**: Type-safe database operations with migration support
- **Connection**: Environment-based DATABASE_URL configuration
- **Data Migration**: Complete CSV-to-database migration with data validation

### UI Components
- **Shadcn/UI**: Modern component library with accessibility
- **Radix UI**: Primitive components for complex interactions
- **Lucide Icons**: Comprehensive icon library
- **Recharts**: Data visualization and charting

### Development Tools
- **Vite**: Fast build tool with HMR
- **ESBuild**: Production bundling for server code
- **TypeScript**: Full type safety across the stack
- **Tailwind CSS**: Utility-first styling with custom design system

### Authentication & Security
- **Session Management**: PostgreSQL-backed sessions
- **Type Safety**: End-to-end TypeScript for data integrity
- **Input Validation**: Zod schemas for runtime validation

## Deployment Strategy

### Development
- **Command**: `npm run dev` starts development server with hot reload
- **Port**: Express server with Vite middleware integration
- **Database**: Development database with push migrations (`npm run db:push`)

### Production
- **Build**: `npm run build` creates optimized client bundle and server code
- **Server**: `npm start` runs production server from `/dist/index.js`
- **Assets**: Static files served from `/dist/public/`
- **Database**: Production PostgreSQL with automated migrations

### Environment Configuration
- **DATABASE_URL**: Required environment variable for PostgreSQL connection
- **NODE_ENV**: Environment detection (development/production)
- **REPL_ID**: Replit-specific configuration for development features

The system is designed as a comprehensive trade management platform with scalable architecture, real-time updates, and extensive customization capabilities for financial institutions.