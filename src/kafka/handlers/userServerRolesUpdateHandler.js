const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userServerRolesUpdateHandler = async ({ data }) => {
  try {
    const { user_id, server_id, channels } = data;

    if (!user_id || !server_id || !Array.isArray(channels)) {
      console.warn('[user.server.roles.update] Invalid data:', data);
      return;
    }

    console.log(`[user.server.roles.update] Updating roles for user ${user_id} on server ${server_id}`);

    const userSettings = await UserSettings.findOne({ user_id });

    if (!userSettings) {
      console.warn(`[user.server.roles.update] No UserSettings found for user ${user_id}`);
      return;
    }

    // Обновляем limitations в нужном сервере
    userSettings.servers.forEach(server => {
      if (server.server_id === server_id) {
        server.channels.forEach(channel => {
          const updatedChannel = channels.find(c => c.channel_id === channel.channel_id);
          if (updatedChannel) {
            channel.limitations = updatedChannel.limitations;
          }
        });
      }
    });

    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id },
      { $set: { servers: userSettings.servers } },
      { new: true }
    ).lean();

    console.log(`[user.server.roles.update] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.server.roles.update] Error processing event:', err);
  }
};

module.exports = userServerRolesUpdateHandler;
