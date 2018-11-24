# JukeBot

[Demo](https://demo.jukebot.club/)

[![Build Status](https://travis-ci.org/TheConnMan/jukebot.svg?branch=master)](https://travis-ci.org/TheConnMan/jukebot) [![Docker Pulls](https://img.shields.io/docker/pulls/theconnman/jukebot.svg)](https://hub.docker.com/r/theconnman/jukebot/)

Slack-Enabled Synchronized Music Listening

![JukeBot](https://raw.githubusercontent.com/TheConnMan/jukebot/dev/assets/images/JukeBot-Screenshot.png)

**JukeBot** is for Slack teams who want to listen to music together, add music through Slack, and chat about the music in a Slack channel.

## Setup

### Google API Key for YouTube

1. Go to <https://console.developers.google.com>
2. Create a new Google Project named JukeBot
3. Under **Create credentials** choose **API key** and use the API key for the environment variable below
4. Click **Library** in the left panel
5. Go to **YouTube Data API**
6. Click **Enable** at the top

## Deployment

**JukeBot** can easily be run with Docker using the following command:

```bash
docker run -d -p 80:1337 -e GOOGLE_API_KEY=<your-API-key> theconnman/jukebot:latest
```

Make sure to add any additional environment variables as well to the above command. Then go to the URL of your server and listen to some music!

## Running with MySQL

The default database is on disk, so it is recommended to run **JukeBot** with a MySQL DB in production. Use the following environment variables:

- MYSQL_HOST (MySQL will be used as the datastore if this is supplied)
- MYSQL_USER (default: sails)
- MYSQL_PASSWORD (default: sails)
- MYSQL_DB (default: sails)

The easiest way to run a MySQL instance is to run it in Docker using the following command:

```bash
docker run -d -p 3306:3306 -e MYSQL_DATABASE=sails -e MYSQL_USER=sails -e MYSQL_PASSWORD=sails -e MYSQL_RANDOM_ROOT_PASSWORD=true --name=mysql mysql:5 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

Take a look at the `docker-compose.yml` file for a full setup of **JukeBot**, MySQL, and Traefik (a reverse proxy for HTTPS support).

## Environment Variables

- **GOOGLE_API_KEY** - Google project API key
- **GOOGLE_ID** (Optional) - Google OAuth application ID (set up a [Google App](https://cloud.google.com/console#/project), create OAuth credentials, and enable the Google+ API) - **NOTE:** Persistence of user properties and favorites is disabled if this is not provided
- **GOOGLE_SECRET** (Optional) - Google OAuth secret key - **NOTE:** Persistence of user properties and favorites is disabled if this is not provided
- **SLACK_WEBHOOK** (Optional) - [Slack Incoming Webhook URL](https://my.slack.com/apps/A0F7XDUAZ-incoming-webhooks) for sending song addition and currently now playing notifications (for multiple webhooks delimit them with a comma)
- **SLACK_SONG_ADDED** (default: true) - Toggle for "Song Added" Slack notifications, only applicable if **SLACK_WEBHOOK** is provided
- **SLACK_SONG_PLAYING** (default: true) - Toggle for "New Song Playing" Slack notifications, only applicable if **SLACK_WEBHOOK** is provided
- **SLACK_SONG_LINKS** (default: false) - Toggle for Slack notifications to contain unfurled YouTube video links, only applicable if **SLACK_WEBHOOK** is provided
- **SLASH_TOKEN** (Optional) - [Slack Slash Token](https://my.slack.com/apps/A0F82E8CA-slash-commands) for verifying a Slash Command request, only required if a Slash Command is set up (for multiple slash tokens delimit them with a comma)
- **SERVER_URL** (Optional) - JukeBot server URL for linking back, only needed if **SLACK_WEBHOOK** is provided
- **GOOGLE_ANALYTICS_ID** (Optional) - [Google Analytics](https://analytics.google.com/) Tracking ID for site analytics
- **VIDEO_HISTORY** (default: 24 * 60) - Number of minutes played videos will stay in the video playlist
- **CHAT_HISTORY** (default: 24 * 60) - Number of minutes chats will stay in the chat bar
- **AUTOPLAY_DISABLE_STREAK** (default: 10) - Disable autoplay if this many songs are autoplayed in a row, useful in case everyone is AFK
- **FLUENTD_HOST** (Optional) Fluent host for logging
- **FLUENTD_TAGS** (Optional) Add FluentD context tags (format is tag:value,tag2:value2)

## Advanced Setup

**JukeBot** can be set up with HTTPS fairly easily. This is not required to use **JukeBot**, but is required if you want to use Slack slash commands.

### Deployment with HTTPS (Required when using a Slash Command)

Slack Slash Commands require the slash command endpoint to be HTTPS, so JukeBot uses [Let's Encrypt](https://letsencrypt.org/) to get an SSL cert. You'll need to be hosting JukeBot on a domain you have DNS authority over for this to work as you'll need to create a couple DNS entries. Make sure you have entries pointing to the current box for the domain or subdomain to be used in the deployment as well as the wildcard subdomains of the given domain (e.g. *.projects.theconnman.com). This is not only so Slack can locate your deployment, but also so Let's Encrypt can negotiate for your SSL cert.

Within this project are three files needing to be modified when deploying this project to your own server: `docker-compose.yml`, `traefik.toml`, and `.env`.

#### `docker-compose.yml`

1. Replace the two **localhost** references with your own domain or subdomain which points to the current box (e.g. projects.theconnman.com).
2. Update the volume paths so they point to the correct location in your host.

#### `traefik.toml`

1. Replace the email address with your own and the domain from localhost to the same one as before.
2. After saving that file, issue a `touch acme.json` to create an empty credentials file.

#### `example.env`

1. Copy the provided example.env file to `.env`.
2. Modify the example environment variables (described below) before running JukeBot.

After that run `docker-compose up -d` and you should be able to access the UI at jukebox.my.domain.com (after replacing with your domain or subdomain of course).

### Slash Command (Optional)

To use a Slack Slash Command you'll need to set one up (preferably after the running the deployment steps below) and follow these instructions:

1. Go to the [Slack Slash Command setup page](https://my.slack.com/apps/A0F82E8CA-slash-commands), add a configuration, and name it **JukeBot**
2. Input the URL you configure during the deployment step and add a trailing `/slack/slash` (e.g. jukebot.my.domain.com/slack/slash)
3. Change the request method to GET
4. Copy the **Token** and use it as the **SLASH_TOKEN** environment variable
5. Customize the name to **JukeBot**
6. Check the box to "Show this command in the autocomplete list"
7. Add the description "Slack-Enabled Synchronized Music Listening"
8. Add the usage hint "add

  <youtube-url> - Add a YouTube video to the playlist"</youtube-url>

9. Click save!

## Development

Thank you for considering **JukeBot** development! Below are some steps to get you started:

## Local Development

To get started with local development follow these steps:

1. Clone this repo and `cd` into it
2. Install **JukeBot** dependencies with `npm install` (make sure you're on npm v3+)
3. Get a Google API key using the setup steps below
4. Run **JukeBot** with `GOOGLE_API_KEY=<your-API-key> npm start` and go to <http://localhost:1337>

### Developing with MySQL

Using MySQL automatically sets the migration strategy to `safe`, so running with MySQL requires you to run `npm migrate` with the appropriate environment variables to bring the DB schema up to speed.

When developing a new migration script run `grunt db:migrate:create --name=<migration-name>` and implement the `up` and `down` steps once the migration is created.
