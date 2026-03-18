require('dotenv').config();
const MongoStore = require('connect-mongo').default;
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const { updateLastSeen } = require('./middleware/userActivityMiddleware');

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require ("./routes/userRoutes");
const friendshipRoutes = require ("./routes/friendshipRoutes");
const verificationRoutes = require ("./routes/verificationRoutes");

const app = express();

app.set('trust proxy', 1);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "script-src": ["'self'", "https://unpkg.com", "'unsafe-inline'"],
                "script-src-attr": ["'unsafe-inline'"],
                "img-src": ["'self'", "data:", "https://validator.swagger.io"], // za swagger
                "style-src": ["'self'", "'unsafe-inline'"], // za swagger
            },
        },
    })
);
app.use(hpp());
app.disable('x-powered-by');

const generalLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    message: {data: {}, error:"Too many requests from this IP address, please try again in 15 minutes."},
    standardHeaders: true,
    legacyHeaders: true,
});
app.use("/api/", generalLimiter)

const authLimiter = rateLimit({
    windowMs: 60*60*1000,
    max: 100, //trenutno 100 poskusov za testiranje
    message: {data: {}, error:"Too many failed login attempts. Your account has been temporarily locked for your IP."},
})

app.use(express.json({ limit: '10kb' }));

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3001",
    credentials: true
}));

app.use(morgan("dev"));

app.use(session({
    name: 'puf_session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(updateLastSeen);
app.use(express.static('public'));

app.get("/docs/swagger.json", (req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, (req, res, next) => {
    const host = req.hostname;
    const port = process.env.PORT || 3000;
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            url: `http://${host}:${port}/docs/swagger.json`
        },
        customHeadContent: `<base href="http://${host}:${port}/docs/">`
    })(req, res, next);
});
app.use("/test", testRoutes);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/verification', verificationRoutes);

module.exports = app;