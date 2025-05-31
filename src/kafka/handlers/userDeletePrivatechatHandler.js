const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userDeletePrivatechatHandler = async ({ data }) => {
  try {
    const { user_id, target_user_id } = data;

    if (!user_id || !target_user_id) {
      console.warn('[user.delete.private-chat] Invalid data:', data);
      return;
    }

    console.log(`[user.delete.private-chat] User ${user_id} deletes private chat with ${target_user_id}`);

    // Удаляем private_chat у указанного пользователя
    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id },
      {
        $pull: {
          private_chats: { user_id: target_user_id }
        }
      },
      { new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.delete.private-chat] No UserSettings found for user ${user_id}`);
      return;
    }

    console.log(`[user.delete.private-chat] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.delete.private-chat] Error processing event:', err);
  }
};

module.exports = userDeletePrivatechatHandler;
