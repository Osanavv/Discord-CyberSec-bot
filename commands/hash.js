const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hash')
        .setDescription('Generate hash dari text')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text yang mau di-hash')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('algorithm')
                .setDescription('Algoritma hash yang digunakan')
                .setRequired(true)
                .addChoices(
                    { name: 'MD5', value: 'md5' },
                    { name: 'SHA-1', value: 'sha1' },
                    { name: 'SHA-256', value: 'sha256' },
                    { name: 'SHA-512', value: 'sha512' }
                )),
    
    async execute(interaction) {
        const text = interaction.options.getString('text');
        const algorithm = interaction.options.getString('algorithm');
        
        try {
            // GENERATE HASHHH
            const hash = crypto.createHash(algorithm).update(text).digest('hex');
            
            // RESPON
            await interaction.reply({
                embeds: [{
                    color: 0x00ff00,
                    title: '🔐 Hash Generator',
                    fields: [
                        {
                            name: '📝 Original Text',
                            value: `\`\`\`${text}\`\`\``,
                            inline: false
                        },
                        {
                            name: '🔑 Algorithm',
                            value: `\`${algorithm.toUpperCase()}\``,
                            inline: true
                        },
                        {
                            name: '📊 Hash Length',
                            value: `\`${hash.length} chars\``,
                            inline: true
                        },
                        {
                            name: '🔒 Hash Result',
                            value: `\`\`\`${hash}\`\`\``,
                            inline: false
                        }
                    ],
                    footer: {
                        text: '⚠️ MD5 & SHA-1 sudah tidak aman untuk password!'
                    },
                    timestamp: new Date()
                }]
            });
        } catch (error) {
            await interaction.reply({
                content: `❌ Error: ${error.message}`,
                ephemeral: true
            });
        }
    }
};

