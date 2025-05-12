const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const userGroupRolesUpdateHandler = async ({ data }) => {
  try {
    const { user_id, group_chat_id, limitations } = data;

    if (!user_id || !group_chat_id || !Array.isArray(limitations)) {
      console.warn('[user.group.roles.update] Invalid data:', data);
      return;
    }

    console.log(`[user.group.roles.update] Updating limitations for user ${user_id} in group ${group_chat_id}`);

    // Обновляем limitations у конкретного group_chat пользователя
    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id, 'group_chats.group_chat_id': group_chat_id },
      {
        $set: {
          'group_chats.$.limitations': limitations
        }
      },
      { new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.group.roles.update] No UserSettings found for user ${user_id}`);
      return;
    }

    console.log(`[user.group.roles.update] Updated limitations for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.group.roles.update] Error processing event:', err);
  }
};

module.exports = userGroupRolesUpdateHandler;
