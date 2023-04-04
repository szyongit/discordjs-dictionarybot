import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from 'node-fetch'

const cmdName = 'search';

const commandBuilder = new SlashCommandBuilder()
.setName(cmdName)
.setDescription('Search for a term in the dictionary')
.addStringOption(option => 
    option
    .setName('term')
    .setDescription('The term to search for')
    .setRequired(true)
)

const components = new ActionRowBuilder()
.addComponents(
    new ButtonBuilder()
    .setCustomId('prev_page')
    .setEmoji('◀️')
    .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
    .setCustomId('next_page')
    .setEmoji('▶️')
    .setStyle(ButtonStyle.Secondary)
);


const searchData = {}

function handleEmbeds(page, fetchData) {
    const embedBuilder = new EmbedBuilder()

    if(page == -1) {
        embedBuilder.setTitle('Dictionary');
        embedBuilder.addFields({ name:'Error', value:'No Definition Found!' })
        return {embed:embedBuilder.toJSON()};
    }

    if(page > 2) page = 1;
    if(page < 1) page = 2;

    embedBuilder.setTitle(`Dictionary: ${fetchData.word}`)
    embedBuilder.setTimestamp()
    embedBuilder.setFooter({text:`${fetchData.word}:${page}`})

    //definitions
    if(page == 1) {
        const fields = [];
        let nounDefs = fetchData.meanings.filter((element) => {
            return element.type == 'noun';
        });
        let verbDefs = fetchData.meanings.filter((element) => {
            return element.type == 'verb';
        });
        let adjDefs = fetchData.meanings.filter((element) => {
            return element.type == 'adjective';
        });

        if(nounDefs[0]) {
            nounDefs = nounDefs[0].definitions;

            if(nounDefs) {
                let fieldValue = "";
            
                for(let i = 0; i < (nounDefs.length < 3 ? nounDefs.length : 3); i++) {
                    fieldValue = fieldValue.concat(nounDefs[i].definition, '\n\n');
                }
    
                fields.push({name:`Definitions (noun):`, value:fieldValue});
                fields.push({name:'\u200b', value:'\u200b'});
            }
        }
        if(verbDefs[0]) {
            verbDefs = verbDefs[0].definitions;
            
            if(verbDefs) {
                let fieldValue = "";
            
                for(let i = 0; i < (verbDefs.length < 3 ? verbDefs.length : 3); i++) {
                    fieldValue = fieldValue.concat(verbDefs[i].definition, '\n\n');
                }

                fields.push({name:`Definitions (verb):`, value:fieldValue});
            }
        }
        if(adjDefs[0]) {
            adjDefs = adjDefs[0].definitions;

            let fieldValue = "";
        
            for(let i = 0; i < (adjDefs.length < 3 ? adjDefs.length : 3); i++) {
                fieldValue = fieldValue.concat(adjDefs[i].definition, '\n\n');
            }

            fields.push({name:`Definitions (adjective):`, value:fieldValue});
        }
        
        embedBuilder.addFields(fields);
        return {embed:embedBuilder.toJSON()};
    }

    //phonetics & audio
    if(page == 2) {
        
        const phoneticsData = fetchData.phonetics;
        let fieldValue = "";

        for(let i = 0; i < phoneticsData.length; i++) {
            fieldValue = fieldValue.concat(phoneticsData[i].text, '\n');
        }

        embedBuilder.addFields({name:'Phonetics:', value:fieldValue});

        if(fetchData.audios.length > 1) {
            return {embed:embedBuilder.toJSON(), audios:fetchData.audios};
        } else {
            return {embed:embedBuilder.toJSON()};
        }
    }

    return {embed:embedBuilder.toJSON()};
}

async function fetchDict(term) {
    return new Promise((resolve, reject) => {
        if(searchData[term]) resolve(searchData[term]);

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`)
        .then((response) => response.json())
        .then((data) => {
            if(data.title === 'No Definitions Found') {
                reject(data.title);
                return;
            }

            const word = data[0].word;
            const phonetics = data[0].phonetics;
            const meanings = data[0].meanings;

            let phoneticsData = undefined;
            let meaningsData = undefined;
            let audioData = undefined;
    
            if(phonetics.length >= 1) {
                phoneticsData = [];
                audioData = [];
                for(let i = 0; i < phonetics.length; i++) {
                    const phonetic = phonetics[i];

                    phoneticsData.push({ text:phonetic.text || undefined })
                    if(phonetic.audio) audioData.push(phonetics[i].audio);
                }
            }
            
            if(meanings.length >= 1) {
                meaningsData = [];
                for(let i = 0; i < meanings.length; i++) {
                    meaningsData.push({
                        type:meanings[i].partOfSpeech,
                        definitions:meanings[i].definitions
                    })
                }
            }

            const fetchData = {
                word:word,
                phonetics:phoneticsData,
                meanings:meaningsData,
                audios:audioData
            }

            resolve(fetchData);
        })
    })
}

const formInteraction = async (client, interaction) => {
    if(interaction.isChatInputCommand()) {
        if(interaction.commandName !== commandBuilder.name) return;
        const term = interaction.options.getString('term');
        await fetchDict(term).then(fetchData => {
            searchData[term] = fetchData;

            const embedHandler = handleEmbeds(1, searchData[term]);

            if(embedHandler.audios) {
                interaction.reply({embeds:[embedHandler.embed], files:embedHandler.audios, components:[components.toJSON()]});
            } else {
                interaction.reply({embeds:[embedHandler.embed], components:[components.toJSON()]});
            }
        }).catch(err => {
            const embedHandler = handleEmbeds(-1, null);
            interaction.reply({embeds:[embedHandler.embed]});
        })
        return;
    }

    if(interaction.isButton()) {
        const message = interaction.message;
        if(message.author.id != client.user.id) return;

        const embeds = message.embeds;
        if(embeds.length == 0) return;

        const footer = embeds[0].footer.text;
        const sliced = footer.split(':');
        const term = sliced[0];
        let page = parseInt(sliced[1]);

        if(interaction.customId == 'prev_page') {
            page -= 1;
        }
        if(interaction.customId == 'next_page') {
            page += 1;
        }

        const embedHandler = handleEmbeds(page, searchData[term]);

        if(embedHandler.audios) {
            interaction.update({embeds:[embedHandler.embed], files:embedHandler.audios, components:[components.toJSON()]});
        } else {
            interaction.update({embeds:[embedHandler.embed], files:[], components:[components.toJSON()]});
        }
    }
}

export default {
    JSONFormat: commandBuilder.toJSON(),
    formInteraction: formInteraction
}