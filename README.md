# Team Task Manager

A full-stack web application for team project and task management with role-based access control.

## 🚀 Features

- **Authentication**: User signup/login with JWT tokens
- **Role-based Access Control**: Admin and Member roles with different permissions
- **Project Management**: Create, manage, and organize projects
- **Team Collaboration**: Add/remove team members from projects
- **Task Management**: Create, assign, and track tasks with status updates
- **Dashboard**: Overview of projects, tasks, and statistics
- **Real-time Updates**: Live task status and project progress
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** and **express-rate-limit** for security

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **Context API** for state management

### Deployment
- **Railway** for hosting
- **MongoDB Atlas** for database

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members/:memberId` - Remove team member

### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks
- `GET /api/tasks/my-tasks` - Get user's assigned tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add task comment

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/search` - Search users
- `GET /api/users/stats` - Get user statistics

## 🗄️ Database Schema

### User
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'member'], default: 'member'),
  avatar: String,
  isActive: Boolean (default: true)
}
```

### Project
```javascript
{
  name: String (required),
  description: String,
  owner: ObjectId (ref: 'User', required),
  members: [{
    user: ObjectId (ref: 'User'),
    role: String (enum: ['admin', 'member']),
    joinedAt: Date
  }],
  status: String (enum: ['active', 'completed', 'archived']),
  startDate: Date,
  endDate: Date,
  tags: [String]
}
```

### Task
```javascript
{
  title: String (required),
  description: String,
  project: ObjectId (ref: 'Project', required),
  assignedTo: ObjectId (ref: 'User'),
  createdBy: ObjectId (ref: 'User', required),
  status: String (enum: ['todo', 'in-progress', 'review', 'completed']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  comments: [{
    user: ObjectId (ref: 'User'),
    text: String,
    createdAt: Date
  }]
}
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Team-Task
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. **Start the application**
```bash
# From root directory - starts both backend and frontend
npm run dev

# Or start individually:
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 🌐 Deployment

### Railway Deployment

1. **Push to GitHub**
   - Make sure your code is pushed to a GitHub repository

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the project structure

3. **Set Environment Variables**
   In Railway dashboard, set these environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Deploy**
   - Railway will automatically build and deploy your application
   - Once deployed, you'll get a live URL

### Manual Deployment

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Set production environment variables**
```bash
export NODE_ENV=production
export MONGODB_URI=your-production-mongodb-uri
export JWT_SECRET=your-production-jwt-secret
```

3. **Start the server**
```bash
cd backend
npm start
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

### API Testing
You can use tools like Postman or curl to test the API endpoints.

## 📱 Usage

1. **Register an account** - Choose between Admin and Member roles
2. **Create projects** - Set up projects with descriptions and end dates
3. **Add team members** - Invite users to collaborate on projects
4. **Create tasks** - Assign tasks to team members with priorities and due dates
5. **Track progress** - Update task statuses and monitor project progress
6. **View dashboard** - Get an overview of all your projects and tasks

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Helmet.js for security headers
- Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🎯 Future Enhancements

- Real-time notifications
- File attachments for tasks
- Advanced filtering and search
- Project templates
- Time tracking integration
- Advanced reporting and analytics
- Email notifications
- Mobile app

---

**Built with ❤️ for efficient team collaboration**
