import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WIMM API',
      version: '1.0.0',
      description: 'Where Is My Money - Personal expense tracking API',
      contact: {
        name: 'Shine Santhosh',
        url: 'https://github.com/shinesanthosh/wimm-backend/issues',
      },
    },
    servers: [
      {
        url: 'http://localhost:3010',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: 'object',
            },
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
        Cashflow: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            value: {
              type: 'number',
              format: 'decimal',
            },
            description: {
              type: 'string',
            },
            time: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            username: {
              type: 'string',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              description: 'Username must be between 3 and 50 characters',
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 100,
              description: 'Password must be between 6 and 100 characters',
            },
          },
        },
        CreateCashflowRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              format: 'decimal',
            },
            description: {
              type: 'string',
            },
            date: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
}

const specs = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
    })
  )
}
