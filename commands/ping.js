const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // DEFINE STRUCTURE COMMAND
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Cek latency bot'),
    
    // FUNCTION COMMANDS
    async execute(interaction) {
        const sent = await interaction.reply({
            content: '🏓 Pinging...',
            fetchReply: true
        });
        
        // lATENCY
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        await interaction.editReply(
            `🏓 Pong!\n` +
            `📊 Latency: ${latency}ms\n` +
            `💓 API Latency: ${apiLatency}ms`
        );
    }
};