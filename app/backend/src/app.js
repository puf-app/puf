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

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

app.use(helmet());
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
    origin: "http://localhost:3001",
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
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/test", testRoutes);

app.use('/api/auth', authLimiter, authRoutes);

module.exports = app;