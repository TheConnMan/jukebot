# JukeBot
Slack-Enabled Syncronized Music Listening

## Setup
### Google API Key for YouTube
1. Go to https://console.developers.google.com
1. Create a new Google Project named JukeBot
1. Under **Create credentials** choose **API key** and use the API key for the environment variable below
1. Click **Library** in the left panel
1. Go to **YouTube Data API**
1. Click **Enable** at the top

## Environment Variables
- **GOOGLE_API_KEY** - Google project API key
- **SLACK_WEBHOOK** (Optional) - [Slack Incoming Webhook URL](https://my.slack.com/apps/A0F7XDUAZ-incoming-webhooks) for sending song addition and currently now playing notifications
- **SERVER_URL** - JukeBot server URL for linking back
