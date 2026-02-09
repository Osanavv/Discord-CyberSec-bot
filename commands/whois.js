const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

function isValidDomain(domain) {
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain || domain.length > 253) return false;
    if (domain.startsWith('-') || domain.endsWith('-')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    
    const labels = domain.split('.');
    if (labels.length < 2) return false;
    
    for (const label of labels) {
        if (label.length === 0 || label.length > 63) return false;
        if (label.startsWith('-') || label.endsWith('-')) return false;
        if (!/^[a-zA-Z0-9-]+$/.test(label)) return false;
    }
    
    const tld = labels[labels.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    
    return true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whois')
        .setDescription('WHOIS lookup untuk domain')
        .addStringOption(option =>
            option.setName('domain')
                .setDescription('Domain yang mau di-lookup (example: google.com)')
                .setRequired(true)),
    
    async execute(interaction) {
        let domain = interaction.options.getString('domain');
        
        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();
        
        const labels = domain.split('.');
        if (labels.length > 2) {
            const tld = labels[labels.length - 1];
            const sld = labels[labels.length - 2];
            
            const twoPartTLDs = ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'sch', 'id'];
            
            if (twoPartTLDs.includes(sld) && labels.length > 2) {
                domain = labels.slice(-3).join('.');
            } else {
                domain = labels.slice(-2).join('.');
            }
        }
        
        if (!isValidDomain(domain)) {
            return await interaction.reply({
                embeds: [{
                    color: 0xe74c3c,
                    title: '❌ Invalid Domain',
                    description: 'Format domain tidak valid!\n\n**Examples:**\n' +
                                 '✅ `google.com`\n' +
                                 '✅ `example.co.uk`\n' +
                                 '✅ `github.com`\n\n' +
                                 '💡 **Note:** WHOIS hanya untuk root domain.\n' +
                                 'Subdomain otomatis di-convert ke root domain.\n' +
                                 '(e.g., `blog.example.com` → `example.com`)',
                    footer: {
                        text: 'URL protocols (http://) akan otomatis dihapus'
                    }
                }],
                ephemeral: true
            });
        }
        
        await interaction.deferReply();
        
        try {
            const escapedDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '');
            const { stdout, stderr } = await execPromise(`python3 scripts/whois_lookup.py "${escapedDomain}"`);
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe67e22,
                        title: '⚠️ WHOIS Lookup Failed',
                        description: `**Domain:** \`${domain}\`\n\n**Error:**\n${result.error}\n\n` +
                                     '**Possible reasons:**\n' +
                                     '• Domain belum/tidak terdaftar\n' +
                                     '• WHOIS server timeout\n' +
                                     '• Privacy protection enabled\n' +
                                     '• Invalid/reserved TLD',
                        footer: {
                            text: 'Some TLDs tidak support WHOIS queries'
                        }
                    }],
                    ephemeral: true
                });
            }
            
            let expiryWarning = '';
            if (result.expiration_date !== "N/A") {
                try {
                    const expiryDate = new Date(result.expiration_date);
                    const now = new Date();
                    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilExpiry < 0) {
                        expiryWarning = `\n⚠️ **Domain EXPIRED ${Math.abs(daysUntilExpiry)} hari yang lalu!**`;
                    } else if (daysUntilExpiry < 30) {
                        expiryWarning = `\n⚠️ **Domain akan expired dalam ${daysUntilExpiry} hari!**`;
                    } else if (daysUntilExpiry < 90) {
                        expiryWarning = `\n⚡ **Domain akan expired dalam ${daysUntilExpiry} hari**`;
                    } else {
                        expiryWarning = `\n✅ Domain valid untuk ${daysUntilExpiry} hari lagi`;
                    }
                } catch (e) {
                }
            }
            
            await interaction.editReply({
                embeds: [{
                    color: 0x9b59b6,
                    title: '🔍 WHOIS Lookup',
                    description: `Domain information for **${result.domain_name}**${expiryWarning}`,
                    fields: [
                        {
                            name: '📝 Registrar',
                            value: `\`${result.registrar}\``,
                            inline: false
                        },
                        {
                            name: '🏢 Organization',
                            value: `\`${result.org}\``,
                            inline: true
                        },
                        {
                            name: '🌍 Country',
                            value: `\`${result.country}\``,
                            inline: true
                        },
                        {
                            name: '📅 Created',
                            value: `\`${result.creation_date}\``,
                            inline: true
                        },
                        {
                            name: '📅 Updated',
                            value: `\`${result.updated_date}\``,
                            inline: true
                        },
                        {
                            name: '📅 Expires',
                            value: `\`${result.expiration_date}\``,
                            inline: true
                        },
                        {
                            name: '🔒 Status',
                            value: `\`${result.status}\``,
                            inline: false
                        },
                        {
                            name: '🖥️ Name Servers',
                            value: `\`\`\`${result.name_servers}\`\`\``,
                            inline: false
                        },
                        {
                            name: '🔐 DNSSEC',
                            value: `\`${result.dnssec}\``,
                            inline: true
                        },
                        {
                            name: '📧 Emails',
                            value: `\`${result.emails}\``,
                            inline: false
                        }
                    ],
                    footer: {
                        text: '🔎 WHOIS Data'
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
                    description: `**Terjadi error saat WHOIS lookup!**\n\n` +
                                 `**Domain:** \`${domain}\`\n` +
                                 `**Error:** \`${error.message}\``,
                }],
                ephemeral: true
            });
        }
    }
};