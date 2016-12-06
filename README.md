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

### Slash Command
To use a Slack Slash Command you'll need to set one up (preferably after the running the deployment steps below) and follow these instructions:

1. Go to the [Slack Slash Command setup page](https://my.slack.com/apps/A0F82E8CA-slash-commands), add a configuration, and name it **JukeBot**
1. Input the URL you configure during the deployment step and add a trailing `/slack/slash` (e.g. jukebox.my.domain.com/slack/slash)
1. Change the request method to GET
1. Copy the **Token** and use it as the **SLASH_TOKEN** environment variable
1. Customize the name to **JukeBot**
1. Check the box to "Show this command in the autocomplete list"
1. Add the description "Slack-Enabled Syncronized Music Listening"
1. Add the usage hint "add <youtube-url> - Add a YouTube video to the playlist"
1. Click save!

## Deployment
Within this project is a `docker-compose.yml` file for use when deploying this project to your own server. Slack Slash Commands require the slash command endpoint to be HTTPS, so JukeBot uses [Let's Encrypt](https://letsencrypt.org/) to get an SSL cert. You'll need to be hosting JukeBot on a domain you have DNS authority over for this to work as you'll need to create a couple DNS entries.

The first thing to do after cloning this repo (or copying down) onto the deployment box is to replace a few values in `docker-compose.yml` and `traefik.toml`. In `docker-compose.yml` replace the two **localhost** references with your own domain or subdomain which points to the current box (e.g. projects.theconnman.com). In `traefik.toml` replace the email address with your own and the domain from localhost to the same one as before. Also run `touch acme.json` to create an empty credentials file.

You'll need to make sure you have DNS entries for the domain or subdomain above pointing to the current box as well as the wildcard subdomains of the given domain (e.g. \*.projects.theconnman.com). This is not only so Slack can locate your deployment, but also so Let's Encrypt can negotiate for your SSL cert.

Lastly, there is an `example.env` file provided which you should copy to `.env` and replace the contents of. Inside are example environment variables (described below) which you'll need to run JukeBot.

After that run `docker-compose up -d` and you should be able to access the UI at jukebox.my.domain.com (after replacing with your domain or subdomain of course).

## Environment Variables
- **GOOGLE_API_KEY** - Google project API key
- **SLACK_WEBHOOK** (Optional) - [Slack Incoming Webhook URL](https://my.slack.com/apps/A0F7XDUAZ-incoming-webhooks) for sending song addition and currently now playing notifications
- **SLASH_TOKEN** - [Slack Slash Token](https://my.slack.com/apps/A0F82E8CA-slash-commands) for verifying a Slash Command request
- **SERVER_URL** - JukeBot server URL for linking back
