const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const groupDeletedHandler = async ({ data }) => {
  try {
    const { group_chat_id } = data;

    if (!group_chat_id) {
      console.warn('[group.deleted] Invalid data:', data);
      return;
    }

    console.log(`[group.deleted] Removing group ${group_chat_id} from all users`);

    // Удаляем group_chat из всех пользователей
    const affectedUsers = await UserSettings.updateMany(
      { 'group_chats.group_chat_id': group_chat_id },
      { $pull: { group_chats: { group_chat_id } } }
    );

    console.log(`[group.deleted] Updated ${affectedUsers.modifiedCount} users`);

    // Получаем всех пользователей, кого затронуло изменение
    const updatedUsers = await UserSettings.find({ 'group_chats.group_chat_id': { $ne: group_chat_id } }).lean();

    for (const userSettings of updatedUsers) {
      await publishUserSubscriptions({
        user_id: userSettings.user_id,
        userSettings
      });
    }

  } catch (err) {
    console.error('[group.deleted] Error processing event:', err);
  }
};

module.exports = groupDeletedHandler;
