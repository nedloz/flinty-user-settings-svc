const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userKickedFromGroupHandler = async ({ data }) => {
  try {
    const { user_id, group_chat_id } = data;

    if (!user_id || !group_chat_id) {
      console.warn('[user.kicked.from.group] Invalid data:', data);
      return;
    }

    console.log(`[user.kicked.from.group] User ${user_id} kicked from group ${group_chat_id}`);

    // Удаляем group_chat у пользователя
    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id },
      {
        $pull: {
          group_chats: { group_chat_id }
        }
      },
      { new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.kicked.from.group] No UserSettings found for user ${user_id}`);
      return;
    }

    console.log(`[user.kicked.from.group] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.kicked.from.group] Error processing event:', err);
  }
};

module.exports = userKickedFromGroupHandler;
