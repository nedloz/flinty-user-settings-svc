const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const userBannedFromServerHandler = async ({ data }) => {
  try {
    const { user_id, server_id } = data;

    if (!user_id || !server_id) {
      console.warn('[user.banned.from.server] Invalid data:', data);
      return;
    }

    console.log(`[user.banned.from.server] User ${user_id} banned from server ${server_id}`);

    // Удаляем сервер из UserSettings пользователя
    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id },
      {
        $pull: {
          servers: { server_id }
        }
      },
      { new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.banned.from.server] No UserSettings found for user ${user_id}`);
      return;
    }

    console.log(`[user.banned.from.server] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.banned.from.server] Error processing event:', err);
  }
};

module.exports = userBannedFromServerHandler;
