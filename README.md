1.Architecture Diagram:
             +----------------+
             |   Frontend     |
             | (HTML/CSS/JS)  |
             +-------+--------+
                     |
                     v
             +----------------+
             |   Backend      |
             |  Express.js    |
             | RESTful APIs   |
             +-------+--------+
                     |
          +----------+-----------+
          |                      |
  +-------v-------+      +-------v--------+
  |   MongoDB     |      | Authentication |
  |  (Mongoose)   |      | (JWT Sessions) |
  +---------------+      +----------------+

  2.Technology Stack:

Layer          	   Technology/Tool
Frontend	        HTML, CSS, JavaScript, Bootstrap
Backend	          Node.js, Express.js
Database	        MongoDB, Mongoose ODM
Auth	            JSON Web Tokens (JWT)
Package Mgmt     	npm


3.Design Decisions:

->Express.js for Backend
    Lightweight, flexible framework
    Supports RESTful API design
    Easily integrates with MongoDB using Mongoose
->MongoDB Database
    Flexible schema for dynamic work item attributes
    Handles nested objects (dependencies) efficiently
->Role-Based Access
    Admin: Can create/manage users and assign tasks
    Member: Can view/complete assigned tasks
->Dependency Management
    Tasks can depend on multiple other tasks
    Dependencies prevent a task from being started until prerequisite tasks are complete
->Priority System
    Tasks can have low, medium, or high priority
    Priority influences scheduling and dependency resolution
->Authentication
    JWT-based sessions
    Tokens stored client-side, verified server-side

    
 3.Dependency Logic:

->Data model:

 WorkItem = {
  title: String,
  description: String,
  priority: String, // 'low', 'medium', 'high'
  assignedTo: ObjectId, // User
  status: String, // 'pending', 'in-progress', 'completed'
  dependencies: [ObjectId] // List of WorkItem IDs
}

4.Setup & Installation Instructions:

->Prerequisites:
Node.js ≥ 18.x
MongoDB running locally or via cloud (Atlas)
npm (Node Package Manager)

->Backend Installation:
# Clone repository
git clone <repo-url>
cd work-manager

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
# PORT=3000
# MONGO_URI=<mongodb connection string>
# JWT_SECRET=<secret key>

# Start server
npm start

->Frontend:
Place HTML/CSS/JS files in public/ folder.
Frontend makes API calls to backend endpoints.

5.Assumptions:

Each task can only be assigned to one member at a time.
Dependencies are direct and non-circular.
Users will complete tasks in the order allowed by dependencies.
Admins have complete access; members cannot create tasks.
Frontend communicates via REST API; no GraphQL or WebSocket integration is used.
 
