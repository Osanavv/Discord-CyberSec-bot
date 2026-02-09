const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jwt')
        .setDescription('Decode JWT (JSON Web Token)')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('JWT token to decode')
                .setRequired(true)),
    
    async execute(interaction) {
        const token = interaction.options.getString('token');
        
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const escapedToken = token.replace(/[`$]/g, '\\$&');
            
            const { stdout, stderr } = await execPromise(
                `python3 scripts/jwt_decode.py "${escapedToken}"`,
                { timeout: 10000 }
            );
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe74c3c,
                        title: '❌ JWT Decode Failed',
                        description: `**Error:**\n${result.error}\n\n**Expected format:**\nheader.payload.signature`,
                    }]
                });
            }
            
            const fields = [];
            
            fields.push({
                name: '📋 Header',
                value: `\`\`\`json\n${JSON.stringify(result.header, null, 2)}\n\`\`\``,
                inline: false
            });
            
            fields.push({
                name: '🔐 Algorithm',
                value: `\`${result.algorithm}\``,
                inline: true
            });
            
            fields.push({
                name: '📝 Type',
                value: `\`${result.token_type}\``,
                inline: true
            });
            
            const payloadStr = JSON.stringify(result.payload, null, 2);
            fields.push({
                name: '📦 Payload (Claims)',
                value: `\`\`\`json\n${payloadStr.length > 900 ? payloadStr.substring(0, 900) + '...' : payloadStr}\n\`\`\``,
                inline: false
            });
            
            if (Object.keys(result.claims_analysis).length > 0) {
                let claimsText = '';
                
                if (result.claims_analysis.issued_at) {
                    claimsText += `**Issued At:** ${result.claims_analysis.issued_at.datetime}\n`;
                }
                
                if (result.claims_analysis.expiration) {
                    const exp = result.claims_analysis.expiration;
                    const status = exp.is_expired ? '🔴 EXPIRED' : '🟢 Valid';
                    claimsText += `**Expires:** ${exp.datetime} (${status})\n`;
                }
                
                if (result.claims_analysis.not_before) {
                    claimsText += `**Not Before:** ${result.claims_analysis.not_before.datetime}\n`;
                }
                
                if (claimsText) {
                    fields.push({
                        name: '⏰ Token Timing',
                        value: claimsText,
                        inline: false
                    });
                }
            }
            
            fields.push({
                name: '✍️ Signature',
                value: `\`${result.signature}\`\n\n⚠️ *Signature NOT verified - decode only!*`,
                inline: false
            });
            
            if (result.security_issues.length > 0) {
                fields.push({
                    name: '🚨 Security Issues',
                    value: result.security_issues.join('\n'),
                    inline: false
                });
            }
            
            const color = result.security_issues.length > 0 ? 0xe74c3c : 0x2ecc71;
            
            await interaction.editReply({
                embeds: [{
                    color: color,
                    title: '🎟️ JWT Decoder',
                    description: '**Token successfully decoded!**',
                    fields: fields,
                    footer: {
                        text: '⚠️ This tool only DECODES - it does NOT verify signatures!'
                    },
                    timestamp: new Date()
                }]
            });
            
        } catch (error) {
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Error decoding JWT token!',
            });
        }
    }
};