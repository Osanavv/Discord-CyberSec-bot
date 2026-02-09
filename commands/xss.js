const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xss')
        .setDescription('Generate XSS payloads (AUTHORIZED USE ONLY!)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of XSS payload')
                .setRequired(false)
                .addChoices(
                    { name: 'All Categories', value: 'all' },
                    { name: 'Basic XSS', value: 'basic' },
                    { name: 'Filter/WAF Bypass', value: 'filter_bypass' },
                    { name: 'Attribute-based', value: 'attribute_based' },
                    { name: 'DOM-based', value: 'dom_based' },
                    { name: 'Polyglot', value: 'polyglot' },
                    { name: 'Stored XSS', value: 'stored_xss' },
                    { name: 'Blind XSS', value: 'blind_xss' },
                    { name: 'Cookie Stealer', value: 'cookie_stealer' },
                    { name: 'Advanced', value: 'advanced' }
                )),
    
    async execute(interaction) {
        const type = interaction.options.getString('type') || 'all';
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_xss')
                    .setLabel('✅ Saya Mengerti')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_xss')
                    .setLabel('❌ Batalkan')
                    .setStyle(ButtonStyle.Danger)
            );
        
        const disclaimerMsg = await interaction.reply({
            embeds: [{
                color: 0xe74c3c,
                title: '⚠️ LEGAL DISCLAIMER',
                description: '**XSS Payload Generator**\n\n' +
                             '🚨 **AUTHORIZED USE ONLY!**\n\n' +
                             '**Legal uses:**\n' +
                             '✅ Authorized penetration testing\n' +
                             '✅ Bug bounty programs (in scope)\n' +
                             '✅ Testing YOUR OWN applications\n' +
                             '✅ Educational/learning purposes\n' +
                             '✅ CTF competitions\n\n' +
                             '**ILLEGAL:**\n' +
                             '❌ Unauthorized testing\n' +
                             '❌ Cookie stealing without permission\n' +
                             '❌ Session hijacking\n' +
                             '❌ Any malicious activity\n\n' +
                             '• Kamu accept full responsibility\n\n' +
                             '**Timeout: 60 detik**',
                footer: {
                    text: 'XSS attacks can cause serious damage! Use responsibly!'
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
            if (buttonInteraction.customId === 'confirm_xss') {
                await buttonInteraction.update({
                    embeds: [{
                        color: 0xf39c12,
                        title: '⏳ Generating Payloads...',
                        description: 'Please wait while generating XSS payloads...',
                    }],
                    components: []
                });
                
                try {
                    const { stdout } = await execPromise(`python3 scripts/xss_payloads.py ${type}`);
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
                                value: `\`${catData.payloads.length} payloads\`\nUse \`/xss type:${catName}\` for details`,
                                inline: true
                            });
                        }
                        
                        await buttonInteraction.editReply({
                            embeds: [{
                                color: 0xe67e22,
                                title: '⚡ XSS Payload Categories',
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
                            .slice(0, 15)
                            .map((p, i) => `${i + 1}. \`${p.length > 100 ? p.substring(0, 100) + '...' : p}\``)
                            .join('\n');
                        
                        const hasMore = result.payloads.length > 15;
                        
                        await buttonInteraction.editReply({
                            embeds: [{
                                color: 0xe67e22,
                                title: `⚡ ${result.description}`,
                                description: `**Total Payloads:** ${result.count}\n\n${payloadsText}${hasMore ? `\n\n_...and ${result.count - 15} more payloads_` : ''}`,
                                fields: [
                                    {
                                        name: '💡 Testing Tips',
                                        value: '• Test in different contexts (HTML, JS, attribute)\n' +
                                               '• Check for input sanitization\n' +
                                               '• Look for reflection points\n' +
                                               '• Test stored vs reflected XSS\n' +
                                               '• Monitor browser console for errors',
                                        inline: false
                                    },
                                    {
                                        name: '🎯 Common Injection Points',
                                        value: '• URL parameters\n' +
                                               '• Form inputs\n' +
                                               '• HTTP headers (User-Agent, Referer)\n' +
                                               '• File uploads (filename)\n' +
                                               '• Search boxes',
                                        inline: false
                                    }
                                ],
                                footer: {
                                    text: '⚠️ Replace "attacker.com" with your testing server!'
                                }
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
                
            } else if (buttonInteraction.customId === 'cancel_xss') {
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