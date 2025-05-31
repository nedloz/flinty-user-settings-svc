const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const serverDeletedHandler = async ({ data }) => {
  try {
    const { server_id } = data;

    if (!server_id) {
      console.warn('[server.deleted] Invalid data:', data);
      return;
    }

    console.log(`[server.deleted] Removing server ${server_id} from all users`);

    // Удаляем сервер из всех пользователей
    const updateResult = await UserSettings.updateMany(
      { 'servers.server_id': server_id },
      {
        $pull: {
          servers: { server_id }
        }
      }
    );

    console.log(`[server.deleted] Removed server ${server_id} from ${updateResult.modifiedCount} users`);

    // Получаем всех пользователей, у кого вообще есть UserSettings (опционально можно оптимизировать фильтрацию)
    const updatedUsers = await UserSettings.find({}).lean();

    for (const userSettings of updatedUsers) {
      await publishUserSubscriptions({
        user_id: userSettings.user_id,
        userSettings
      });
    }

  } catch (err) {
    console.error('[server.deleted] Error processing event:', err);
  }
};

module.exports = serverDeletedHandler;

