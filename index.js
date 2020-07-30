// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
const path = require('path');
const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter } = require('botbuilder');

// Import function to keep track of time since last break
const { TimeKeeper } = require('./timeKeeper');

// This bot's main dialog.
const { BreakBot } = require('./bot');

// Note: Ensure you have a .env file and include the MicrosoftAppId and MicrosoftAppPassword.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry 
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Create the main dialog.
const conversationReferences = {};
const timeKeeper = new TimeKeeper(sendBreakNotification);
const bot = new BreakBot(conversationReferences, timeKeeper);

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        // route to main dialog.
        await bot.run(turnContext);
    });
});

let checkForReminderInterval = 60 * 1000;
timeKeeper.startBreakTimer();
setInterval(sendReminderAtFiveMinutesLeft, checkForReminderInterval);

async function sendBreakNotification() {
    for (const conversationReference of Object.values(conversationReferences)) {
        await adapter.continueConversation(conversationReference, async turnContext => {
            // If you encounter permission-related errors when sending this message, see
            // https://aka.ms/BotTrustServiceUrl
            await turnContext.sendActivity('It is time to take a break!').catch(e => {
                throw e
             });
        }).catch(e => {
            console.log('Promise Rejection!');
         });
    }
}

// Sends a reminder that the user has 5 minutes until their break starts.
async function sendReminderAtFiveMinutesLeft() {
    console.log(timeKeeper.timeOfLastBreak);
    const fiveMinutes = 5 * 60 * 1000;
    const sixMinutes = 6 * 60 * 1000;
    if (timeKeeper.getTimeTillNextBreak() >= fiveMinutes && timeKeeper.getTimeTillNextBreak() <= sixMinutes) {
        for (const conversationReference of Object.values(conversationReferences)) {
            await adapter.continueConversation(conversationReference, async turnContext => {
                // If you encounter permission-related errors when sending this message, see
                // https://aka.ms/BotTrustServiceUrl
                await turnContext.sendActivity('Five minutes till your next break! Hope you are ready ;)').catch(e => {
                    throw e
                 });
            }).catch(e => {
                console.log('Promise Rejection!');
             });
        }
    }
}
