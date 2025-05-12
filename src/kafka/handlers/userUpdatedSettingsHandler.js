const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const userUpdatedSettingsHandler = async ({ data }) => {
  try {
    const { user_id, settings } = data;

    if (!user_id || typeof settings !== 'object' || !settings) {
      console.warn('[user.updated.settings] Invalid data:', data);
      return;
    }

    console.log(`[user.updated.settings] Updating global settings for user ${user_id}`);

    const updatedUserSettings = await UserSettings.findOneAndUpdate(
      { user_id },
      { $set: { settings } },
      { upsert: true, new: true }
    ).lean();

    if (!updatedUserSettings) {
      console.warn(`[user.updated.settings] Failed to update UserSettings for user ${user_id}`);
      return;
    }

    console.log(`[user.updated.settings] Updated settings for user ${user_id}, publishing subscriptions`);

    await publishUserSubscriptions({
      user_id,
      userSettings: updatedUserSettings
    });

  } catch (err) {
    console.error('[user.updated.settings] Error processing event:', err);
  }
};

module.exports = userUpdatedSettingsHandler;
