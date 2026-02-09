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
        .setName('dns')
        .setDescription('DNS lookup untuk domain')
        .addStringOption(option =>
            option.setName('domain')
                .setDescription('Domain yang mau di-lookup (support subdomain)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('DNS record type')
                .setRequired(false)
                .addChoices(
                    { name: 'All Records', value: 'ALL' },
                    { name: 'A (IPv4)', value: 'A' },
                    { name: 'AAAA (IPv6)', value: 'AAAA' },
                    { name: 'MX (Mail)', value: 'MX' },
                    { name: 'NS (Name Server)', value: 'NS' },
                    { name: 'TXT (Text)', value: 'TXT' },
                    { name: 'CNAME', value: 'CNAME' },
                    { name: 'SOA', value: 'SOA' }
                )),
    
    async execute(interaction) {
        let domain = interaction.options.getString('domain');
        const recordType = interaction.options.getString('type') || 'ALL';
        
        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();
        
        if (!isValidDomain(domain)) {
            return await interaction.reply({
                embeds: [{
                    color: 0xe74c3c,
                    title: '❌ Invalid Domain',
                    description: 'Format domain tidak valid!\n\n**Examples:**\n' +
                                 '✅ `google.com`\n' +
                                 '✅ `api.github.com`\n' +
                                 '✅ `blog.example.co.uk`\n' +
                                 '✅ `subdomain.example.technology`\n\n' +
                                 '❌ `-example.com` (starts with hyphen)\n' +
                                 '❌ `example..com` (double dots)\n' +
                                 '❌ `example` (no TLD)',
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
            
            const { stdout, stderr } = await execPromise(`python3 scripts/dns_lookup.py "${escapedDomain}" ${recordType}`);
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe67e22,
                        title: '⚠️ DNS Lookup Failed',
                        description: `**Domain:** \`${domain}\`\n\n**Error:**\n${result.error}\n\n` +
                                     '**Possible reasons:**\n' +
                                     '• Domain tidak exist\n' +
                                     '• DNS server timeout\n' +
                                     '• Network issues\n' +
                                     '• No records found for this type',
                        footer: {
                            text: 'Try different record type atau check domain validity'
                        }
                    }],
                    ephemeral: true
                });
            }
            
            const fields = [];
            let totalRecords = 0;
            
            for (const [type, data] of Object.entries(result)) {
                if (data.records && data.records.length > 0) {
                    totalRecords += data.count;
                    
                    const displayRecords = data.records.slice(0, 10);
                    const hasMore = data.records.length > 10;
                    
                    fields.push({
                        name: `${type} - ${data.description} (${data.count})`,
                        value: displayRecords.map(r => `\`${r}\``).join('\n') + 
                               (hasMore ? `\n_...dan ${data.records.length - 10} lainnya_` : ''),
                        inline: false
                    });
                }
            }
            
            if (fields.length === 0) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe67e22,
                        title: '⚠️ No DNS Records Found',
                        description: `**Domain:** \`${domain}\`\n\n` +
                                     `Tidak ada ${recordType === 'ALL' ? 'DNS records' : recordType + ' records'} ditemukan.\n\n` +
                                     '**Tips:**\n' +
                                     '• Check ejaan domain\n' +
                                     '• Try record type lain\n' +
                                     '• Pastikan domain aktif',
                    }],
                    ephemeral: true
                });
            }
            
            await interaction.editReply({
                embeds: [{
                    color: 0xe74c3c,
                    title: '🌐 DNS Lookup Results',
                    description: `**Domain:** \`${domain}\`\n**Query Type:** \`${recordType}\`\n**Total Records:** **${totalRecords}**`,
                    fields: fields,
                    footer: {
                        text: '🔍 DNS Query Complete'
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
                    description: '**Terjadi error saat DNS lookup!**\n\n' +
                                 '**Possible causes:**\n' +
                                 '• Python script error\n' +
                                 '• DNS resolution timeout\n' +
                                 '• Network connectivity issue\n\n' +
                                 `**Domain:** \`${domain}\`\n` +
                                 `**Error:** \`${error.message}\``,
                    footer: {
                        text: 'Check bot logs untuk detail error'
                    }
                }],
                ephemeral: true
            });
        }
    }
};