const UserSettings = require('../../collections/UserSettings');
const publishUserSubscriptions = require('../core/publishUserSubscriptions');

const groupMembersUpdateHandler = async ({ data }) => {
  try {
    const { group_chat_id, members } = data;

    if (!group_chat_id || !Array.isArray(members)) {
      console.warn('[group.members.update] Invalid data:', data);
      return;
    }

    console.log(`[group.members.update] Updating members for group ${group_chat_id}`);

    // Добавляем group_chat новым участникам, у кого его ещё нет
    const addResult = await UserSettings.updateMany(
      {
        user_id: { $in: members },
        'group_chats.group_chat_id': { $ne: group_chat_id }
      },
      {
        $addToSet: {
          group_chats: {
            group_chat_id,
            mute: 'off',
            limitations: []
          }
        }
      }
    );

    console.log(`[group.members.update] Added group ${group_chat_id} to ${addResult.modifiedCount} users`);

    // Удаляем group_chat у тех, кто больше не в members
    const removeResult = await UserSettings.updateMany(
      {
        'group_chats.group_chat_id': group_chat_id,
        user_id: { $nin: members }
      },
      {
        $pull: {
          group_chats: { group_chat_id }
        }
      }
    );

    console.log(`[group.members.update] Removed group ${group_chat_id} from ${removeResult.modifiedCount} users`);

    // Обновляем subscriptions для всех участников
    const updatedUsers = await UserSettings.find({ user_id: { $in: members } }).lean();
    for (const userSettings of updatedUsers) {
      await publishUserSubscriptions({
        user_id: userSettings.user_id,
        userSettings
      });
    }

  } catch (err) {
    console.error('[group.members.update] Error processing event:', err);
  }
};

module.exports = groupMembersUpdateHandler;
