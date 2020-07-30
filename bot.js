// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, TurnContext } = require('botbuilder');
let timeOfLastBreak = require('./index');
const { time } = require('console');

class BreakBot extends ActivityHandler {
    constructor(conversationReferences) {
        super();

        // Dependency injected dictionary for storing ConversationReference objects used in NotifyController to proactively message users
        this.conversationReferences = conversationReferences;

        this.onConversationUpdate(async (context, next) => {
            this.addConversationReference(context.activity);

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const welcomeMessage = `Welcome to BreakBot! I will remind you when you need to take breaks :)
                                            Here are some commands you can give BreakBot:`;
                    await context.sendActivity(welcomeMessage);
                    await this.sendBotCommands(context);
                    await next();
                }
            }
            await next();
        });

        this.onMessage(async (context, next) => {
            this.addConversationReference(context.activity);

            TurnContext.removeRecipientMention(context.activity);
            const text = context.activity.text.trim().toLocaleLowerCase();
            if (/^\d+$/.test(text)) {
                await context.sendActivity('in the digits');
                let duration = context.activity.text.trim().toLocaleLowerCase();
                // convert to milliseconds
                this.timekeeper.breakInterval = parseInt(duration, 10) * 60000;
            } else if ((text.includes('set') || text.includes('change')) && (text.includes('time') || text.includes('interval'))) {
                await context.sendActivity('How often would you like to take a break? Fill in the blank: Once every __ minutes.');
            } else if (text.includes('next') && text.includes('break')) {
                await this.sendTimeSinceLastDateMessage();
            } else {
                // give the list of prompts the bot understands
                await context.sendActivity('Sorry, I couldn\'t understand you. Try:');
                await this.sendBotCommands(context);
            }
            await next();
        });
    }
    // this method causes an error FYI (doesn't stop the bot from running though)
    async sendTimeSinceLastDateMessage() {
        const currentTime = (new Date()).getTime()
        const minutesSinceLastBreak = ((Math.abs(currentTime - timeOfLastBreak)) / 1000) / 60;
        await context.sendActivity('It has been ${minutesSinceLastBreak} minutes since your last break.');
    }

    addConversationReference(activity) {
        const conversationReference = TurnContext.getConversationReference(activity);
        this.conversationReferences[conversationReference.conversation.id] = conversationReference;
    }

    async sendBotCommands(context) {
        await context.sendActivity(`Ask Breakbot:
                                    \n- When is my next break?
                                    \n- Set time until next break`);
    }
}

module.exports.BreakBot = BreakBot;
