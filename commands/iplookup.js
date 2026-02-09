const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iplookup')
        .setDescription('Lookup informasi IP address')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP address yang mau di-lookup')
                .setRequired(true)),
    
    async execute(interaction) {
        const ip = interaction.options.getString('ip');
        
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) {
            return await interaction.reply({
                content: '❌ Format IP address tidak valid! Contoh: `8.8.8.8`',
                ephemeral: true
            });
        }

        await interaction.deferReply();
        
        try {
            const { stdout, stderr } = await execPromise(`python3 scripts/ip_lookup.py ${ip}`);
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
    
            const result = JSON.parse(stdout);
            
            if (result.error) {
                return await interaction.editReply({
                    content: `❌ Error: ${result.error}`,
                    ephemeral: true
                });
            }
            
            await interaction.editReply({
                embeds: [{
                    color: 0x3498db,
                    title: '🌐 IP Address Lookup',
                    thumbnail: {
                        url: `https://flagcdn.com/96x72/${result.country_code.toLowerCase()}.png`
                    },
                    fields: [
                        {
                            name: '📍 IP Address',
                            value: `\`${result.ip}\``,
                            inline: true
                        },
                        {
                            name: '🗺️ Location',
                            value: `${result.city}, ${result.region}`,
                            inline: true
                        },
                        {
                            name: '🌍 Country',
                            value: `${result.country} (${result.country_code})`,
                            inline: true
                        },
                        {
                            name: '📮 Postal Code',
                            value: `\`${result.postal}\``,
                            inline: true
                        },
                        {
                            name: '🌏 Continent',
                            value: `\`${result.continent}\``,
                            inline: true
                        },
                        {
                            name: '🕐 Timezone',
                            value: `${result.timezone} (UTC${result.utc_offset})`,
                            inline: true
                        },
                        {
                            name: '📌 Coordinates',
                            value: `\`${result.latitude}, ${result.longitude}\``,
                            inline: true
                        },
                        {
                            name: '💱 Currency',
                            value: `\`${result.currency}\``,
                            inline: true
                        },
                        {
                            name: '📞 Calling Code',
                            value: `\`${result.calling_code}\``,
                            inline: true
                        },
                        {
                            name: '🗣️ Languages',
                            value: `\`${result.languages}\``,
                            inline: false
                        },
                        {
                            name: '🏢 ISP / Organization',
                            value: `\`${result.org}\``,
                            inline: false
                        },
                        {
                            name: '🔢 ASN',
                            value: `\`${result.asn}\``,
                            inline: false
                        }
                    ],
                    footer: {
                        text: '📡 Data from ipapi.co'
                    },
                    timestamp: new Date()
                }]
            });
            
        } catch (error) {
            console.error('Error executing Python script:', error);
            
            await interaction.editReply({
                content: '❌ Terjadi error saat melakukan IP lookup. Pastikan IP address valid!',
                ephemeral: true
            });
        }
    }
};