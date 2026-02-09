const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sqli')
        .setDescription('Generate SQL injection payloads (AUTHORIZED USE ONLY!)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of SQL injection')
                .setRequired(false)
                .addChoices(
                    { name: 'All Categories', value: 'all' },
                    { name: 'Auth Bypass', value: 'auth_bypass' },
                    { name: 'UNION-based', value: 'union_based' },
                    { name: 'Error-based', value: 'error_based' },
                    { name: 'Boolean-based Blind', value: 'boolean_based' },
                    { name: 'Time-based Blind', value: 'time_based' },
                    { name: 'Stacked Queries', value: 'stacked_queries' },
                    { name: 'WAF/Filter Bypass', value: 'filter_bypass' }
                )),
    
    async execute(interaction) {
        const type = interaction.options.getString('type') || 'all';
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_sqli')
                    .setLabel('✅ Saya Mengerti')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_sqli')
                    .setLabel('❌ Batalkan')
                    .setStyle(ButtonStyle.Danger)
            );
        
        const disclaimerMsg = await interaction.reply({
            embeds: [{
                color: 0xe74c3c,
                title: '⚠️ LEGAL DISCLAIMER',
                description: '**SQL Injection Payload Generator**\n\n' +
                             '🚨 **AUTHORIZED USE ONLY!**\n\n' +
                             '**Legal uses:**\n' +
                             '✅ Authorized penetration testing\n' +
                             '✅ Bug bounty programs (with scope)\n' +
                             '✅ Testing YOUR OWN applications\n' +
                             '✅ Educational/learning purposes\n' +
                             '✅ CTF competitions\n\n' +
                             '**ILLEGAL:**\n' +
                             '❌ Unauthorized testing\n' +
                             '❌ Attacking systems without permission\n' +
                             '❌ Any malicious activity\n\n' +
                             '**Timeout: 60 detik**',
                footer: {
                    text: 'Unauthorized access is a CRIME in most countries!'
                }
            }],
            components: [row],
            ephemeral: true,
            fetchReply: true
        });
        
        const collector = disclaimerMsg.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000,
            max: 1
        });
        
        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'confirm_sqli') {
                await buttonInteraction.update({
                    embeds: [{
                        color: 0xf39c12,
                        title: '⏳ Generating Payloads...',
                        description: 'Please wait while generating SQL injection payloads...',
                    }],
                    components: []
                });
                
                try {
                    const { stdout } = await execPromise(`python3 scripts/sqli_payloads.py ${type}`);
                    const result = JSON.parse(stdout);
                    
                    if (result.error) {
                        return await buttonInteraction.editReply({
                            embeds: [{
                                color: 0xe74c3c,
                                title: '❌ Error',
                                description: `Error: ${result.error}`
                            }],
                            components: []
                        });
                    }
                    
                    if (type === 'all') {
                        const fields = [];
                        
                        for (const [catName, catData] of Object.entries(result.categories)) {
                            fields.push({
                                name: `${catData.description}`,
                                value: `\`${catData.payloads.length} payloads\`\nUse \`/sqli type:${catName}\` for details`,
                                inline: true
                            });
                        }
                        
                        await buttonInteraction.editReply({
                            embeds: [{
                                color: 0x9b59b6,
                                title: '💉 SQL Injection Payload Categories',
                                description: `**Total Categories:** ${result.total_categories}\n**Total Payloads:** ${result.total_payloads}`,
                                fields: fields,
                                footer: {
                                    text: '⚠️ Use responsibly and only with authorization!'
                                }
                            }],
                            components: []
                        });
                    } else {
                        const payloadsText = result.payloads
                            .slice(0, 20)
                            .map((p, i) => `${i + 1}. \`${p}\``)
                            .join('\n');
                        
                        const hasMore = result.payloads.length > 20;
                        
                        await buttonInteraction.editReply({
                            embeds: [{
                                color: 0x9b59b6,
                                title: `💉 ${result.description}`,
                                description: `**Total Payloads:** ${result.count}\n\n${payloadsText}${hasMore ? `\n\n_...and ${result.count - 20} more payloads_` : ''}`,
                                fields: [
                                    {
                                        name: '💡 Usage Tips',
                                        value: '• Test each payload systematically\n' +
                                               '• Monitor application responses\n' +
                                               '• Look for database errors\n' +
                                               '• Check for unusual behavior\n' +
                                               '• Document all findings',
                                        inline: false
                                    },
                                    {
                                        name: '🎯 Testing Process',
                                        value: '1. Identify injection points\n' +
                                               '2. Test for vulnerabilities\n' +
                                               '3. Confirm exploitability\n' +
                                               '4. Document & report\n' +
                                               '5. Wait for remediation',
                                        inline: false
                                    }
                                ],
                            }],
                            components: []
                        });
                    }
                    
                } catch (error) {
                    console.error('Error:', error);
                    await buttonInteraction.editReply({
                        embeds: [{
                            color: 0xe74c3c,
                            title: '❌ Error',
                            description: 'Error generating payloads!'
                        }],
                        components: []
                    });
                }
                
            } else if (buttonInteraction.customId === 'cancel_sqli') {
                await buttonInteraction.update({
                    embeds: [{
                        color: 0x95a5a6,
                        title: '❌ Cancelled',
                        description: 'Request dibatalkan oleh user.',
                    }],
                    components: []
                });
            }
        });
        
        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({
                    embeds: [{
                        color: 0xe67e22,
                        title: '⏱️ Timeout',
                        description: 'Confirmation timeout (60 detik). Request dibatalkan.',
                    }],
                    components: []
                }).catch(console.error);
            }
        });
    }
};