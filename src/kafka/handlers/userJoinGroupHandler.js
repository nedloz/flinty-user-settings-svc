const UserSettings = require("../../collections/UserSettings");
const publishUserSubscriptions = require("../core/publishUserSubscriptions");


const userJoinGroupHandler = async ({ data }) => {
  const { user_id, group_chat_id } = data;

  if (!user_id || !group_chat_id) {
    console.warn(`[user.join.group] Invalid data:`, data);
    return;
  }

  console.log(`[user.join.group] User ${user_id} joins group ${group_chat_id}`);

  const updatedUserSettings = await UserSettings.findOneAndUpdate(
    { user_id, "group_chats.group_chat_id": { $ne: group_chat_id } },
    {
      $addToSet: {
        group_chats: {
          group_chat_id,
          mute: 'off',
          limitations: []
        }
      }
    },
    { upsert: true, new: true }
  ).lean();

  if (!updatedUserSettings) {
    console.warn(`[user.join.group] Failed to update UserSettings for ${user_id}`);
    return;
  }

  console.log(`[user.join.group] Updated UserSettings for ${user_id}, publishing subscriptions`);

  await publishUserSubscriptions({ user_id, userSettings: updatedUserSettings });
};

module.exports = userJoinGroupHandler;
