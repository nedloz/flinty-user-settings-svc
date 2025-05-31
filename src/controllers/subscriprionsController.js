const UserSettings = require("../collections/UserSettings")
// создание схемы на пользователя при регистрации



const getSubscriptions = async (req, res, next) => {
    try {
        const userId = req.user?.user_id;
        if (!userId) throw { status: 401, message: 'Unauthorized' };
        const settings = await UserSettings.findOne({ user_id: userId });
        if (!settings) throw { status: 404, message: 'User not found'};
        const privateChats = settings.private_chats?.map(chat => chat.private_chat_id) || [];
        const groupChats = settings.group_chats?.map(chat => chat.group_chat_id) || [];
        const servers = settings.servers?.map(server => server.server_id) || [];
        return res.json({
            private: privateChats,
            groups: groupChats,
            servers: servers
        });
    } catch (err) {
        next(err);
    }
}


module.exports = {
    getSubscriptions,
}