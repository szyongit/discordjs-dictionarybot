import { Client, GatewayIntentBits, REST, Routes, ActivityType, InteractionResponse } from 'discord.js';
import { config } from 'dotenv';

import CommandHandler from '../handler/commandhandler.js'

config(); //dotenv

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_CLIENT_ID = process.env.BOT_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages
    ]
})
const rest = new REST({version: '10'}).setToken(BOT_TOKEN);

async function main() {
    const commands = CommandHandler.commands;

    try {
        //register commands
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(BOT_CLIENT_ID, GUILD_ID), {
            body: commands
        });

        //connect client
        client.login(BOT_TOKEN);
    } catch(err) {
        console.log(err)
    }
}

client.on('ready', (client) => {
    console.log(`${client.user.tag} has logged in!`);
    client.user.setActivity('Spelling Bee', { type:ActivityType.Competing });
})

client.on('interactionCreate', (interaction) => CommandHandler.formCommandInteractions(client, interaction));

main();