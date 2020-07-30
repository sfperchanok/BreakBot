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
                    const welcomeMessage = 'Welcome to BreakBot! I will remind you when you need to take breaks :)';
                    await context.sendActivity(welcomeMessage);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMessage(async (context, next) => {
            this.addConversationReference(context.activity);

            TurnContext.removeRecipientMention(context.activity);
            const text = context.activity.text.trim().toLocaleLowerCase();
            if (text.includes('next') && text.includes('break')) {
                await this.sendTimeSinceLastDateMessage();
            } else {
                // Echo back what the user said
                await context.sendActivity(`You sent '${ context.activity.text }'`);
                await next();
            }
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
}

module.exports.BreakBot = BreakBot;