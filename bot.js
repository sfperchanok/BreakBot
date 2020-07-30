// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, TurnContext, MessageFactory, ActivityTypes, CardFactory, ActionTypes } = require('botbuilder');
const { getTimeTillNextBreak } = require('./timeKeeper');

class BreakBot extends ActivityHandler {
    constructor(conversationReferences, timeKeeper) {
        super();

        // Keeps track of time between breaks
        this.timeKeeper = timeKeeper

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
                await this.sendTimeSinceLastDateMessage(context);
            } else if (text.includes('who')) {
                await this.sendInfo(context);
            } else if (text.includes('why')) {
                await this.sendWhyYouShouldTakeBreaks(context);
            }
            else {
                // Send a card detailing what the bot can do
                await this.cardActivityAsync(context, false);
            }
        });
    }

    async sendTimeSinceLastDateMessage(context) {
        const minutes = Math.floor((this.timeKeeper.getTimeTillNextBreak() / 1000) / 60);
        await context.sendActivity(`You have ${ minutes } minutes until your next break.`);
    }

    async sendInfo(context) {
        await context.sendActivity(`I am BreakBot! I will send you reminders every hour to take a break.`);
    }

    async sendWhyYouShouldTakeBreaks(context) {
        const reply = { type: ActivityTypes.Message };
        reply.text = `Good question, breaks are important for you health and happiness. Here is a cool infographic from lifehack I found!`
        reply.attachments = [this.getInternetAttachment()];
        await context.sendActivity(reply);
    }

    /**
     * Returns an attachment to be sent to the user from a HTTPS URL.
     */
    getInternetAttachment() {
        // NOTE: The contentUrl must be HTTPS.
        return {
            name: '890x.jpg',
            contentType: 'image/jpg',
            contentUrl: 'https://cdn.lifehack.org/wp-content/uploads/2013/06/890x.jpg'
        };
    }

    async cardActivityAsync(context, isUpdate) {
        const cardActions = [
            {
                type: ActionTypes.MessageBack,
                title: 'Next Break?',
                value: null,
                text: 'NextBreak'
            },
            {
                type: ActionTypes.MessageBack,
                title: 'Who am I?',
                value: null,
                text: 'whoami'
            },
            {
                type: ActionTypes.MessageBack,
                title: 'Why do I need to take breaks?',
                value: null,
                text: 'whytakebreaks'
            },
        ];

        await this.sendWelcomeCard(context, cardActions);
    }

    async sendWelcomeCard(context, cardActions) {
        const initialValue = {
            count: 0
        };
        const card = CardFactory.heroCard(
            'What Can I Do For You?',
            '',
            null,
            cardActions
        );
        await context.sendActivity(MessageFactory.attachment(card));
    }

    addConversationReference(activity) {
        const conversationReference = TurnContext.getConversationReference(activity);
        this.conversationReferences[conversationReference.conversation.id] = conversationReference;
    }
}

module.exports.BreakBot = BreakBot;
