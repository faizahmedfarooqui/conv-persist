# Conv Persist

ConvPersist is a powerful CLI tool that enables seamless and persistent conversations between users and AI assistants powered by OpenAI.

With ConvPersist, users can enjoy natural and intuitive conversations with AI assistants, all while having the option to save and revisit their past conversations at any time.

The tool's ability to persist conversations allows for a more personalized and streamlined experience, as users can pick up where they left off with their assistant without missing a beat. Whether you're looking for help with a task, seeking information, or simply want to chat, ConvPersist makes it easy to have meaningful and ongoing conversations with AI assistants.

It is build using nodejs, typescript & openai.

## Installation & Setup

```bash
# Clone the git repo
$ git clone git@github.com:faizahmedfarooqui/conv-persist.git
# Goto project directory
$ cd conv-persist
# Install NPM dependencies
$ npm install
# Recreate project's build
$ npm run build
```

## Configuration

```bash
# Create .env file
$ cp .env.example .env
```

Once you have your .env file, please add your OPENAI_API_KEY. To get your API key, please [go here](https://platform.openai.com/account/api-keys).

## Run

Before you run, it is necessary to ask a question from your AI Assistant. You can do it by using "`user: `" prefix before your questions/queries.

Once you have added your questions/queries in `chat_history.txt` file, then you can run the following command:

```bash
# Run the below mentioned command from your project's root directory
$ npm run start
```
