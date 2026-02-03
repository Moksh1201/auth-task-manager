import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:5000/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "confirmPassword"],
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
          confirmPassword: { type: "string" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },
      Task: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          completed: { type: "boolean" },
          user: { type: "string" },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
      },
      TaskCreate: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          completed: { type: "boolean" },
        },
      },
      TaskUpdate: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          completed: { type: "boolean" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: { description: "Healthy" },
          503: { description: "Database not connected" },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: {
          201: { description: "User registered" },
          409: { description: "Email already registered" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/tasks": {
      get: {
        summary: "Get tasks",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Task list" },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskCreate" } },
          },
        },
        responses: {
          201: { description: "Task created" },
          400: { description: "Validation error" },
        },
      },
    },
    "/tasks/{id}": {
      put: {
        summary: "Update task",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskUpdate" } },
          },
        },
        responses: {
          200: { description: "Task updated" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      delete: {
        summary: "Delete task",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Task deleted" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/v1/health", (req, res) => {
  const state = mongoose.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(state === 1 ? 200 : 503).json({
    status: state === 1 ? "ok" : "degraded",
    database: states[state] || "unknown",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
