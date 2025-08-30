const mongoose = require('mongoose');
const MUTE_OPTIONS = ['all', 'mentions-replies', 'off'];
const LIMITATIONS = ['send_messages', 'edit_messages', 'delete_messages', 'mention_everyone']
// если использовать limitations то база будет меньше тк ограничений обычно меньше
const globalNotificationsSettingsSchema = new mongoose.Schema({
    mute_all: {
        type: String, 
        enum: MUTE_OPTIONS,
        default: 'off'
    },
    mute_servers: {
        type: String, 
        enum: MUTE_OPTIONS,
        default: 'off'
    },
    mute_group_chats: {
        type: String, 
        enum: MUTE_OPTIONS,
        default: 'off'
    },
    mute_private_chats: {
        type: String, 
        enum: MUTE_OPTIONS,
        default: 'off'},
}, 
{_id: false }); 


const UserSettingsSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    blacklist: [{
        blocked_user_id: String,
        blocked_at: { type: Date, default: Date.now }
    }],
    global_notificatons_settings: globalNotificationsSettingsSchema,
    private_chats: [{
        user_id: String,
        mute: {
            type: String, 
            enum: MUTE_OPTIONS,
            default: 'off'
        },
        local_name: String,
        local_avatar_url: String,
        local_description: String
    }],
    group_chats: [{
        group_chat_id: String,
        mute: {
            type: String, 
            enum: MUTE_OPTIONS,
            default: 'off'
        },
        limitations: [{
            type: String,
            enum: LIMITATIONS,
            default: []
        }]
    }],
    servers: [{
        server_id: String,
        mute: {
            type: String, 
            enum: MUTE_OPTIONS,
            default: 'off'
        },
        channels: [{
            channel_id: String,
            mute: {
                type: String, 
                enum: MUTE_OPTIONS,
                default: 'off'
            },
            limitations: [{
                type: String,
                enum: LIMITATIONS,
                default: []
            }]
        }]
    }]

});

module.exports = mongoose.model('UserSettings', UserSettingsSchema);