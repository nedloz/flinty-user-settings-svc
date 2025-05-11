require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const setupKafkaConsumer = require('./kafka/consumer');
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');
const subscriptionsRouter = require('./routes/subscriptionRouter');
const notificationRouter = require('./routes/notificationRoutes');
const attachUserFromHeaders = require('./utils/attachUserFromHeaders');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`✅ Запрос: ${req.method} ${req.originalUrl}`);
    next();
})

app.use(attachUserFromHeaders);

// routes
app.use('/users/me/', subscriptionsRouter);
app.use('/users/notifications', notificationRouter);

app.use((req, res) => {
    res.status(404).json({ error: "Not found"});
})

app.use(errorHandler);

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(process.env.PORT, () => console.log(`✅ MongoDB connected\nСервер запущен на порту: ${process.env.PORT}`))
        setupKafkaConsumer();
    } catch (err) {
        logger.error('❌ MongoDB error: ' + err.message);
        process.exit(1);
    }
})();

module.exports = app;