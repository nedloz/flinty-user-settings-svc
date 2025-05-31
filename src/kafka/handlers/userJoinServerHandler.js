const UserSettings = require("../../collections/UserSettings");
const publishUserSubscriptions = require("../utils/publishUserSubscriptions");

const userJoinServerHandler = async ({ data }) => {
  const { user_id, server_id, channels } = data;

  if (!user_id || !server_id || !Array.isArray(channels)) {
    console.warn(`[user.join.server] Invalid data:`, data);
    return;
  }

  console.log(`[user.join.server] User ${user_id} joins server ${server_id}`);

  const updatedUserSettings = await UserSettings.findOneAndUpdate(
    { user_id, "servers.server_id": { $ne: server_id } },
    {
      $addToSet: {
        servers: {
          server_id,
          mute: 'off',
          channels: channels.map(channel_id => ({
            channel_id,
            mute: 'off',
            limitations: []
          }))
        }
      }
    },
    { upsert: true, new: true }
  ).lean();

  if (!updatedUserSettings) {
    console.warn(`[user.join.server] Failed to update UserSettings for ${user_id}`);
    return;
  }

  console.log(`[user.join.server] Updated UserSettings for ${user_id}, publishing subscriptions`);
  console.log(updatedUserSettings);
  await publishUserSubscriptions({ user_id, userSettings: updatedUserSettings });
};

module.exports = userJoinServerHandler;