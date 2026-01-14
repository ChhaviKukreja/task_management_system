import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management System API',
      version: '1.0.0',
      description: 'A comprehensive MERN stack Task Management System with JWT authentication',
      contact: {
        name: 'API Support',
        email: 'support@taskmanagement.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated user ID',
            },
            username: {
              type: 'string',
              description: 'Unique username',
              minLength: 3,
              maxLength: 30,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (hashed)',
              minLength: 6,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Task: {
          type: 'object',
          required: ['title', 'user'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated task ID',
            },
            title: {
              type: 'string',
              description: 'Task title',
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Task description',
              maxLength: 500,
            },
            category: {
              type: 'string',
              description: 'Task category',
              default: 'General',
            },
            priority: {
              type: 'string',
              enum: ['High', 'Medium', 'Low'],
              default: 'Medium',
              description: 'Task priority level',
            },
            status: {
              type: 'string',
              enum: ['Pending', 'In Progress', 'Completed'],
              default: 'Pending',
              description: 'Task completion status',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Task due date',
            },
            user: {
              type: 'string',
              description: 'Reference to User ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints',
      },
      {
        name: 'Health',
        description: 'System health check',
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
