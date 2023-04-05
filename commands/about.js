import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const cmdName = 'about';

const commandBuilder = new SlashCommandBuilder()
.setName(cmdName)
.setDescription('Shows the about page')
.addSubcommand(subcommand =>
    subcommand
    .setName('api')
    .setDescription('Shows the about-page of the API')
)
.addSubcommand(subcommand =>
    subcommand
    .setName('bot')
    .setDescription('Shows the about-page of the bot')
)

const formInteraction = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName !== commandBuilder.name) return;

    if(interaction.options.getSubcommand() === 'api') {
        const embedBuilder = new EmbedBuilder()
        embedBuilder.setTitle('About')
        embedBuilder.setDescription('API: dictionaryapi.dev!')
        embedBuilder.setColor(0x000033);
        
        const components = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Link')
            .setStyle(ButtonStyle.Link)
            .setURL('https://dictionaryapi.dev/')
        )

        interaction.reply({embeds:[embedBuilder.toJSON()], components:[components.toJSON()]});
        return;
    }

    if(interaction.options.getSubcommand() === 'bot') {
        const embedBuilder = new EmbedBuilder()
        embedBuilder.setTitle('About')
        embedBuilder.setDescription('Version: 1.0\nCopyright © Szyon 2023')
        embedBuilder.setColor(0x000033);

        const components = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Szyon on GitHub')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/szyongit'),
            new ButtonBuilder()
            .setLabel('View Code')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/szyongit/discordjs-dictionarybot')
        )

        interaction.reply({embeds:[embedBuilder.toJSON()], components:[components.toJSON()]});
        return;
    }
    
    interaction.reply({ content:'OOPS, something went wrong!' });
}

export default {
    JSONFormat: commandBuilder.toJSON(),
    formInteraction: formInteraction
}