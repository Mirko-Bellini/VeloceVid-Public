# VeloceVid - @VeloceVid_bot

**VeloceVid** is a powerful Telegram bot designed to download content from various social platforms like TikTok, Instagram, and others.  
It supports video, image, and gallery downloads by leveraging tools like `yt-dlp`, `gallery-dl`, and `ffmpeg`.  
The bot uses cookies for authenticated access to certain platforms.  
It is available publicly on Telegram at [@VeloceVid_bot](https://t.me/VeloceVid_bot).

---

## 📑 Index

- 🔧 [Installation](#-installation)
- ⚙️ [Configuration](#️-configuration)
- 🚀 [How to Use](#-how-to-use)
- 🔐 [Cookies](#-cookies)
- 📁 [Project Structure](#-project-structure)
- ✅ [Disclaimer](#-disclaimer)
- 🧠 [Notes](#-notes)

---

## 🔧 Installation

Clone the repository using `git`:

```bash
git clone https://github.com/Mirko-Bellini/VeloceVid-Public.git

cd VeloceVid-Public
```
Make sure you have Node.js and Python installed on your system.

---

## ⚙️ Configuration

To run the bot properly, ensure you have the following tools installed and available in your system PATH:

* [Python](https://www.python.org/) - To install and operate yt-dlp and gallery-dl

* [Node.js](https://nodejs.org/en) - To start the bot

* [yt-dlp](https://github.com/yt-dlp/yt-dlp) – used for downloading video content

* [gallery-dl](https://github.com/mikf/gallery-dl) – used for downloading galleries and image posts

* [ffmpeg](https://ffmpeg.org/) – used for video/audio processing

Install them as follows:
## Python Dependencies:
```bash
pip install -U yt-dlp 

pip install -U gallery-dl
```
## Node.js Installation (Linux):
```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.18.0".
nvm current # Should print "v22.18.0".

# Verify npm version:
npm -v # Should print "10.9.3".
```

## FFmpeg Installation (Linux):
```bash
sudo apt install ffmpeg
```
> On Windows, download from [ffmpeg.org](https://ffmpeg.org/download.html) and add the bin folder to your system PATH.

## Node.js Dependencies:
Install the required Node.js modules (`including node-telegram-bot-api`):
```bash
npm installs
```

---

## 🚀 How to Use
The bot is built using Node.js and the node-telegram-bot-api package.

## 1. Create the .env File
Before starting the bot, create a file named .env in the root directory of the project and add your bot token:
```bash
TOKEN="Your token bot here"
```

## 2. Start the Bot
Run the bot with:
```bash
node index.js
```

---

## 🔐 Cookies
To allow content downloads from platforms that require login (e.g., TikTok, Instagram), you must place valid cookies in the appropriate format in a folder used by the bot.

Each platform requires its own cookie file.

---

## 📁 Project Structure
* `/Database` – stores the Chat ID of each user that interacts with the bot.
It is used to:
    * Broadcast messages (e.g., when the bot is offline or back online)
    * Keep track of users who accepted the disclaimer
* `/users` – used to organize downloaded content.

Each user gets their own subfolder for better structure and file management.

---

## ✅ Disclaimer
The bot may require users to accept a disclaimer before use. The acceptance is stored in the Database folder to persist their agreement.

---

## 🧠 Notes
* Make sure all tools (yt-dlp, gallery-dl, ffmpeg) are correctly installed and accessible from the terminal.
* If a download fails, check whether the required cookie for that platform is available and valid.