const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userMutePrivatechatHandler = async ({ data }) => {
  try {
    const { user_id, target_user_id, mute } = data;

    if (!user_id || !target_user_id || !mute) {
      console.warn('[user.mute.private-chat] Invalid data:', data);
      return;
    }

    console.log(`[user.mute.private-chat] Updating mute for user ${user_id} in private chat with ${target_user_id} to '${mute}'`);

    // Обновляем mute в private_chats
    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id, 'private_chats.user_id': target_user_id },
      { $set: { 'private_chats.$.mute': mute } },
      { new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.mute.private-chat] No UserSettings found for user ${user_id} with private chat ${target_user_id}`);
      return;
    }

    console.log(`[user.mute.private-chat] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.mute.private-chat] Error processing event:', err);
  }
};

module.exports = userMutePrivatechatHandler;
