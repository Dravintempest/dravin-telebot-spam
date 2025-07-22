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

    if (username === 'dravin' && password === 'dravin123') {
        console.log(chalk.green("\n[✓] Login berhasil!"));
        await sleep(1000);
        return true;
    } else {
        console.log(chalk.red("\n[×] Username atau password salah!"));
        await sleep(1500);
        return false;
    }
};

const sendTelegramMessage = async (token, chatId, message) => {
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                chat_id: chatId,
                text: message
            }
        );
        return response.data.ok;
    } catch (error) {
        throw error;
    }
};

async function startSpam() {
    let lastToken = '';
    let lastChatId = '';
    let lastMessage = '';

    while (true) {
        console.clear();
        await showBanner();
        
        // Token input
        let token = '';
        if (lastToken) {
            const reuse = await question(
                chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
                chalk.cyan(' ├──╼') + chalk.yellow('Gunakan token sebelumnya? (y/n)') + '\n' +
                chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
            );
            
            if (reuse.toLowerCase() === 'y') {
                token = lastToken;
            }
        }
        
        if (!token) {
            token = await question(
                chalk.cyan('\n ┌─╼') + chalk.red('[DRAVIN') + chalk.hex('#FFA500')('〄') + chalk.red('TOOLS]') + '\n' +
                chalk.cyan(' ├──╼') + chalk.yellow('Bot Token (dari @BotFather)') + '\n' +
                chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
            );
            if (!/^\d{8,10}:[a-zA-Z0-9_-]{35}$/.test(token)) {
  console.log("Format token tidak valid!");
                await sleep(1500);
                continue;
            }
            lastToken = token;
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
        
        for (let i = 0; i < jumlah; i++) {
            try {
                const start = Date.now();
                const success = await sendTelegramMessage(token, chatId, message);
                const waktu = ((Date.now() - start) / 1000).toFixed(2);
                
                if (success) {
                    console.log(chalk.green(`[✓] ${i + 1}/${jumlah} => Berhasil (${waktu}s)`));
                    sukses++;
                } else {
                    console.log(chalk.yellow(`[!] ${i + 1}/${jumlah} => Gagal (${waktu}s)`));
                    gagal++;
                }
            } catch (err) {
                console.log(chalk.red(`[×] ${i + 1}/${jumlah} => Error: ${err.message}`));
                gagal++;
                
                if (err.response?.data?.description?.includes("Too Many Requests")) {
                    console.log(chalk.yellow("⚠️ Terlalu banyak permintaan, menunggu 30 detik..."));
                    await sleep(30000);
                }
            }
            
            // Delay antara pesan
            if (i < jumlah - 1) await sleep(100);
        }

        console.log(chalk.cyan("\n📊 Ringkasan"));
        console.log(chalk.cyan(`├─ Token : ${chalk.white(token.slice(0, 10) + '...')}`));
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
