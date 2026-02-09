require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs'); 
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️ Command ${file} missing 'data' or 'execute'`);
    }
}

client.once('ready', () => {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Error executing ${interaction.commandName}:`, error);
        await interaction.reply({
            content: '❌ Terjadi error saat menjalankan command!',
            ephemeral: true
        });
    }
});

client.login(process.env.DISCORD_TOKEN);