const produceKafkaMessage = require("../producer");

// сейчас каждый раз при обновлении данных например подписке на новый канал вызывается эта функция которая повторно пересобирает все заново
// можно сделать другое событие например user.subscriptions.update в котором будут только новые данные и не придется все перебирать с самого начала 

const publishUserSubscriptions = async ({ user_id, userSettings }) => {
  const channels = [];

  userSettings.servers.forEach(server => {
    server.channels.forEach(channel => {
      channels.push({
        channel_id: channel.channel_id,
        limitations: channel.limitations || [],
        mute: channel.mute || 'off'
      });
    });
  });

  userSettings.group_chats.forEach(group => {
    channels.push({
      channel_id: group.group_chat_id,
      limitations: group.limitations || [],
      mute: group.mute || 'off'
    });
  });

  userSettings.private_chats.forEach(privateChat => {
    channels.push({
      channel_id: privateChat.user_id,
      limitations: [],
      mute: privateChat.mute || 'off'
    });
  });

  produceKafkaMessage('user.subscriptions', {user_id, channels});

  console.log(`[user.subscriptions] Published for ${user_id} (${channels.length} channels)`);
};

module.exports = publishUserSubscriptions;