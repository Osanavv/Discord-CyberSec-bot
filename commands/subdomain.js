const { SlashCommandBuilder } = require('discord.js');
const { spawn } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subdomain')
        .setDescription('Enumerate subdomains dari domain')
        .addStringOption(option =>
            option.setName('domain')
                .setDescription('Domain target (contoh: google.com)')
                .setRequired(true)),
    
    async execute(interaction) {
        const domain = interaction.options.getString('domain');
        
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
            return await interaction.reply({
                content: '❌ Format domain tidak valid!',
                ephemeral: true
            });
        }
        
        await interaction.deferReply();
        
        const foundSubdomains = [];
        let isCompleted = false;
        
        const pythonProcess = spawn('python3', ['scripts/subdomain_enum.py', domain]);
        
        let buffer = '';
        
        pythonProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            
            const lines = buffer.split('\n');
            buffer = lines.pop(); 
            
            for (const line of lines) {
                if (!line.trim()) continue;
                
                try {
                    const result = JSON.parse(line);
                    
                    if (result.status === 'found') {
                        foundSubdomains.push(result);
                    } else if (result.status === 'completed') {
                        isCompleted = true;
                    }
                } catch (e) {
                }
            }
        });
        
        pythonProcess.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
        });
        
        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                return await interaction.editReply({
                    content: '❌ Terjadi error saat subdomain enumeration!',
                    ephemeral: true
                });
            }
            
            if (foundSubdomains.length === 0) {
                return await interaction.editReply({
                    embeds: [{
                        color: 0xe67e22,
                        title: '🔍 Subdomain Enumeration',
                        description: `Tidak ada subdomain ditemukan untuk **${domain}**`,
                        footer: {
                            text: '💡 Coba domain yang lebih populer'
                        },
                        timestamp: new Date()
                    }]
                });
            }
            
            const subdomainList = foundSubdomains.map((sub, index) => {
                const ips = sub.ips.join(', ');
                return `${index + 1}. **${sub.subdomain}**\n   └─ \`${ips}\``;
            }).join('\n');
            
            const chunks = [];
            let currentChunk = '';
            
            for (const line of subdomainList.split('\n')) {
                if ((currentChunk + line + '\n').length > 1000) {
                    chunks.push(currentChunk);
                    currentChunk = line + '\n';
                } else {
                    currentChunk += line + '\n';
                }
            }
            if (currentChunk) chunks.push(currentChunk);
            
            const fields = chunks.map((chunk, index) => ({
                name: index === 0 ? '🎯 Subdomains Found' : '\u200B',
                value: chunk,
                inline: false
            }));
            
            if (fields.length > 25) {
                fields.splice(24, fields.length - 24, {
                    name: '⚠️ Terlalu Banyak Results',
                    value: `... dan ${foundSubdomains.length - 24} subdomain lainnya`,
                    inline: false
                });
            }
            
            await interaction.editReply({
                embeds: [{
                    color: 0x2ecc71,
                    title: '🔍 Subdomain Enumeration Results',
                    description: `Menemukan **${foundSubdomains.length}** subdomains untuk **${domain}**`,
                    fields: fields,
                    footer: {
                        text: '🔎 Subdomain Enumeration'
                    },
                    timestamp: new Date()
                }]
            });
        });
        
        setTimeout(() => {
            if (!isCompleted) {
                pythonProcess.kill();
                interaction.editReply({
                    content: '⏱️ Scan timeout! Proses terlalu lama.',
                    ephemeral: true
                });
            }
        }, 60000);
    }
};