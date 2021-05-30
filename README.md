# CyBert

![CyBert](images/avatar/avatar.png)

CyBert is a Discord bot for the Iowa City Game Dev Meetup.

## Design

### Features

- CyBert introduces himself in the `#general` text channel when he first joins the Discord server.
- When a new member joins the Discord server, CyBert welcomes them in the `#general` text channel and asks them to introduce themselves.
- When someone says CyBert's name or something else robot-related in any text channel, he adds a reaction, choosing from an assortment of robot-themed emoji.
- CyBert sends reminders of upcoming events in the `#announcements` text channel, using the meetup's Google Calendar for reference.
- *_(Not yet implemented) -_* Members of the Discord server can send commands to CyBert in the `#cybert` text channel, for performing various actions.
  - *_(Not yet implemented) -_* Members can ask CyBert to add or remove discipline-specific roles to be shown under their name.
- *_(Not yet implemented) -_* If CyBert goes offline and then comes back online, he makes a funny comment about it in the `#cybert` text channel. He'll also run his "system diagnostics" and output his version number.

### Personality

CyBert is a well-meaning but socially awkward robot. He tries his best to make everyone feel comfortable and welcomed, and he also tries to keep people informed of what's going on. He sometimes has problems with controlling himself, and he often makes cute robot noises. He tends to speak in somewhat short sentences, never uses contractions, and sometimes uses uncommon ("fancy" or "intellectual") words.

### Design principles

Features of CyBert should either be helpful or fun. Features that could be annoying should be avoided. For features that aren't innately annoying but might generate notifications frequently enough where it could be annoying, these should be contained within the `#cybert` text channel, so members can easily disable the notifications if they want.

### Avatar

CyBert's avatar was created using [Krita](https://krita.org/). Both the Krita project file and the PNG image are located in the `images/avatar` directory.

## Development

### Prerequisites

In order to run and test CyBert on your local machine, you'll need the following:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop):** This project is set up to run inside a Docker container, both in production and in the development environment.
- **[EditorConfig](https://editorconfig.org/):** This is a tool for helping maintain consistent code formatting between different editors. Some editors/IDEs come with it preinstalled, but for others, you'll need to download it as an extension. When it's installed, it will automatically read the project's `.editorconfig` file and use the settings it specifies.
- **A Discord account:** You'll need this in order to create a bot account to connect CyBert to, and to create a Discord server for testing your locally running instance of CyBert.
- **[Node.js](https://nodejs.dev/) (optional):** You don't technically need this in order to run the project, since it's installed inside the Docker image. However, downloading the project dependencies by running `npm install` at the project root will enable your IDE to do a better job with syntax handling and autocomplete.

### Tech stack

This project is built with the following technologies:

- **[Node.js](https://nodejs.dev/)**, for running server-side JavaScript.
- **[TypeScript](https://www.typescriptlang.org/)**, for making it easier and less error-prone to write JavaScript code.
- **[EditorConfig](https://editorconfig.org/)**, for maintaining consistent code formatting between different editors.
- **[ESLint](https://eslint.org/)**, for ensuring clean and correct TypeScript syntax.
- **[Jasmine](https://jasmine.github.io/)**, for unit testing.
- **[Discord.js](https://discord.js.org/)**, for integrating with the Discord API.
- **[Docker](https://www.docker.com/products/docker-desktop)**, for running the project both in the development environment and in production.
- **[GitHub Actions](https://github.com/features/actions)**, for building and deploying the project.
- **[Railway](https://railway.app/)**, for free cloud hosting.

### Creating a Discord bot account and connecting it to a Discord server

CyBert works by connecting to Discord via a bot account. Once it's connected, it will use the Discord API (through the [Discord.js](https://discord.js.org/) library) to receive events from the Discord server the bot account is a member of, and to send requests for performing actions in that Discord server.

To create a bot account, follow these steps:

1. Using your browser, navigate to [https://discord.com/developers/applications](https://discord.com/developers/applications) and log in to your Discord account.
2. You first need to create a Discord application to put the bot account inside. Click the "New Application" button, enter a name for it (this could be something like "<your-name>'s Test Application"), and click "Create".
3. Navigate to the "Bot" tab of your application and click "Add Bot". It will ask for confirmation.
4. Once the bot account has been created, you can change its username to whatever you want (probably something like "CyBert Test"). You also need to turn on the "Server Members Intent" option under "Privileged Gateway Intents". This will allow the bot account to receive events when new members join the Discord server it's a member of. Save your changes.

After your bot account has been set up, you can add it as a member of a Discord server (you should create your own test server for this in Discord). Use a browser to navigate to the URL [https://discord.com/api/oauth2/authorize?client_id=&lt;applicationId&gt;&permissions=1342655552&scope=bot](https://discord.com/api/oauth2/authorize?client_id=<applicationId>&permissions=1342655552&scope=bot), replacing `<applicationId>` with the ID of the application you created in the previous steps (this can be found under "Application ID" in the application's "General Information" tab). Follow the steps shown to add the bot user to your test Discord server).

#### Making emoji available

In order for CyBert to add emoji responses to messages, the bot account will need access to the emoji in the `images/emoji` directory. A bot account has access to all emoji in all Discord servers it's a member of, so you'll need to upload the emoji either to the main server CyBert is active in, or to an alternate server the bot account is also a member of. CyBert finds the emoji by name, so their names need to be the same as their filenames in this repo (excluding the file extension).

_**Note:** All the emoji used here were downloaded from [discordemojis.com](https://discordmojis.com/)._

### Running CyBert on your machine

Before running CyBert, you'll need to create a `.env` file at the project root, containing the single line `BOT_TOKEN=<bot-token>`, replacing `<bot-token>` with the token of your bot account (see [the previous section](#creating-a-discord-bot-account-and-connecting-it-to-a-discord-server) for how to create a bot account). The bot account's token can be found under "Token" on the settings page for the bot account. This `.env` file is used by Docker Compose to set the `BOT_TOKEN` environment variable (as specified in `docker-compose.yml` and `docker-compose-prod.yml`), which CyBert uses to get the token for connecting to Discord.

#### Development mode

To run the project in development mode, run the command `docker compose up --build` from the project root. This will build the `develop` stage of the Dockerfile and then run the resulting image inside a container (as specified in `docker-compose.yml`). It will also mount your local `src` directory inside the container, in order to auto-reload the application when code changes are made.

#### Production mode

To run the project in production mode, run the command `docker compose -f docker-compose-prod.yml up --build` from the project root. This will build the `production` stage of the Dockerfile and then run the resulting image inside a container (as specified in `docker-compose-prod.yml`).

### Version control

#### Branching

The branching in this project consists of the `main` branch, the `develop` branch, and zero or more `feature` and `bugfix` branches (these will be created and deleted as they are needed).

- **The `main` branch:** The code in this branch is considered ready to deploy to production at any point in time. In fact, when a push is made to the `main` branch, the GitHub Actions workflow will automatically deploy a new version to production and push a new version tag to Git. The only way the `main` branch should be modified is by merging the `develop` branch into it.
- **The `develop` branch:** This branch is for integrating and testing new code to make sure it's ready to be pushed to production. This branch shouldn't be pushed to directly - it will be modified by merging `feature` and `bugfix` branches into it.
- **`feature` branches:** A `feature` branch is created off of the `develop` branch for the purpose of developing a new feature. Its name should follow the pattern `feature/<name-of-feature>`, where `<name-of-feature>` is replaced with the name or a short description of the feature. Once the code is completed and pushed to the `feature` branch, a pull request should be made to merge it into the `develop` branch.
- **`bugfix` branches:** A `bugfix` branch is created off of the `develop` branch for the purpose of fixing a bug. Its name should follow the pattern `bugfix/<name-of-bug>`, where `<name-of-bug>` is replaced with the name or a short description of the bug. Once the code is completed and pushed to the `bugfix` branch, a pull request should be made to merge it into the `develop` branch.

#### Versioning

This project uses [semantic versioning](https://semver.org/) for its version numbers. The version number is automatically calculated by the GitHub Actions workflow, using version Git tags and commit messages. When you are making a commit that adds a new feature, you should add `(semver:bump-minor)` inside your commit message. If you are making a commit that introduces an API breaking change (the interface between Discord members and CyBert is considered the "API"), you should add `(semver:bump-major)` inside your commit message.

*_Note: These tags must be in the subject line of the commit message (not the body) in order to work._*

### Contributing

If you are a member of the Iowa City Game Dev Meetup and thought of a feature you'd like to add to CyBert, please run the idea by the meetup organizers. Once the feature is agreed on, you can create a new feature branch. Once your code is written and pushed to your branch, create a pull request to merge your branch into the `develop` branch.
