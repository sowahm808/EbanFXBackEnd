"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_1 = require("./middleware/auth");
const role_1 = require("./middleware/role");
const error_1 = require("./middleware/error");
const publicRoutes_1 = require("./routes/publicRoutes");
const userRoutes_1 = require("./routes/userRoutes");
const adminRoutes_1 = require("./routes/adminRoutes");
const webhookRoutes_1 = require("./routes/webhookRoutes");
const openapi_1 = require("./docs/openapi");
const app = (0, express_1.default)();
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    }
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(publicRoutes_1.publicRoutes);
app.use(webhookRoutes_1.webhookRoutes);
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiSpec));
app.use(auth_1.requireAuth);
app.use(userRoutes_1.userRoutes);
app.use((0, role_1.requireRole)('admin', 'compliance'), adminRoutes_1.adminRoutes);
app.use(error_1.errorHandler);
exports.default = app;
