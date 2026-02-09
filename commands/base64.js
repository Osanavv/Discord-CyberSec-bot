const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64')
        .setDescription('Encode atau decode Base64')
        .addSubcommand(subcommand =>
            subcommand
                .setName('encode')
                .setDescription('Encode text ke Base64')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text yang mau di-encode')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('decode')
                .setDescription('Decode Base64 ke text')
                .addStringOption(option =>
                    option.setName('base64')
                        .setDescription('Base64 string yang mau di-decode')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        try {
            if (subcommand === 'encode') {
                const text = interaction.options.getString('text');
                const encoded = Buffer.from(text).toString('base64');
                
                await interaction.reply({
                    embeds: [{
                        color: 0x3498db,
                        title: '📤 Base64 Encoder',
                        fields: [
                            {
                                name: '📝 Original',
                                value: `\`\`\`${text}\`\`\``,
                                inline: false
                            },
                            {
                                name: '🔐 Encoded',
                                value: `\`\`\`${encoded}\`\`\``,
                                inline: false
                            }
                        ],
                        timestamp: new Date()
                    }]
                });
            } else if (subcommand === 'decode') {
                const base64 = interaction.options.getString('base64');
                const decoded = Buffer.from(base64, 'base64').toString('utf-8');
                
                await interaction.reply({
                    embeds: [{
                        color: 0x9b59b6,
                        title: '📥 Base64 Decoder',
                        fields: [
                            {
                                name: '🔐 Encoded',
                                value: `\`\`\`${base64}\`\`\``,
                                inline: false
                            },
                            {
                                name: '📝 Decoded',
                                value: `\`\`\`${decoded}\`\`\``,
                                inline: false
                            }
                        ],
                        timestamp: new Date()
                    }]
                });
            }
        } catch (error) {
            await interaction.reply({
                content: '❌ Invalid Base64 string atau terjadi error!',
                ephemeral: true
            });
        }
    }
};