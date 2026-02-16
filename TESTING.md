# Testing Instructions

Due to limitations in the development environment, I was unable to run and test the application. Here are the instructions on how you can test it yourself.

## Prerequisites

1.  **Node.js and npm:** Make sure you have Node.js and npm installed on your system.
2.  **Telegram Bot Token:** Get a bot token from @BotFather on Telegram.
3.  **Firebase Project:** You should have a Firebase project set up, with Firestore enabled.
4.  **Firebase Service Account Key:** In your Firebase project settings, go to "Service accounts" and generate a new private key. This will download a JSON file.

## Setup and Running

### 1. Backend

1.  **Navigate to the `backend` directory:**
    ```bash
    cd backend
    ```
2.  **Place your Firebase service account key:**
    - Rename the JSON file you downloaded from Firebase to `firebase-service-account-key.json`.
    - Place this file in the `backend` directory.
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The backend should now be running on `http://localhost:3000`.

### 2. Mini-App

The mini-app is a simple static web page. You need to serve it from a web server. For local testing, you can use a simple server like `http-server`.

1.  **Install `http-server` (if you don't have it):**
    ```bash
    npm install -g http-server
    ```
2.  **Navigate to the `mini-app` directory:**
    ```bash
    cd mini-app
    ```
3.  **Start the web server:**
    ```bash
    http-server -p 8080
    ```
    The mini-app should now be accessible at `http://localhost:8080`.

    **Note:** For the mini-app to be able to communicate with the backend, you'll either need to configure CORS on the backend or serve them from the same domain. For local testing, you might need a reverse proxy. A simpler approach for development is to use a tool like `ngrok` to expose your local servers to the internet.

### 3. Bot

1.  **Navigate to the `bot` directory:**
    ```bash
    cd bot
    ```
2.  **Edit `index.js`:**
    - Open `bot/index.js` and replace `'YOUR_TELEGRAM_BOT_TOKEN'` with your actual bot token.
    - You also need to replace `'https://your-mini-app-url.com'` with the public URL of your mini-app. If you are using `ngrok` for the mini-app, this would be your ngrok URL.
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the bot:**
    ```bash
    npm start
    ```

## Testing in Telegram

1.  Open Telegram and find your bot.
2.  Send the `/start` command.
3.  The bot should reply with a message and a button to open the mini-app.
4.  Click the button to open the mini-app.
5.  The mini-app should display your Telegram user information and your initial wallet balance (which should be fetched from the backend).

### Testing Task Completion

1.  In the mini-app, click the "Complete Task" button for one of the tasks.
2.  You should see an alert confirming that the task was completed.
3.  Your balance on the screen should update immediately.
4.  The button for the completed task should become disabled and its text should change to "Completed".
5.  You can also check your Firebase Firestore database to confirm that the user's balance has been updated.

This setup should allow you to test the complete application.
