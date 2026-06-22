import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini Company Portal API",
      version: "1.0.0",
      description:
        "API documentation for the Mini Company Portal backend. Includes authentication, role-based authorization, company data isolation, employees, and salary reviews.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Register company, login, and get current authenticated user",
      },
      {
        name: "Users",
        description: "User management APIs",
      },
      {
        name: "Employees",
        description: "Employee profile and salary calculation APIs",
      },
      {
        name: "Salary Reviews",
        description: "Salary review request and approval APIs",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
