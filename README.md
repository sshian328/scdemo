# SCdemo
##  **Tech stack**
- **TypeScript** – Strongly typed language for scalable
- **PostgreSQL** – Relational database
- **Fastify** – High-performance, Unopinionated Node.js framework
- **Prisma** – Modern ORM for database modeling
- **Swagger** – Auto-generated API documentation

## Project Setup & Installation

### 1️⃣ **Clone the Repository**
```sh
git clone git@github.com:sshian328/scdemo.git
cd scdemo
```

### 2️⃣ **Install Dependencies**
```sh
npm install
```

### 3️⃣ **Setup Environment Variables**
Create a `.env` file in the root directory:
```sh
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/YOUR_DB"
```

### 4️⃣ **Prisma Setup**
```sh
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

### 5️⃣ **Start the Server**
```sh
npm run dev
```
_Server will run on `http://localhost:3000`._
_API doc on `http://localhost:3000/docs`._

### 6️⃣ **Start the Server on Production**
```sh
npm run build
npm run start
```

## 📂 **Project Structure**
```
SCDEMO2025/
│── prisma/                     # Prisma database configuration
│   ├── migrations/             # Database migrations
│   ├── schema.prisma           # Prisma schema
│── modules/                
│   ├── order                   # Order module - handles all order-related logic
│   │   ├── orderRoutes.ts      # Defines Fastify routes
│   │   ├── orderControllers.ts # Handles request/response logic
│   │   ├── orderService.ts     # Contains core business logic
│   │   ├── orderModel.ts       # Data access layer using Prisma
│   ├── inventory 
│   │   ├── inventoryModel.ts       
│   ├── device 
│   │   ├── deviceModel.ts      
│── config/                
│   ├── swagger.ts  
│   ├── constants.ts     
│── .env                        # Environment variables
│── server.ts                   # Fastify server setup
│── tsconfig.json               # TypeScript configuration
│── package.json                # Project dependencies
│── .gitignore                  # Files to ignore in Git
```

## **Available Commands**
| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the project for production |
| `npx prisma studio` | Open Prisma database UI |
| `npx prisma migrate dev --name init` | Run database migrations |
| `npm run reset` | Reset database |
| `npm run test` | Run unit test |

## **Future Enhancement**
- Support multiple device
- Inventory API for visibility
- Support cancel order API
- Add user roles (e.g., admin, sales rep) to control access to order/inventory APIs.
- Add pagination and filtering for get order API
- Timestamp and sorting for get order API
- Integrate Splunk or New Relic for monitoring
- Allow users to type in a location instead of coordinates** *(frontend task)*
- More test coverage 
- CI/CD pipeline to cloud: Docker + AWS ECS Fargate + AWS RDS + Github Actions + Route53
- Secure API, JWT, HTTPS

## **Design trade-off**
- Device table lookup vs hard coded
- Code structure, layered structure(routes/conroller/model) vs modular structure
- Save invalid order