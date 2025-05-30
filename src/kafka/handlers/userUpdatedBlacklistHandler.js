const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../utils/publishUserSubscriptions');

const userUpdatedBlacklistHandler = async ({ data }) => {
  try {
    const { user_id, blacklist } = data;

    if (!user_id || !Array.isArray(blacklist)) {
      console.warn('[user.updated.blacklist] Invalid data:', data);
      return;
    }

    console.log(`[user.updated.blacklist] Updating blacklist for user ${user_id}`);

    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id },
      { $set: { blacklist } },
      { upsert: true, new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.updated.blacklist] Failed to update UserSettings for user ${user_id}`);
      return;
    }

    console.log(`[user.updated.blacklist] Updated blacklist for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.updated.blacklist] Error processing event:', err);
  }
};

module.exports = userUpdatedBlacklistHandler;
