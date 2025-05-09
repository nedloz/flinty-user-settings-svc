const express = require('express');
const router = express.Router({ mergeParams: true });
const ChannelsController = require('../controllers/notificationController');

// put /users/me/notifications updateNotifications { _id, status } auth 
// put /users/me/notifications/global updateGlobalNotifications auth
// get /users/me/notifications/global getGlobalNotifications
// get /users/me/notifications/:id getNotificationsById -- server_id / chat_id / private_id

module.exports = router;