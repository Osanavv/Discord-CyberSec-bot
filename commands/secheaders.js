const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('secheaders')
        .setDescription('Analyze security headers dari website')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL website yang mau dicek (contoh: google.com)')
                .setRequired(true)),
    
    async execute(interaction) {
        let url = interaction.options.getString('url');
        
        url = url.trim();
        
        await interaction.deferReply();
        
        try {
            const escapedUrl = url.replace(/[`$]/g, '\\$&');
            
            const { stdout, stderr } = await execPromise(
                `python3 scripts/security_headers.py "${escapedUrl}"`,
                { timeout: 15000 }
            );
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe74c3c,
                        title: '❌ Security Headers Check Failed',
                        description: `**URL:** \`${url}\`\n\n**Error:**\n${result.error}`,
                        footer: {
                            text: 'Make sure URL is accessible and valid'
                        }
                    }],
                    ephemeral: true
                });
            }
            
            let gradeColor;
            if (result.score >= 80) gradeColor = 0x2ecc71; // Green
            else if (result.score >= 60) gradeColor = 0xf39c12; // Yellow
            else gradeColor = 0xe74c3c; // Red
            
            const foundFields = [];
            for (const [header, data] of Object.entries(result.headers_found)) {
                const emoji = data.severity === 'high' ? '🟢' : data.severity === 'medium' ? '🔵' : '⚪';
                foundFields.push({
                    name: `${emoji} ${header}`,
                    value: `**Value:** \`${data.value.substring(0, 100)}${data.value.length > 100 ? '...' : ''}\`\n*${data.description}*`,
                    inline: false
                });
            }
            
            const missingFields = [];
            for (const [header, data] of Object.entries(result.headers_missing)) {
                const emoji = data.severity === 'high' ? '🔴' : data.severity === 'medium' ? '🟠' : '⚪';
                missingFields.push({
                    name: `${emoji} ${header} - MISSING`,
                    value: `*${data.description}*\n💡 ${data.recommendation}`,
                    inline: false
                });
            }
            
            const allFields = [
                {
                    name: '📊 Security Score',
                    value: `**Grade: ${result.grade}** (${result.score}/100)\n` +
                           `✅ Found: ${Object.keys(result.headers_found).length}\n` +
                           `❌ Missing: ${Object.keys(result.headers_missing).length}`,
                    inline: false
                },
                {
                    name: '🖥️ Server Info',
                    value: `**Server:** \`${result.server}\`\n**Powered By:** \`${result.powered_by}\`\n**Status:** \`${result.status_code}\``,
                    inline: false
                },
                ...foundFields.slice(0, 10),
                ...missingFields.slice(0, 12)
            ];
            
            await interaction.editReply({
                embeds: [{
                    color: gradeColor,
                    title: '🔒 Security Headers Analysis',
                    description: `**URL:** ${result.url}\n**Overall Grade:** **${result.grade}** (${result.score}/100)`,
                    fields: allFields.slice(0, 25),
                    footer: {
                        text: 'Security headers protect against common web vulnerabilities'
                    },
                    timestamp: new Date()
                }]
            });
            
        } catch (error) {
            console.error('Error:', error);
            await interaction.editReply({
                embeds: [{
                    color: 0xe74c3c,
                    title: '❌ Error',
                    description: `**Terjadi error saat analyzing security headers!**\n\n` +
                                 `**URL:** \`${url}\`\n` +
                                 `**Error:** \`${error.message}\``,
                }],
                ephemeral: true
            });
        }
    }
};