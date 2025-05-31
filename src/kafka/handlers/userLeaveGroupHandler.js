const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userLeaveGroupHandler = async ({ data }) => {
  try {
    const { user_id, group_chat_id } = data;

    if (!user_id || !group_chat_id) {
      console.warn('[user.leave.group] Invalid data:', data);
      return;
    }

    console.log(`[user.leave.group] User ${user_id} leaves group ${group_chat_id}`);

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
      console.warn(`[user.leave.group] No UserSettings found for user ${user_id}`);
      return;
    }

    console.log(`[user.leave.group] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.leave.group] Error processing event:', err);
  }
};

module.exports = userLeaveGroupHandler;
