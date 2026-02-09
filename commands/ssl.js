const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ssl')
        .setDescription('Check SSL/TLS certificate information')
        .addStringOption(option =>
            option.setName('domain')
                .setDescription('Domain yang mau dicek (contoh: google.com)')
                .setRequired(true)),
    
    async execute(interaction) {
        let domain = interaction.options.getString('domain');
        
        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();
        
        await interaction.deferReply();
        
        try {
            const { stdout, stderr } = await execPromise(`python3 scripts/ssl_check.py "${domain}"`);
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe74c3c,
                        title: '❌ SSL Check Failed',
                        description: `**Domain:** \`${domain}\`\n\n**Error:**\n${result.error}`,
                    }],
                    ephemeral: true
                });
            }
            
            let statusColor;
            if (result.status === 'VALID') statusColor = 0x2ecc71;
            else if (result.status === 'EXPIRING SOON') statusColor = 0xf39c12;
            else statusColor = 0xe74c3c;
            
            const sanDisplay = result.san.length > 0 
                ? result.san.slice(0, 10).map(s => `• ${s}`).join('\n') + 
                  (result.san.length > 10 ? `\n... and ${result.san.length - 10} more` : '')
                : 'None';
            
            await interaction.editReply({
                embeds: [{
                    color: statusColor,
                    title: '🔐 SSL/TLS Certificate Inspector',
                    description: `${result.status_emoji} **Status:** ${result.status}\n**Domain:** \`${result.domain}\``,
                    fields: [
                        {
                            name: '📅 Validity Period',
                            value: `**Valid From:** ${result.valid_from}\n` +
                                   `**Valid Until:** ${result.valid_until}\n` +
                                   `**Days Remaining:** ${result.days_remaining} days`,
                            inline: false
                        },
                        {
                            name: '📝 Certificate Info',
                            value: `**Issued To:** \`${result.issued_to}\`\n` +
                                   `**Issued By:** \`${result.issued_by}\`\n` +
                                   `**Serial Number:** \`${result.serial_number}\``,
                            inline: false
                        },
                        {
                            name: '🔒 Encryption',
                            value: `**TLS Version:** \`${result.tls_version}\`\n` +
                                   `**Cipher Suite:** \`${result.cipher_suite}\`\n` +
                                   `**Key Bits:** \`${result.cipher_bits}\``,
                            inline: false
                        },
                        {
                            name: `📋 Subject Alternative Names (${result.san_count})`,
                            value: `\`\`\`\n${sanDisplay}\n\`\`\``,
                            inline: false
                        }
                    ],
                    footer: {
                        text: '🔐 SSL/TLS Certificate Information'
                    },
                    timestamp: new Date()
                }]
            });
            
        } catch (error) {
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Terjadi error saat checking SSL certificate!',
                ephemeral: true
            });
        }
    }
};