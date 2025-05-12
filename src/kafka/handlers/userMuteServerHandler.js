const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const userMuteServerHandler = async ({ data }) => {
  try {
    const { user_id, server_id, mute } = data;

    if (!user_id || !server_id || !mute) {
      console.warn('[user.mute.server] Invalid data:', data);
      return;
    }

    console.log(`[user.mute.server] Updating mute for user ${user_id} on server ${server_id} to '${mute}'`);

    // Обновляем mute для сервера
    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id, 'servers.server_id': server_id },
      { $set: { 'servers.$.mute': mute } },
      { new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.mute.server] No UserSettings found for user ${user_id} with server ${server_id}`);
      return;
    }

    console.log(`[user.mute.server] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.mute.server] Error processing event:', err);
  }
};

module.exports = userMuteServerHandler;
