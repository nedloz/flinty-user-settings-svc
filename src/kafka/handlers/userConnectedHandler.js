const UserSettings = require('../collections/UserSettings');
const produceKafkaMessage = require('./producer');

const userConnectedHandler = async ({ data }) => {
    try {
        const { user_id } = data;
        // if (!user_id) ???  
        const settings = UserSettings.findOne(user_id);
        if (!settings) {
            console.log(`User settings not found for userId ${user_id}`);
            return;
        }

        const privateChats = settings.private_chats.map(chat => chat.private_chat_id);
        const groupChats = settings.group_chats.map(chat => chat.group_chat_id);
        const serverChannels = settings.servers.flatMap(server =>
            server.channels.map(channel => channel.channel_id)
        );

        const allChannelIds = [...privateChats, ...groupChats, ...serverChannels];
        const message = {
            user_id,
            allChannelIds
        }
        produceKafkaMessage('user.subscriptions', message)
    } catch (err) {
        console.error('Error processing UserConnected event:', err);
    }
}

module.exports = userConnectedHandler;

