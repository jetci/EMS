# Emergency Medical Services (EMS) Web Application

A comprehensive web application for managing emergency medical services, built with React frontend and Flask backend.

## Features

### Frontend (React + TypeScript)
- **Multi-role Dashboard**: Different interfaces for Community users, Drivers, Office staff, and Administrators
- **Patient Management**: Register and manage patient information with detailed medical records
- **Ride Booking**: Request and track emergency medical transportation
- **Real-time Updates**: Live status tracking for rides and driver locations
- **News Management**: Public news articles and announcements
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Backend (Flask + SQLAlchemy)
- **RESTful API**: Complete API endpoints for all frontend features
- **JWT Authentication**: Secure token-based authentication with role-based access control
- **Database Management**: SQLAlchemy ORM with SQLite (development) and PostgreSQL (production) support
- **Data Validation**: Comprehensive input validation and error handling
- **Logging**: Built-in logging for monitoring and debugging
- **Docker Support**: Ready for containerized deployment

## User Roles

1. **Community**: Register patients and request rides
2. **Driver**: View assigned jobs, update ride status, manage profile
3. **Office**: Assign drivers to rides, manage all rides and patients
4. **Admin**: Full system access and user management

## Project Structure

```
├── components/          # React components
├── pages/              # React pages/views
├── services/           # API service functions
├── utils/              # Utility functions
├── assets/             # Static assets
├── data/               # Mock data
├── src/                # Backend source code
│   ├── models/         # SQLAlchemy models
│   ├── routes/         # Flask API routes
│   ├── static/         # Frontend build files
│   ├── main.py         # Flask application entry point
│   └── seed_data.py    # Database seeding script
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── requirements.txt    # Python dependencies
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jetci/EMS.git
   cd EMS
   ```

2. **Build and run with Docker:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

### Option 2: Local Development Setup

#### Backend Setup

1. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Seed the database:**
   ```bash
   python src/seed_data.py
   ```

4. **Run the Flask server:**
   ```bash
   python src/main.py
   ```

#### Frontend Setup (for development)

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

## Test Accounts

The following test accounts are available after running the seed script:

| Role      | Email                  | Password |
|-----------|------------------------|----------|
| Community | community1@wecare.dev  | password |
| Driver    | driver1@wecare.dev     | password |
| Office    | office1@wecare.dev     | password |
| Admin     | admin@wecare.dev       | password |

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Community Endpoints
- `GET /api/community/stats` - Get community dashboard stats
- `GET /api/community/patients` - List patients
- `POST /api/community/patients` - Create new patient
- `PUT /api/community/patients/:id` - Update patient
- `DELETE /api/community/patients/:id` - Delete patient
- `GET /api/community/rides` - List rides
- `POST /api/community/rides` - Create ride request

### Driver Endpoints
- `GET /api/driver/jobs` - Get assigned jobs
- `PATCH /api/driver/rides/:id/status` - Update ride status
- `GET /api/driver/history` - Get ride history
- `GET /api/driver/profile` - Get driver profile

### Office Endpoints
- `GET /api/office/stats` - Get office dashboard stats
- `GET /api/office/rides/urgent` - Get urgent rides
- `POST /api/office/rides/:id/assign` - Assign driver to ride
- `GET /api/office/drivers/live-status` - Get live driver status

### News Endpoints
- `GET /api/news/` - Get published news articles
- `GET /api/news/:id` - Get single article
- `GET /api/news/manage` - Get all articles (admin)
- `POST /api/news/manage` - Create article (admin)

For detailed API documentation, see [api_requirements.md](api_requirements.md).

## Database Schema

The application uses the following main entities:

- **Users**: System users with different roles
- **Patients**: Patient information and medical records
- **Rides**: Emergency transportation requests
- **Vehicles**: Fleet management
- **News Articles**: Public announcements

For detailed database schema, see [database_schema.md](database_schema.md).

## Configuration

### Environment Variables

Create a `.env` file for production:

```env
FLASK_ENV=production
SECRET_KEY=your-very-secure-secret-key
DATABASE_URL=postgresql://user:password@host:port/database
```

### Frontend Configuration

The frontend is configured to work with the Flask backend. API endpoints are defined in `services/` directory.

## Deployment

### Docker Deployment

1. **Build the image:**
   ```bash
   docker build -t ems-app .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Set up the backend:**
   ```bash
   pip install -r requirements.txt
   python src/seed_data.py
   python src/main.py
   ```

2. **Build the frontend (if needed):**
   ```bash
   npm run build
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team or create an issue in the GitHub repository.

