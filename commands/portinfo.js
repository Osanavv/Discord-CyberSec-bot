const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portinfo')
        .setDescription('Lookup informasi tentang port tertentu')
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('Port number (1-65535)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(65535)),
    
    async execute(interaction) {
        const port = interaction.options.getInteger('port');
        
        await interaction.deferReply();
        
        try {
            const { stdout, stderr } = await execPromise(`python3 scripts/port_info.py ${port}`);
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    content: `❌ Error: ${result.error}`,
                    ephemeral: true
                });
            }
            
            if (!result.found) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe67e22,
                        title: '🔌 Port Information',
                        description: `**Port:** \`${result.port}\`\n\n❌ Port tidak ditemukan dalam database common ports.`,
                        fields: [
                            {
                                name: '📊 Port Range',
                                value: result.port_range,
                                inline: false
                            }
                        ],
                        footer: {
                            text: 'Try common ports: 22, 80, 443, 3306, 3389, etc.'
                        }
                    }]
                });
            }
            
            let riskColor;
            if (result.risk_level === 'high') riskColor = 0xe74c3c;
            else if (result.risk_level === 'medium') riskColor = 0xf39c12;
            else riskColor = 0x2ecc71;
            
            const riskEmoji = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢',
                'unknown': '⚪'
            };
            
            const fields = [
                {
                    name: '📝 Service',
                    value: `\`${result.service}\``,
                    inline: true
                },
                {
                    name: '🔌 Protocol',
                    value: `\`${result.protocol}\``,
                    inline: true
                },
                {
                    name: '⚠️ Risk Level',
                    value: `${riskEmoji[result.risk_level]} **${result.risk_level.toUpperCase()}**`,
                    inline: true
                },
                {
                    name: '📖 Description',
                    value: result.description,
                    inline: false
                }
            ];
            
            if (result.common_exploits && result.common_exploits.length > 0) {
                fields.push({
                    name: '⚔️ Common Exploits/Vulnerabilities',
                    value: result.common_exploits.map(e => `• ${e}`).join('\n'),
                    inline: false
                });
            }
            
            if (result.security_notes) {
                fields.push({
                    name: '🛡️ Security Notes',
                    value: result.security_notes,
                    inline: false
                });
            }
            
            await interaction.editReply({
                embeds: [{
                    color: riskColor,
                    title: '🔌 Port Information',
                    description: `**Port:** \`${result.port}\``,
                    fields: fields,
                    footer: {
                        text: '💡 Always follow security best practices when exposing services'
                    },
                    timestamp: new Date()
                }]
            });
            
        } catch (error) {
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Terjadi error saat port lookup!',
                ephemeral: true
            });
        }
    }
};