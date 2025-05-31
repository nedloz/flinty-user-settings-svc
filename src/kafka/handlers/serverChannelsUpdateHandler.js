const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const serverChannelsUpdateHandler = async ({ data }) => {
  try {
    const { server_id, channels } = data;

    if (!server_id || !Array.isArray(channels)) {
      console.warn('[server.channels.update] Invalid data:', data);
      return;
    }

    console.log(`[server.channels.update] Updating channels for server ${server_id}`);

    // Обновляем список каналов внутри servers.server_id у всех пользователей
    const updateResult = await UserSettings.updateMany(
      { 'servers.server_id': server_id },
      {
        $set: {
          'servers.$.channels': channels.map(channel  => ({
            channel_id: channel.channel_id,
            mute: 'off',
            limitations: []
          }))
        }
      }
    );

    console.log(`[server.channels.update] Updated ${updateResult.modifiedCount} users`);

    // Получаем всех пользователей, у кого есть этот сервер
    const updatedUsers = await UserSettings.find({ 'servers.server_id': server_id }).lean();

    for (const userSettings of updatedUsers) {
      await publishUserSubscriptions({
        user_id: userSettings.user_id,
        userSettings
      });
    }

  } catch (err) {
    console.error('[server.channels.update] Error processing event:', err);
  }
};

module.exports = serverChannelsUpdateHandler;
