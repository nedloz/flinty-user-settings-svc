const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const userMuteChannelHandler = async ({ data }) => {
  try {
    const { user_id, channel_id, mute } = data;

    if (!user_id || !channel_id || !mute) {
      console.warn('[user.mute.channel] Invalid data:', data);
      return;
    }

    console.log(`[user.mute.channel] Updating mute for user ${user_id} in channel ${channel_id} to '${mute}'`);

    // Обновляем mute в servers.channels
    const serverUpdate = await UserSettings.findOneAndUpdate(
      { user_id, 'servers.channels.channel_id': channel_id },
      { $set: { 'servers.$[].channels.$[chan].mute': mute } },
      {
        arrayFilters: [{ 'chan.channel_id': channel_id }],
        new: true
      }
    ).lean();

    // Если не нашли в servers, пробуем в group_chats
    let updatedUserSettings = serverUpdate;
    if (!updatedUserSettings) {
      updatedUserSettings = await UserSettings.findOneAndUpdate(
        { user_id, 'group_chats.group_chat_id': channel_id },
        { $set: { 'group_chats.$.mute': mute } },
        { new: true }
      ).lean();
    }

    if (!updatedUserSettings) {
      console.warn(`[user.mute.channel] No UserSettings found for user ${user_id} with channel ${channel_id}`);
      return;
    }

    console.log(`[user.mute.channel] Updated UserSettings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.mute.channel] Error processing event:', err);
  }
};

module.exports = userMuteChannelHandler;
