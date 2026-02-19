import swaggerJSDoc from 'swagger-jsdoc';

export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Eban FX Backend API',
      version: '1.0.0',
      description: 'Compliance-first cross-border payments backend API.'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['src/routes/*.ts']
});
