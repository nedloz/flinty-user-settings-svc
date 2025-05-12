const UserSettings = require("../../collections/UserSettings");
const publishUserSubscriptions = require("../core/publishUserSubscriptions");


const userJoinPrivatechatHandler = async ({ data }) => {
  const { user_id, target_user_id } = data;

  if (!user_id || !target_user_id) {
    console.warn(`[user.join.private-chat] Invalid data:`, data);
    return;
  }

  console.log(`[user.join.private-chat] User ${user_id} joins private chat with ${target_user_id}`);

  // Добавляем private_chat в UserSettings, если его ещё нет
  const updatedUserSettings = await UserSettings.findOneAndUpdate(
    { user_id, "private_chats.user_id": { $ne: target_user_id } },
    {
      $addToSet: {
        private_chats: {
          user_id: target_user_id,
          mute: 'off'
        }
      }
    },
    { upsert: true, new: true }
  ).lean();

  if (!updatedUserSettings) {
    console.warn(`[user.join.private-chat] Failed to update UserSettings for ${user_id}`);
    return;
  }

  console.log(`[user.join.private-chat] Updated UserSettings for ${user_id}, publishing subscriptions`);

  await publishUserSubscriptions({ user_id, userSettings: updatedUserSettings });
};

module.exports = userJoinPrivatechatHandler;
