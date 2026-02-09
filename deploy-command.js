require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

// REST API
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// DEPLOY
(async () => {
    try {
        console.log(`🔄 Registering ${commands.length} slash commands...`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Successfully registered ${data.length} commands!`);
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();