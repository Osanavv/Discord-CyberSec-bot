const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('headers')
        .setDescription('Analyze HTTP headers dari website')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL website yang mau dianalisis')
                .setRequired(true)),
    
    async execute(interaction) {
        const url = interaction.options.getString('url');
        
        await interaction.deferReply();
        
        try {
            const escapedUrl = url.replace(/[`$]/g, '\\$&');
            
            const { stdout, stderr } = await execPromise(
                `python3 scripts/http_headers.py "${escapedUrl}"`,
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
                        title: '❌ HTTP Headers Analysis Failed',
                        description: `**URL:** \`${url}\`\n\n**Error:**\n${result.error}`,
                    }],
                    ephemeral: true
                });
            }
            
            const fields = [];
            
            fields.push({
                name: '📊 Summary',
                value: `**Status:** \`${result.status_code}\`\n` +
                       `**Response Time:** \`${result.response_time_ms}ms\`\n` +
                       `**Total Headers:** \`${result.total_headers}\`\n` +
                       `**Redirected:** ${result.redirected ? '✅ Yes' : '❌ No'}`,
                inline: false
            });
            
            if (Object.keys(result.security_headers).length > 0) {
                const secHeaders = Object.entries(result.security_headers)
                    .slice(0, 5)
                    .map(([k, v]) => `**${k}:**\n\`${v.substring(0, 100)}${v.length > 100 ? '...' : ''}\``)
                    .join('\n\n');
                
                fields.push({
                    name: `🔒 Security Headers (${Object.keys(result.security_headers).length})`,
                    value: secHeaders,
                    inline: false
                });
            } else {
                fields.push({
                    name: '🔒 Security Headers',
                    value: '⚠️ **No security headers found!** Website vulnerable.',
                    inline: false
                });
            }
            
            if (Object.keys(result.server_headers).length > 0) {
                const serverInfo = Object.entries(result.server_headers)
                    .map(([k, v]) => `**${k}:** \`${v}\``)
                    .join('\n');
                
                fields.push({
                    name: '🖥️ Server Information',
                    value: serverInfo,
                    inline: false
                });
            }
            
            if (result.info_disclosure.length > 0) {
                fields.push({
                    name: '⚠️ Information Disclosure',
                    value: '```\n' + result.info_disclosure.join('\n') + '\n```',
                    inline: false
                });
            }
            
            if (Object.keys(result.caching_headers).length > 0) {
                const cacheHeaders = Object.entries(result.caching_headers)
                    .slice(0, 3)
                    .map(([k, v]) => `**${k}:** \`${v.substring(0, 80)}...\``)
                    .join('\n');
                
                fields.push({
                    name: `💾 Caching Headers (${Object.keys(result.caching_headers).length})`,
                    value: cacheHeaders,
                    inline: false
                });
            }
            
            if (Object.keys(result.content_headers).length > 0) {
                const contentHeaders = Object.entries(result.content_headers)
                    .slice(0, 3)
                    .map(([k, v]) => `**${k}:** \`${v}\``)
                    .join('\n');
                
                fields.push({
                    name: `📄 Content Headers (${Object.keys(result.content_headers).length})`,
                    value: contentHeaders,
                    inline: false
                });
            }
            
            if (result.cookies.length > 0) {
                const cookie = result.cookies[0];
                fields.push({
                    name: '🍪 Cookies',
                    value: `**HttpOnly:** ${cookie.has_httponly ? '✅' : '❌'}\n` +
                           `**Secure:** ${cookie.has_secure ? '✅' : '❌'}\n` +
                           `**SameSite:** ${cookie.has_samesite ? '✅' : '❌'}\n` +
                           `\`${cookie.raw}\``,
                    inline: false
                });
            }
            
            await interaction.editReply({
                embeds: [{
                    color: 0x3498db,
                    title: '📋 HTTP Headers Analysis',
                    description: `**URL:** ${result.url}\n${result.redirected ? `**Final URL:** ${result.final_url}` : ''}`,
                    fields: fields.slice(0, 25),
                    footer: {
                        text: '💡 Missing security headers = potential vulnerabilities'
                    },
                    timestamp: new Date()
                }]
            });
            
        } catch (error) {
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Terjadi error saat analyzing HTTP headers!',
                ephemeral: true
            });
        }
    }
};