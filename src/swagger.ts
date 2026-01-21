import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Assignment-2 API',
            version: '1.0.0',
            description: 'A RESTful API for managing users, posts, and comments with JWT authentication',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT Bearer token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID (MongoDB ObjectId)',
                            example: '507f1f77bcf86cd799439012',
                        },
                        username: {
                            type: 'string',
                            description: 'Username',
                            example: 'ofriAmit',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'ofriamit@example.com',
                        },
                    },
                },
                Post: {
                    type: 'object',
                    required: ['content', 'userID'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Post ID (MongoDB ObjectId)',
                            example: '507f1f77bcf86cd799439011',
                        },
                        content: {
                            type: 'string',
                            description: 'Post content',
                            example: 'This is my first post!',
                        },
                        userID: {
                            type: 'string',
                            description: 'ID of the user who created the post',
                            example: '507f1f77bcf86cd799439012',
                        },
                    },
                },
                Comment: {
                    type: 'object',
                    required: ['content', 'postId', 'userId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Comment ID (MongoDB ObjectId)',
                            example: '507f1f77bcf86cd799439013',
                        },
                        content: {
                            type: 'string',
                            description: 'Comment content',
                            example: 'Great post!',
                        },
                        postId: {
                            type: 'string',
                            description: 'ID of the post being commented on',
                            example: '507f1f77bcf86cd799439011',
                        },
                        userId: {
                            type: 'string',
                            description: 'ID of the user who wrote the comment',
                            example: '507f1f77bcf86cd799439012',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                            example: 'password123',
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'Username',
                            example: 'OfriAmit',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'ofriamit@example.com',
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            description: 'User password (minimum 6 characters)',
                            example: 'password123',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string',
                            description: 'JWT access token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                    },
                },
                RefreshTokenRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                            example: 'An error occurred',
                        },
                        status: {
                            type: 'number',
                            description: 'HTTP status code',
                            example: 400,
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Auth',
                description: 'User authentication and authorization endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Posts',
                description: 'Post management endpoints',
            },
            {
                name: 'Comments',
                description: 'Comment management endpoints',
            },
        ],
    },
    apis: [], // Will be set conditionally below
};

// Manually define paths
const manualPaths = {
    '/register': {
        post: {
            tags: ['Auth'],
            summary: 'Register a new user',
            description: 'Create a new user account with username, email and password',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RegisterRequest' }
                    }
                }
            },
            responses: {
                201: {
                    description: 'User registered successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' }
                        }
                    }
                },
                400: { description: 'Missing required fields' },
                409: { description: 'Email already in use' }
            }
        }
    },
    '/login': {
        post: {
            tags: ['Auth'],
            summary: 'Login user',
            description: 'Authenticate user and return JWT tokens',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Login successful',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' }
                        }
                    }
                },
                401: { description: 'Invalid credentials' }
            }
        }
    },
    '/refresh-token': {
        post: {
            tags: ['Auth'],
            summary: 'Refresh access token',
            description: 'Get a new access token using refresh token',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Token refreshed successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' }
                        }
                    }
                },
                401: { description: 'Invalid refresh token' }
            }
        }
    },
    '/logout': {
        post: {
            tags: ['Auth'],
            summary: 'Logout user',
            description: 'Invalidate refresh token',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
                    }
                }
            },
            responses: {
                200: { description: 'Logged out successfully' },
                401: { description: 'Invalid refresh token' }
            }
        }
    },
    '/users': {
        get: {
            tags: ['Users'],
            summary: 'Get all users',
            responses: {
                200: {
                    description: 'List of users',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/User' }
                            }
                        }
                    }
                }
            }
        }
    },
    '/users/{id}': {
        get: {
            tags: ['Users'],
            summary: 'Get user by ID',
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User ID'
            }],
            responses: {
                200: {
                    description: 'User details',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/User' }
                        }
                    }
                },
                404: { description: 'User not found' }
            }
        },
        put: {
            tags: ['Users'],
            summary: 'Update user',
            security: [{ bearerAuth: [] }],
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User ID'
            }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                username: { type: 'string' },
                                email: { type: 'string', format: 'email' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'User updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/User' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                404: { description: 'User not found' }
            }
        },
        delete: {
            tags: ['Users'],
            summary: 'Delete user',
            security: [{ bearerAuth: [] }],
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User ID'
            }],
            responses: {
                200: { description: 'User deleted successfully' },
                401: { description: 'Unauthorized' },
                404: { description: 'User not found' }
            }
        }
    },
    '/posts': {
        get: {
            tags: ['Posts'],
            summary: 'Get all posts',
            parameters: [{
                name: 'userID',
                in: 'query',
                schema: { type: 'string' },
                description: 'Filter by user ID'
            }],
            responses: {
                200: {
                    description: 'List of posts',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Post' }
                            }
                        }
                    }
                }
            }
        },
        post: {
            tags: ['Posts'],
            summary: 'Create a new post',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['content', 'userID'],
                            properties: {
                                content: { type: 'string', example: 'This is my first post!' },
                                userID: { type: 'string', example: '507f1f77bcf86cd799439012' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Post created successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Post' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                400: { description: 'Missing required fields' }
            }
        }
    },
    '/posts/{id}': {
        get: {
            tags: ['Posts'],
            summary: 'Get post by ID',
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Post ID'
            }],
            responses: {
                200: {
                    description: 'Post details',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Post' }
                        }
                    }
                },
                404: { description: 'Post not found' }
            }
        },
        put: {
            tags: ['Posts'],
            summary: 'Update a post',
            security: [{ bearerAuth: [] }],
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Post ID'
            }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                content: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Post updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Post' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                404: { description: 'Post not found' }
            }
        },
        delete: {
            tags: ['Posts'],
            summary: 'Delete a post',
            security: [{ bearerAuth: [] }],
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Post ID'
            }],
            responses: {
                200: { description: 'Post deleted successfully' },
                401: { description: 'Unauthorized' },
                404: { description: 'Post not found' }
            }
        }
    },
    '/comments': {
        get: {
            tags: ['Comments'],
            summary: 'Get comments by post ID',
            parameters: [{
                name: 'postId',
                in: 'query',
                required: true,
                schema: { type: 'string' },
                description: 'Filter by post ID'
            }],
            responses: {
                200: {
                    description: 'List of comments',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Comment' }
                            }
                        }
                    }
                }
            }
        },
        post: {
            tags: ['Comments'],
            summary: 'Create a new comment',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['content', 'postId', 'userId'],
                            properties: {
                                content: { type: 'string', example: 'Great post!' },
                                postId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                userId: { type: 'string', example: '507f1f77bcf86cd799439012' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Comment created successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Comment' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                400: { description: 'Missing required fields' }
            }
        }
    },
    '/comments/{id}': {
        get: {
            tags: ['Comments'],
            summary: 'Get comment by ID',
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Comment ID'
            }],
            responses: {
                200: {
                    description: 'Comment details',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Comment' }
                        }
                    }
                },
                404: { description: 'Comment not found' }
            }
        },
        put: {
            tags: ['Comments'],
            summary: 'Update a comment',
            security: [{ bearerAuth: [] }],
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Comment ID'
            }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                content: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Comment updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Comment' }
                        }
                    }
                },
                401: { description: 'Unauthorized' },
                404: { description: 'Comment not found' }
            }
        },
        delete: {
            tags: ['Comments'],
            summary: 'Delete a comment',
            security: [{ bearerAuth: [] }],
            parameters: [{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Comment ID'
            }],
            responses: {
                200: { description: 'Comment deleted successfully' },
                401: { description: 'Unauthorized' },
                404: { description: 'Comment not found' }
            }
        }
    }
};

// Add manual paths to the options definition
const completeOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: options.definition!.info!,
        servers: options.definition!.servers,
        components: options.definition!.components,
        tags: options.definition!.tags,
        paths: manualPaths
    },
    apis: [] // No need for file parsing since we have manual paths
};

const swaggerSpec = swaggerJsdoc(completeOptions);

export { swaggerUi, swaggerSpec };