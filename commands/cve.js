const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cve')
        .setDescription('Search CVE (Common Vulnerabilities and Exposures) database')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('CVE-ID (CVE-2021-44228) atau keyword (log4j, apache)')
                .setRequired(true)),
    
    async execute(interaction) {
        const query = interaction.options.getString('query');
        
        await interaction.deferReply();
        
        try {
            const { stdout, stderr } = await execPromise(
                `python3 scripts/cve_lookup.py "${query}"`,
                { timeout: 20000 }
            );
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe74c3c,
                        title: '❌ CVE Lookup Failed',
                        description: `**Query:** \`${query}\`\n\n**Error:**\n${result.error}`,
                        footer: {
                            text: 'NVD API has rate limits - try again in a few seconds'
                        }
                    }],
                    ephemeral: true
                });
            }
            
            if (!result.found) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe67e22,
                        title: '🔍 CVE Search',
                        description: `**Query:** \`${query}\`\n\n❌ No CVE found.\n\n**Tips:**\n• Try CVE-ID format: CVE-2021-44228\n• Try broader keywords: apache, linux, windows`,
                    }]
                });
            }
            
            const embeds = [];
            
            embeds.push({
                color: 0x3498db,
                title: '🔍 CVE Search Results',
                description: `**Query:** \`${result.query}\`\n**Total Results:** ${result.total_results}\n**Showing:** ${result.returned} results`,
                footer: {
                    text: 'Data from NVD (National Vulnerability Database)'
                },
                timestamp: new Date()
            });
            
            for (const cve of result.cves.slice(0, 4)) {
                const severityColor = {
                    'CRITICAL': 0x8b0000,
                    'HIGH': 0xe74c3c,
                    'MEDIUM': 0xf39c12,
                    'LOW': 0xf1c40f,
                    'N/A': 0x95a5a6
                };
                
                const severityEmoji = {
                    'CRITICAL': '🔴',
                    'HIGH': '🟠',
                    'MEDIUM': '🟡',
                    'LOW': '🟢',
                    'N/A': '⚪'
                };
                
                const color = severityColor[cve.severity] || 0x95a5a6;
                const emoji = severityEmoji[cve.severity] || '⚪';
                
                embeds.push({
                    color: color,
                    title: `${emoji} ${cve.id}`,
                    description: cve.description,
                    fields: [
                        {
                            name: '📊 CVSS Score',
                            value: `**${cve.cvss_score}** (${cve.severity})`,
                            inline: true
                        },
                        {
                            name: '📅 Published',
                            value: cve.published,
                            inline: true
                        },
                        {
                            name: '🔗 References',
                            value: cve.references.length > 0 
                                ? cve.references.slice(0, 2).map(r => `[Link](${r})`).join('\n')
                                : 'No references available',
                            inline: false
                        }
                    ]
                });
            }
            
            if (result.total_results > result.returned) {
                embeds[0].description += `\n\n💡 *${result.total_results - result.returned} more results available. Refine your search for specific CVEs.*`;
            }
            
            await interaction.editReply({
                embeds: embeds
            });
            
        } catch (error) {
            console.error('Error:', error);
            await interaction.editReply({
                embeds: [{
                    color: 0xe74c3c,
                    title: '❌ Error',
                    description: 'Terjadi error saat CVE lookup!\n\n**Possible causes:**\n• NVD API timeout\n• Rate limit exceeded\n• Network issues',
                }],
                ephemeral: true
            });
        }
    }
};