const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const userMuteGroupHandler = async ({ data }) => {
  try {
    const { user_id, group_chat_id, mute } = data;

    if (!user_id || !group_chat_id || !mute) {
      console.warn('[user.mute.group] Invalid data:', data);
      return;
    }

    console.log(`[user.mute.group] Updating mute for user ${user_id} in group ${group_chat_id} to '${mute}'`);

    // Обновляем mute в group_chats
    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id, 'group_chats.group_chat_id': group_chat_id },
      { $set: { 'group_chats.$.mute': mute } },
      { new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.mute.group] No UserSettings found for user ${user_id} with group ${group_chat_id}`);
      return;
    }

    console.log(`[user.mute.group] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.mute.group] Error processing event:', err);
  }
};

module.exports = userMuteGroupHandler;
