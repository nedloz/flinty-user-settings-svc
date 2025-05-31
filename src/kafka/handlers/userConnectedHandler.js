const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userConnectedHandler = async ({ data }) => {
  try {
    const { user_id } = data;
    
    if (!user_id) {
      console.warn('[user.connected] Invalid data:', data);
      return;
    }

    console.log(`[user.connected] Handling subscriptions for user ${user_id}`);

    const settings = await UserSettings.findOne({ user_id }).lean();
    if (!settings) {
      console.warn(`[user.connected] No UserSettings found for user ${user_id}`);
      return;
    }

    await publishUserSubscriptions({ user_id, userSettings: settings });

    console.log(`[user.connected] Subscriptions published for user ${user_id}`);
  } catch (err) {
    console.error('[user.connected] Error processing event:', err);
  }
};

module.exports = userConnectedHandler;
