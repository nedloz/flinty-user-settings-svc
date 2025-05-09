const express = require('express');
const router = express.Router({ mergeParams: true });
const ChannelsController = require('../controllers/notificationController');

// get /users/me/subscriptions = auth 
router.get('/subscriptions', ChannelsController.getSubscriptions);
// post /users/me/subscriptions = auth
// delete /users/me/subscriptions { server_id, chat_id, user_id } auth
//      user.unsubscribe => kafka => message.svc (group, private) => deleteMessages
// post /users/me/blacklist addToBlacklist auth 
// delete /users/me/blacklist removeFromBlacklist auth -- for private chats 
// get /users/me/blacklist



module.exports = router;