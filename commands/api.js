import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from 'node-fetch'

const cmdName = 'api';

const commandBuilder = new SlashCommandBuilder()
.setName(cmdName)
.setDescription('Test the api')
.addSubcommand(subcommand =>
    subcommand
    .setName('ping')
    .setDescription('Fetches data from the api and shows the ping!')
)

const formInteraction = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName !== commandBuilder.name) return;

    if(interaction.options.getSubcommand() === 'ping') {
        const embedBuilder = new EmbedBuilder()

        try {
            const fetchStart = Date.now();
            await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/test');
            const ping = Date.now() - fetchStart;
            let color = (ping > 1000 ? 0xFA0000 : (ping > 500) ? 0xFAFA00 : 0x00FA00);
            
            embedBuilder.setColor(color);
            embedBuilder.setTitle(`Ping: ${ping}ms`)

            interaction.reply({embeds:[embedBuilder.toJSON()]});
        } catch(err) {
            embedBuilder.setTitle(`An error occured!`)
            embedBuilder.setColor(0x000000);

            interaction.reply({embeds:[embedBuilder.toJSON()]});
        }

        return;
    }
    
    interaction.reply({ content:'OOPS, something went wrong!' });
}

export default {
    JSONFormat: commandBuilder.toJSON(),
    formInteraction: formInteraction
}