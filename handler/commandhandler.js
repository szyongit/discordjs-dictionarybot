import SearchCommand from '../commands/search.js'
import APICommand from '../commands/api.js'
import CreditsCommand from '../commands/about.js'

async function formCommandInteractions(client, interaction) {
    SearchCommand.formInteraction(client, interaction);
    APICommand.formInteraction(client, interaction);
    CreditsCommand.formInteraction(client, interaction);
}

export default {
    commands: [SearchCommand.JSONFormat, APICommand.JSONFormat, CreditsCommand.JSONFormat],
    formCommandInteractions: formCommandInteractions
}