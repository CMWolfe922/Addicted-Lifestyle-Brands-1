# NFT Streetwear Marketplace - Ripple Blockchain

## Overview

This is a full-stack web application for an NFT-backed streetwear T-shirt marketplace built on the Ripple blockchain network. The platform allows users to purchase physical T-shirts that come with blockchain-verified NFT barcodes, providing proof of authenticity and ownership. Each product features a unique barcode ID that gets minted as an NFT on the Ripple network upon purchase.

The application combines traditional e-commerce functionality with Web3 blockchain technology, creating a hybrid marketplace where physical products are tied to digital assets for verification and ownership tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing
- React Query (TanStack Query) for server state management and API data fetching

**UI/UX Design System:**
- Tailwind CSS for utility-first styling with custom design tokens
- Shadcn/ui component library (New York variant) for consistent, accessible UI components
- Radix UI primitives as the foundation for complex interactive components
- Dark mode as the default theme with light mode support via ThemeProvider
- Custom color palette focused on dark backgrounds (222 15% 8%) with Ripple blue (210 100% 60%) as primary brand color
- Typography: Inter for UI, Space Grotesk for display/headers, JetBrains Mono for blockchain addresses

**State Management:**
- React Query for API state with aggressive caching (staleTime: Infinity)
- React Context for theme management
- Local component state for UI interactions
- Form state managed via React Hook Form with Zod validation

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for the REST API
- ESM (ES Modules) throughout the codebase for modern JavaScript
- Custom middleware for request logging and error handling
- Development/production environment separation

**API Design:**
- RESTful endpoints for products, NFTs, and transactions
- File upload handling via Multer (in-memory storage)
- JSON request/response format with Zod schema validation
- Error responses with appropriate HTTP status codes

**Database Layer:**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the primary database (configured for Neon serverless)
- Schema definitions in TypeScript with automatic type inference
- Three main tables: products, nfts, transactions

**Storage Strategy:**
- Dual storage implementation: MemStorage (in-memory) for development/testing
- Interface-based design (IStorage) allowing easy swap to database implementation
- UUID-based primary keys for all entities
- Timestamps for audit trails

### Blockchain Integration

**Ripple/XRPL Integration:**
- xrpl.js library for direct blockchain interaction
- RippleService class encapsulating all blockchain operations
- Connected to Ripple Testnet (wss://s.altnet.rippletest.net:51233) for development
- NFTokenMint transaction type for creating NFTs with barcode metadata
- Wallet management for automated NFT minting
- Transaction hash tracking for blockchain verification

**NFT Workflow:**
1. Product created with unique barcodeId
2. On purchase, NFT minting initiated with product metadata
3. NFT tokenId and transaction hash stored in database
4. NFT ownership transferred to buyer's wallet address
5. Status tracking: available → pending → minted

### Data Schema

**Products Table:**
- Unique barcode ID for each product
- Price stored as numeric(10,2) for precision
- Image URL for product photos
- NFT status field (available/pending/minted)
- Foreign key relationships to NFTs

**NFTs Table:**
- Links to product via productId
- Stores blockchain tokenId and transactionHash
- Tracks owner wallet address
- Minting timestamp and status

**Transactions Table:**
- Records all purchase attempts
- Links to both product and NFT
- Buyer wallet address tracking
- Amount and transaction status
- Created timestamp for order history

### Development Workflow

**Code Organization:**
- Monorepo structure with shared types between client/server
- Path aliases (@/, @shared/, @assets/) for clean imports
- Separate client and server directories with shared schema
- Component examples directory for UI documentation

**Build Pipeline:**
- Vite builds client to dist/public
- esbuild bundles server to dist/index.js
- TypeScript compilation checking without emit
- Drizzle Kit for database migrations

**Development Tools:**
- Replit-specific plugins for cartographer and dev banner
- Runtime error overlay for better debugging
- Strict TypeScript configuration
- Source maps for debugging

## External Dependencies

### Blockchain Services
- **Ripple/XRPL Network**: Testnet for development, requires migration to mainnet for production
- **xrpl.js Library**: Official JavaScript/TypeScript library for Ripple blockchain interaction

### Database & Storage
- **Neon Serverless PostgreSQL**: Configured via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and migrations

### UI Component Libraries
- **Radix UI**: 20+ primitive components for accessible, unstyled UI building blocks
- **Shadcn/ui**: Pre-built component implementations using Radix primitives
- **Lucide React**: Icon library for consistent iconography

### Development Services
- **Google Fonts**: Inter, Space Grotesk, and JetBrains Mono typography
- **JsBarcode**: Client-side barcode generation on canvas elements

### File Processing
- **Multer**: Multipart form data handling for image uploads
- **In-memory Storage**: Current implementation stores uploads in memory (requires cloud storage solution for production)

### Session Management
- **connect-pg-simple**: PostgreSQL session store (configured but session implementation may need completion)

### Form & Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Note on Production Readiness
The application currently uses:
- Ripple Testnet (needs mainnet configuration)
- In-memory file storage (needs cloud storage like S3/Cloudinary)
- Basic wallet management (needs proper key management service)
- MemStorage fallback (database implementation ready but may need activation)