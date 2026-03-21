# Ember Application Feature Requests

## Multi Device
- Migrate from Recovery Key to 2FA using QR code to recover on another device (Reset Password)

## 🎯 User Experience & Interface
### **Chat & Messaging**
- Copy message button
- Message search within current channel (Place in Chat Header)
- Message search within all channels (Place somewhere in DMS)
- Message threading (reply to specific messages)
- Message reactions/emoji reactions
- Global search across all channels
- Group Messaging in the DMS area
- Add Link Previews? Link previews in messages are automatic, visual cards that display a website's title, image, and description when a URL is sent
- Add RSS icon to Voice controls, On hover show ping to the server.
- Physical Send Button

## User Bar
- Toggle for User Names on right side

## Voice Interaction
- User individual Voice Control

### **User Interaction**
- Keybinds
- @mentions with notifications
- Direct Reply to messages (Included in @mentions)
- Sound Packs Client Side

## 🔧 Core Functionality
### **Communication Features**
- Pin DM messages to top of messages bar
### **System Features**
- Message history search across all channels
- Push notifications
- Multi-device synchronization
- Advanced search filters and operators

## 🛡️ Administration & Security
### **Permissions & Moderation**
- Permissions system (admin, moderator, user roles)
- Cycle between unread mentions (Takes you to the correct spot)
- Audit logs and moderation tools

### **Advanced Security**
- Custom emoji support
- Bots and integrations
- Two-factor authentication
- Session management improvements

## 🎨 Advanced Features
### **Real-time Communication**
- Video/voice calling (For DMS/Group Messages)
- Screen sharing
- Real-time collaboration features (shared documents, whiteboard)
- Voice message transcription

### **Platform Integration**
- Federation with other chat servers
- Plugin system for third-party extensions
- Advanced analytics and insights
- Custom themes and extensive UI customization
- Webhook support for integrations

## 🔒 Specialized Features
- Data export functionality

## Websocket Updates

Create a model for all IPC Messages
{
	"cmd": "Test",
	"args": {
		"test": "Test"
	}
}

{
    "cmd": "SET_ACTIVITY",
    "args": {
        "pid": 3870,
        "activity": {
            "type": 2,
            "created_at": 1773731356373,
            "details": "No Role Modelz",
            "state": "J. Cole",
            "details_url": "https://music.youtube.com/watch?v=8HBcV0MtAQg",
            "state_url": "https://music.youtube.com/channel/UC0ajkOzj8xE3Gs3LHCE243A",
            "timestamps": {
                "start": 1773731175000,
                "end": 1773731468000
            },
            "assets": {
                "large_image": "mp:external/dwemU4DRQ1_-vF38LfsBkKm3jA6RohwtxP3fSitrspU/https/lh3.googleusercontent.com/kMrbZiHDjddAGv58UvL1T-I5ddCzUAAclrmIMaY3ty4-jAxHueE4pqJ-SX8o_ggXimkPMcsKxh9Ev45P9Q%3Dw544-h544-l90-rj",
                "large_text": "2014 Forest Hills Drive"
            },
            "status_display_type": 2,
            "buttons": [
                "Play on YouTube Music",
                "View App On GitHub"
            ],
            "name": "YouTube Music",
            "application_id": "1177081335727267940",
            "platform": "desktop",
            "metadata": {
                "button_urls": [
                    "https://music.youtube.com/watch?v=8HBcV0MtAQg",
                    "https://github.com/th-ch/youtube-music"
                ]
            }
        }
    },
    "nonce": "c7e1901a-d6c9-45db-84cd-17aa5e9bc86a"
}


Migrate from TweetNacl to Signal Protocol