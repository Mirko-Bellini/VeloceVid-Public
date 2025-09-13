// Import the 'node-telegram-bot-api' library to interact with the Telegram Bot API
const TelegramBot = require('node-telegram-bot-api');

// Import 'edit-json-file' to read and edit JSON files
const editJsonFile = require('edit-json-file');

// Load environment variables from a .env file using dotenvx
require('@dotenvx/dotenvx').config();

// Retrieve the Telegram bot token from environment variables
const token = process.env.TOKEN;

// Load JSON databases
const jn = editJsonFile('./database/database.json'); // Stores all users
const jn2 = editJsonFile('./database/verified.json'); // Stores verified users

// Create a new Telegram bot instance with polling enabled
const bot = new TelegramBot(token, { polling: true });

// Import child_process to execute shell commands
const { exec } = require('child_process');

// Import filesystem and path utilities
const fs = require('fs');
const path = require('path');

// Log a message when the bot starts
console.log('Bot Pronto!'); // "Bot Ready!"

let utente; // Variable to store if the current user is verified

// Event listener for any incoming message
bot.on('message', (msg) => {
    const user = msg.chat.id;
    let verificati = jn2.get('verificati') || [];

    // Check if the user is verified
    utente = verificati.some(find => find.user.id === user && find.user.verificato === 'si');

    if (!utente) {
        // Inline button to accept terms
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Accept Terms', callback_data: 'pulsante_premuto' }
                    ]
                ]
            }
        };

        // Send a warning message and ask user to accept the terms
        return bot.sendMessage(msg.chat.id, "⚠️ WARNING ⚠️ \n\nThis bot allows downloading content that is publicly accessible on social networks. It is not intended for downloading copyrighted material or content from private accounts. \n\nAny misuse of this bot is the sole responsibility of the user. I am not responsible for any legal violations or breaches of the platforms' Terms of Service. \n\nTo use the bot, you must read and accept these conditions by pressing the Accept Terms button below. ", opts);
    }
});

// Event listener for inline button clicks
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message; 
    const utenti = msg.chat.id;
    let verificati = jn2.get('verificati') || [];

    // Check if the user is already verified
    utente = verificati.some(find => find.user.id === utenti && find.user.verificato === 'si');

    if (!utente && callbackQuery.data === 'pulsante_premuto') {
        // Add user to verified list
        let verificati = jn2.get('verificati') || [];
        verificati.push({
            user: {
                id: msg.chat.id,
                verificato: 'si',
            }
        });

        jn2.set('verificati', verificati);
        jn2.save();

        // Send confirmation messages
        bot.sendMessage(msg.chat.id, '✅ You have successfully accepted the terms and conditions.', { reply_to_message_id: msg.message_id });
        bot.sendMessage(msg.chat.id, "Hi! 👋\nI’m a bot that downloads videos from TikTok, Instagram, X, and Reddit.\nJust send a link, and I’ll try to download it for you!\n\nIf you need help, type /help.\n\n⚠️ New features coming soon:\n- Support for more social platforms\n- Special group features (automatic downloads and group-specific settings!)");
        return bot.answerCallbackQuery(callbackQuery.id);
    } else {
        bot.sendMessage(msg.chat.id, 'You have already successfully accepted the terms and conditions.', { reply_to_message_id: msg.message_id });
        return bot.answerCallbackQuery(callbackQuery.id);
    }
});

// /start command handler
bot.onText(/\/start/, (msg) => {
    if (!utente) return;

    bot.sendMessage(msg.chat.id, "Hi! 👋\nI’m a bot that downloads videos from TikTok, Instagram, X, and Reddit.\nJust send a link, and I’ll try to download it for you!\n\nIf you need help, type /help.\n\n⚠️ New features coming soon:\n- Support for more social platforms\n- Special group features (automatic downloads and group-specific settings!)");
});

// /help command handler
bot.onText(/\/help/, (msg) => {
    if (!utente) return;

    bot.sendMessage(msg.chat.id, "👋 Hi there! \n\n I am a bot that helps you download videos from these platforms: \n • TikTok \n • Instagram \n • X \n • Reddit \n And many other social networks (For the moment only TikTok and Instagram). \n\n How it works: \n 🔗 Just send me a link to the video you want to download. \n 📥 If the link is valid, I will send you the video (or a file to download). \n\n ❗ Important: make sure the link is public and does not require login. \n\n If something does not work, try to send me the link again. \n\n⚠️ New features coming soon:\n- Support for more social platforms\n- Special group features (automatic downloads and group-specific settings!)");
});

// /update command (admin only)
bot.onText(/\/update/, (msg) => {
    if (msg.chat.id !== "YOUR ChatID") {
        return bot.sendMessage(msg.chat.id, 'You cannot use this command.');
    }

    const users = jn.get('users');
    const tuttiGliId = users.map(entry => entry.user.id);

    // Notify all users that bot is offline
    tuttiGliId.forEach(chatId => {
        bot.sendMessage(chatId, '⚠️ The bot is currently offline for maintenance. It will be available again upon further notice.');
    });
});

// /finish command (admin only)
bot.onText(/\/finish/, (msg) => {
    if (msg.chat.id !== "YOUR ChatID") {
        return bot.sendMessage(msg.chat.id, 'You cannot use this command.');
    }

    const text=msg.text;
    const newText=text.replace('/finish', '').trim();


    const users = jn.get('users');
    const tuttiGliId = users.map(entry => entry.user.id);

    // Notify all users that bot is back online with a personalized message
    tuttiGliId.forEach(chatId => {
        bot.sendMessage(chatId, `✅ The bot is now online and ready to use. ${newText}`);
    });
});

// Store new users in database
bot.on('message', (msg) => {
    if (!utente) return;

    let users = jn.get('users') || []; 
    const esiste = users.some(entry => entry.user.id === msg.chat.id);

    if (!esiste) {
        users.push({ user: { id: msg.chat.id } });
        jn.set('users', users);
        jn.save();
    }
});

// Main message handler for downloading videos
bot.on('message', async (msg) => {
    if (!utente) return;

    const text = msg.text;
    const user = `user_${msg.chat.id}`;
    const userDir = `./users/${user}`;

    // Ignore commands
    if (text.startsWith('/')) return;

    // Validate link format
    if (!text.startsWith('https')) {
        bot.sendMessage(msg.chat.id, "The message you sent is not valid. Please send me only the video link. If you need help, type /help.");
        await addReactioN(token, msg.chat.id, msg.message_id, '💔');
        return;
    }

    // Create user folder if not exists
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    // Success flags for different platforms
    let tiktokSucess = false;
    let instagramSucess = false;
    let xSuccess = false;
    let redditSucces = false;
    let youtubeSucess = false;

    // Platform checks and downloads using gallery-dl
    if (text.includes('tiktok')) {
        await addReactioN(token, msg.chat.id, msg.message_id, '👍');
        try {
            await execPromise(`gallery-dl --cookies ./cookies/tiktokcookies.txt -o base-directory=${userDir} -o directory="" "${text}"`);
            tiktokSucess = true;
        } catch (error) {
            console.log(error);
        }
    } else if (text.includes('instagram')) {
        await addReactioN(token, msg.chat.id, msg.message_id, '👍');
        try {
            await execPromise(`gallery-dl --cookies ./cookies/instagramcookies.txt -o base-directory=${userDir} -o directory="" "${text}"`);
            instagramSucess = true;
        } catch (error) {
            console.log(error);
        }
    } else if (text.includes('x')) {
        await addReactioN(token, msg.chat.id, msg.message_id, '👍');
        try {
            await execPromise(`gallery-dl --cookies ./cookies/xcookies.txt -o base-directory=${userDir} -o directory="" "${text}"`);
            xSuccess = true;
        } catch (error) {
            console.log(error);
        }
    } else if (text.includes('reddit')) {
        await addReactioN(token, msg.chat.id, msg.message_id, '👍');
        try {
            await execPromise(`gallery-dl -o base-directory=${userDir} -o directory="" "${text}"`);
            redditSucces = true;
        } catch (error) {
            console.log(error);
        }
    } else if (text.includes('youtube') || text.includes('youtu.be')){
        await addReactioN(token, msg.chat.id, msg.message_id, '👍');
        try{
            const outputTemplate = path.join(userDir, "%(title)s.%(ext)s");
            await execPromise(`yt-dlp -o "${outputTemplate}" "${text}"`);
            youtubeSucess = true;
        } catch (error) {
            console.log(error);
        }
    }
     else {
        await addReactioN(token, msg.chat.id, msg.message_id, '💔');
        return bot.sendMessage(msg.chat.id, 'This kind of video I can not yet download, for any help type /help.');
    }

    // If no platform succeeded
    if (!instagramSucess && !tiktokSucess && !xSuccess && !redditSucces && !youtubeSucess) {
        await addReactioN(token, msg.chat.id, msg.message_id, '💔');
        return bot.sendMessage(msg.chat.id, "Error in download, for any help type /help", { reply_to_message_id: msg.message_id });
    }

    // List downloaded files
    const files = fs.readdirSync(userDir).filter(file =>
        file.endsWith('.mp4') || file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp')
    );

    const mp4File = files.find(file => file.endsWith('.mp4'));
    const photo = files.find(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp'));

    // Handling single file downloads
    if (files.length === 1) {
        if (mp4File) {
            const inputPath = path.join(userDir, mp4File);
            const stats = fs.statSync(inputPath);
            const fileSizeInBytes = stats.size;
            const maxSize = 50 * 1024 * 1024;

            // Compress video if too large
            if (fileSizeInBytes > maxSize) {
                bot.sendMessage(msg.chat.id, '⚠️ The video is too large and will be compressed...', { reply_to_message_id: msg.message_id });

                const compressedTempPath = path.join(userDir, 'compresso_' + mp4File);

                await execPromise(`ffmpeg -i "${inputPath}" -vf scale=1280:-2 -b:v 800k -c:v libx264 -preset medium -c:a aac "${compressedTempPath}"`);
                fs.unlinkSync(path.join(userDir, mp4File));

                const file = fs.createReadStream(path.join(compressedTempPath));
                bot.sendVideo(msg.chat.id, file, {
                    filename: compressedTempPath,
                    contentType: 'video/mp4',
                    caption: 'Here is the video. 😻 - @VeloceVid_bot',
                    reply_to_message_id: msg.message_id,
                }).then(() => {
                    fs.unlinkSync(path.join(compressedTempPath));
                });

            } else {
                const file = fs.createReadStream(path.join(userDir, mp4File));
                bot.sendVideo(msg.chat.id, file, {
                    filename: mp4File,
                    contentType: 'video/mp4',
                    caption: 'Here is the video. 😻 - @VeloceVid_bot',
                    reply_to_message_id: msg.message_id,
                }).then(() => {
                    fs.unlinkSync(path.join(userDir, mp4File));
                });
            }
        } else {
            const file = fs.createReadStream(path.join(userDir, photo));
            bot.sendPhoto(msg.chat.id, file, {
                filename: photo,
                contentType: 'photo',
                caption: 'Here are pictures. 😻 - @VeloceVid_bot',
                reply_to_message_id: msg.message_id,
            }).then(() => {
                fs.unlinkSync(path.join(userDir, photo));
            });
        }
    } else {
        // Handle multiple files
        const videos = files.filter(file => file.endsWith('.mp4'));
        const chunkArray = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        // Send photos in chunks
        if (photo) {
            const chunks = chunkArray(files, 10);

            for (const group of chunks) {
                const mediaGroup = group.map((file, index) => ({
                    type: 'photo',
                    media: fs.createReadStream(path.join(userDir, file)),
                    caption: index === 0 ? 'Here are pictures. 😻 - @VeloceVid_bot' : undefined,
                }));

                await bot.sendMediaGroup(msg.chat.id, mediaGroup, {
                    reply_to_message_id: msg.message_id,
                });
            }
        }

        // Send videos in chunks of 2
        if (mp4File) {
            const smallChunks = chunkArray(videos, 2);

            for (const group of smallChunks) {
                const processedGroup = [];

                for (const file of group) {
                    const filePath = path.join(userDir, file);
                    const stats = fs.statSync(filePath);
                    const fileSizeInBytes = stats.size;
                    const maxSize = 50 * 1024 * 1024;

                    if (fileSizeInBytes > maxSize) {
                        bot.sendMessage(msg.chat.id, `⚠️ The video is too large and will be compressed...`, { reply_to_message_id: msg.message_id });

                        const compressedPath = path.join(userDir, 'compressed_' + file);
                        await execPromise(`ffmpeg -i "${filePath}" -vf scale=1280:-2 -b:v 800k -c:v libx264 -preset medium -c:a aac "${compressedPath}"`);

                        fs.unlinkSync(filePath);
                        fs.renameSync(compressedPath, filePath);
                    }

                    processedGroup.push({
                        type: 'video',
                        media: fs.createReadStream(filePath),
                        caption: (processedGroup.length === 0) ? 'Here is the video. 😻 - @VeloceVid_bot' : undefined,
                    });
                }

                await bot.sendMediaGroup(msg.chat.id, processedGroup, {
                    reply_to_message_id: msg.message_id,
                });
            }
        }

        // Cleanup files
        for (const file of files) {
            fs.unlinkSync(path.join(userDir, file));
        }
    }

    // Remove audio files from TikTok downloads
    if (tiktokSucess) {
        fs.readdirSync(userDir).forEach(file => {
            if (file.endsWith('.mp3')) {
                fs.unlinkSync(path.join(userDir, file));
            }
        });
    }
});


// Function to add a reaction to a message
async function addReactioN(token, msgChatId, msgMessageId, emoji) {
    const url = `https://api.telegram.org/bot${token}/setMessageReaction`;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: msgChatId,
            message_id: msgMessageId,
            reaction: [{ type: 'emoji', emoji }],
            is_big: false,
        }),
    });
}

// Utility function to run shell commands and return a Promise
function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve(stdout ? stdout : stderr);
        });
    });
}
