const express = require('express');
const admin = require('firebase-admin');

const app = express();
const port = 3000;

// Firebase Admin SDK configuration
// IMPORTANT: You need to generate a private key file for your service account in the Firebase console
// and save it as 'firebase-service-account-key.json' in the 'backend' directory.
const serviceAccount = require('./firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

app.use(express.json());

// A simple endpoint to get user data
app.get('/api/user-data', async (req, res) => {
    const userId = req.query.userId; // Passed from the mini-app

    if (!userId) {
        return res.status(400).send('userId is required');
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            // If the user doesn't exist, create a new one
            const newUser = {
                id: userId,
                balance: 1000, // Starting balance
                createdAt: new Date(),
            };
            await db.collection('users').doc(userId).set(newUser);
            res.json(newUser);
        } else {
            res.json(doc.data());
        }
    } catch (error) {
        console.error('Error getting user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/complete-task', async (req, res) => {
    const { userId, taskId, reward } = req.body;

    if (!userId || !taskId || !reward) {
        return res.status(400).send('userId, taskId, and reward are required');
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // In a real app, you would have more sophisticated logic to check if the task was actually completed
        // and to prevent a user from completing the same task multiple times.
        // For this example, we'll just increment the balance.

        await userRef.update({
            balance: admin.firestore.FieldValue.increment(reward)
        });

        // Optionally, you could also record the completed task in a subcollection.
        // For example:
        // await userRef.collection('completedTasks').doc(taskId).set({
        //     completedAt: new Date()
        // });

        res.json({ success: true, message: 'Task completed successfully' });

    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
