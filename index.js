#!/usr/bin/env node
const axios = require('axios');
const figlet = require('figlet');
const gradient = require('gradient-string');
const chalk = require('chalk').default;
const readline = require('readline');
const pino = require('pino');

const sleep = (ms, variation = 0) => new Promise(resolve => {
    setTimeout(resolve, ms + (variation ? Math.floor(Math.random() * variation) : 0));
});

const EXIT_WORDS = ["exit", "keluar", "quit", "q"];

// Bot pool configuration - Updated with new tokens
const BOT_POOL = [
    '7750859547:AAFpQkR8b07vsv8ATbTg8KGm8ADbWqcJ9NY',
    '7792503351:AAEgPBzSPK-FPaTKi_ne-lzm0VMRoM_rlfU',
    '7579240640:AAEB2coAuLXtiv9mLOIGyHTzd-wru0RuoVE',
    '7774296066:AAEDx10qvSJgE1GKoXQU3uxu2fVZKqPO8Vo',
    '7448247840:AAFaHu_z89WbgVFb7NKv1S8h1yCs_OY7ijQ',
    '8054088262:AAFQ2__GJQx6mjr_nHADDC89k-HXXO26exc',
    '7594187525:AAGIHSkNfPQYEIBCNSTKKIHoERkikTGMH2A',
    '8231446461:AAHd_ORTMmvbm6AORSZdR2nnMH6ucHJrCRY'
];

const MAX_RETRIES = 3; // Maximum retry attempts for failed messages
const MESSAGE_DELAY = 2000; // 2 seconds delay between messages

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(text, ans => {
        const val = ans.trim().toLowerCase();
        if (EXIT_WORDS.includes(val)) {
            console.log(chalk.red("\n[!] Keluar dari tools..."));
            rl.close();
            process.exit(0);
        }
        rl.close();
        resolve(ans);
    }));
};

const progressBar = async (text = "Menyiapkan koneksi", total = 15, delay = 150) => {
    for (let i = 0; i <= total; i++) {
        const filled = chalk.green("|".repeat(i));
        const empty = chalk.gray("|".repeat(total - i));
        const bar = filled + empty;
        process.stdout.write(`\r${chalk.yellow(`[⌛] ${text}:`)} ${bar}`);
        await sleep(delay);
    }
    process.stdout.write(chalk.green(" ✓\n"));
};

const animasiGaris = async (total = 54, delay = 50) => {
    const mid = Math.floor(total / 2);

    for (let i = 0; i <= mid; i++) {
        const kiri = chalk.green("═".repeat(i));
        const kanan = chalk.green("═".repeat(i));
        const tengah = chalk.gray(" ".repeat(total - i * 2));

        const baris = kiri + tengah + kanan;
        process.stdout.write(`\r${baris}`);
        await sleep(delay);
    }

    process.stdout.write("\n");
};

const typeEffect = async (text, delay = 20) => {
    for (const char of text) {
        process.stdout.write(char);
        await sleep(delay);
    }
    process.stdout.write('\n');
};

const textingteks = async (text, delay = 10) => {
    for (const char of text) {
        process.stdout.write(char);
        await sleep(delay);
    }
    process.stdout.write('\n');
};

const showBanner = async () => {
    console.clear();
    const banner = figlet.textSync("DRAVIN", { font: "ANSI Shadow" });
    console.log(gradient.instagram.multiline(banner));
    await textingteks(chalk.magenta("[⚙️] Telegram Spam Bot - BY DRAVIN"));
    await animasiGaris();
    await typeEffect(chalk.green("• Gunakan dengan bijak, tanggung sendiri resikonya"));
    await typeEffect(chalk.yellow("• Bot Token bisa dibuat via @BotFather"));
    await typeEffect(chalk.yellow("💡 Tips: ketik exit/quit/keluar/q untuk keluar"));
    await animasiGaris();
};

const login = async () => {
    console.log(chalk.red("\n=== LOGIN DRAVIN TOOLS ===\n"));
    const username = await question(
        chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
        chalk.cyan(' ├──╼') + chalk.yellow('Username') + '\n' +
        chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
    );
    
    const password = await question(
        chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
        chalk.cyan(' ├──╼') + chalk.yellow('Password') + '\n' +
        chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
    );

    if (username === 'dravin' && password === 'dravintools') {
        console.log(chalk.green("\n[✓] Login berhasil!"));
        await sleep(1000);
        return true;
    } else {
        console.log(chalk.red("\n[×] Username atau password salah!"));
        await sleep(1500);
        return false;
    }
};

const sendTelegramMessage = async (token, chatId, message, attempt = 1) => {
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                chat_id: chatId,
                text: message
            }
        );
        return { success: true, data: response.data };
    } catch (error) {
        if (attempt < MAX_RETRIES) {
            console.log(chalk.yellow(`[!] Mencoba ulang (attempt ${attempt + 1}/${MAX_RETRIES})...`));
            await sleep(1000 * attempt); // Exponential backoff
            return sendTelegramMessage(token, chatId, message, attempt + 1);
        }
        return { success: false, error };
    }
};

const distributeMessages = (total) => {
    const distribution = [];
    let remaining = total;
    
    // Create random distribution
    while (remaining > 0) {
        const max = Math.min(remaining, 4); // Max 4 messages per bot
        const count = Math.floor(Math.random() * max) + 1;
        distribution.push(count);
        remaining -= count;
    }
    
    // Pad with zeros if needed
    while (distribution.length < BOT_POOL.length) {
        distribution.push(0);
    }
    
    // Shuffle the distribution
    return distribution.sort(() => Math.random() - 0.5);
};

async function startSpam() {
    let lastChatId = '';
    let lastMessage = '';

    while (true) {
        console.clear();
        await showBanner();
        
        // Bot selection
        console.log(chalk.cyan("\nPilihan Bot:"));
        console.log(chalk.cyan("1. Gunakan 8 Bot Dravin"));
        console.log(chalk.cyan("2. Gunakan Bot Custom\n"));
        
        const botChoice = await question(chalk.yellow("Pilihan (1/2): "));
        let selectedBots = [];
        
        if (botChoice === '1') {
            selectedBots = BOT_POOL;
            console.log(chalk.green("\nMenggunakan 8 Bot Dravin"));
        } else {
            const customToken = await question(chalk.yellow("\nMasukkan Token Bot Custom: "));
            if (!/^\d{8,10}:[a-zA-Z0-9_-]{35}$/.test(customToken)) {
                console.log(chalk.red("\nFormat token tidak valid!"));
                await sleep(1500);
                continue;
            }
            selectedBots = [customToken];
            console.log(chalk.green("\nMenggunakan Bot Custom"));
        }

        // Chat ID input
        let chatId = '';
        if (lastChatId) {
            const reuse = await question(
                chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
                chalk.cyan(' ├──╼') + chalk.yellow('Gunakan Chat ID sebelumnya? (y/n)') + '\n' +
                chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
            );
            
            if (reuse.toLowerCase() === 'y') {
                chatId = lastChatId;
            }
        }
        
        if (!chatId) {
            chatId = await question(
                chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
                chalk.cyan(' ├──╼') + chalk.yellow('Chat ID (contoh: 123456789)') + '\n' +
                chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
            );
            
            if (!/^\d+$/.test(chatId)) {
                console.log(chalk.red("\n❌ Format Chat ID tidak valid!"));
                await sleep(1500);
                continue;
            }
            lastChatId = chatId;
        }

        // Message input
        let message = '';
        if (lastMessage) {
            const reuse = await question(
                chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
                chalk.cyan(' ├──╼') + chalk.yellow('Gunakan pesan sebelumnya? (y/n)') + '\n' +
                chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
            );
            
            if (reuse.toLowerCase() === 'y') {
                message = lastMessage;
            }
        }
        
        if (!message) {
            message = await question(
                chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
                chalk.cyan(' ├──╼') + chalk.yellow('Pesan yang akan dikirim') + '\n' +
                chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
            );
            
            if (!message) {
                console.log(chalk.red("\n❌ Pesan tidak boleh kosong!"));
                await sleep(1500);
                continue;
            }
            lastMessage = message;
        }

        const jumlah = parseInt(await question(
            chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
            chalk.cyan(' ├──╼') + chalk.yellow("Jumlah Spam (1-100)") + '\n' +
            chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
        ));
        
        if (isNaN(jumlah) || jumlah < 1 || jumlah > 100) {
            console.log(chalk.red("\n❌ Jumlah harus antara 1 dan 100"));
            await sleep(1500);
            continue;
        }

        console.log(chalk.green(`\n🚀 Memulai spam ke ${chatId} sebanyak ${jumlah}x...\n`));
        await progressBar("Mengirim pesan", jumlah, 50);
        
        let sukses = 0;
        let gagal = 0;
        
        // Distribute messages randomly
        const distribution = distributeMessages(jumlah);
        
        for (let i = 0; i < selectedBots.length; i++) {
            const botToken = selectedBots[i];
            const count = distribution[i];
            
            if (count === 0) continue;
            
            console.log(chalk.yellow(`\nMenggunakan Bot ${i+1}: ${botToken.slice(0, 10)}... (${count} pesan)`));
            
            for (let j = 0; j < count; j++) {
                try {
                    const start = Date.now();
                    const { success, data, error } = await sendTelegramMessage(botToken, chatId, message);
                    const waktu = ((Date.now() - start) / 1000).toFixed(2);
                    
                    if (success) {
                        console.log(chalk.green(`[✓] ${j + 1}/${count} => Berhasil (${waktu}s)`));
                        sukses++;
                    } else {
                        console.log(chalk.red(`[×] ${j + 1}/${count} => Gagal (${waktu}s): ${error.message}`));
                        gagal++;
                    }
                } catch (err) {
                    console.log(chalk.red(`[×] ${j + 1}/${count} => Error: ${err.message}`));
                    gagal++;
                }
                
                // 2-second delay between messages
                if (j < count - 1) {
                    process.stdout.write(chalk.blue(`\n⏳ Menunggu 2 detik sebelum pesan berikutnya...`));
                    await sleep(MESSAGE_DELAY);
                    process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear line
                }
            }
        }

        console.log(chalk.cyan("\n📊 Ringkasan"));
        console.log(chalk.cyan(`├─ Total Bot : ${selectedBots.length}`));
        console.log(chalk.cyan(`├─ Chat ID : ${chalk.white(chatId)}`));
        console.log(chalk.cyan(`├─ Pesan : ${chalk.white(message.length > 20 ? message.substring(0, 20) + '...' : message)}`));
        console.log(chalk.cyan(`├─ Total : ${chalk.white(jumlah)}`));
        console.log(chalk.cyan(`├─ Sukses : ${chalk.green(sukses)}`));
        console.log(chalk.cyan(`└─ Gagal : ${chalk.red(gagal)}`));

        const ulang = await question(
            chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
            chalk.cyan(' ├──╼') + chalk.magenta("🔁 Ingin spam lagi? (y/n)") + '\n' +
            chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
        );
        
        if (ulang.toLowerCase() !== "y") break;
    }

    console.log(chalk.green("\n✨ Terima kasih telah menggunakan Dravin Tools!"));
    process.exit(0);
}

(async () => {
    await showBanner();
    const loggedIn = await login();
    if (loggedIn) {
        await sleep(500);
        await progressBar("Menyiapkan sistem", 15, 150);
        await startSpam();
    } else {
        process.exit(0);
    }
})();
