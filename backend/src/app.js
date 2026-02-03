import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  // For credentialed requests, the header must echo the Origin (not "*").
  const origin = req.headers.origin;
  if (origin) res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});
app.use(express.json());

app.use((req, res, next) => {
  if (
    req.path.startsWith("/api/v1") &&
    req.path !== "/api/v1/health" &&
    mongoose.connection.readyState !== 1
  ) {
    return res.status(503).json({ message: "Database not connected" });
  }
  return next();
});

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
  },
  servers: [{ url: `http://localhost:${process.env.PORT || 5000}/api/v1` }],
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
