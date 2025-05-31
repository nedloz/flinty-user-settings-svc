const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userLeaveServerHandler = async ({ data }) => {
  try {
    const { user_id, server_id } = data;

    if (!user_id || !server_id) {
      console.warn('[user.leave.server] Invalid data:', data);
      return;
    }

    console.log(`[user.leave.server] User ${user_id} leaves server ${server_id}`);

    // Удаляем сервер у пользователя
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
      console.warn(`[user.leave.server] No UserSettings found for user ${user_id}`);
      return;
    }

    console.log(`[user.leave.server] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.leave.server] Error processing event:', err);
  }
};

module.exports = userLeaveServerHandler;
