window.Telegram.WebApp.ready();

const tg = window.Telegram.WebApp;
// WARNING: tg.initDataUnsafe is unsafe and should only be used for development.
// In a production environment, you must validate the data on your backend server.
// See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
const userInfo = tg.initDataUnsafe.user;
const backendUrl = 'https://your-backend-url.com'; // IMPORTANT: Replace with your backend URL
let userBalance = 0;

function updateBalance(newBalance) {
    userBalance = newBalance;
    document.getElementById('balance').innerText = userBalance.toLocaleString();
}

if (userInfo) {
    document.getElementById('user-info').innerText = `Hello, ${userInfo.first_name}!`;
}

// Fetch user data from the backend
if (userInfo && userInfo.id) {
    fetch(`${backendUrl}/api/user-data?userId=${userInfo.id}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.balance !== undefined) {
                updateBalance(data.balance);
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            document.getElementById('balance').innerText = 'Error';
        });
} else {
    document.getElementById('balance').innerText = 'N/A';
}

// Handle task completion
document.querySelectorAll('.task-btn').forEach(button => {
    button.addEventListener('click', () => {
        const taskId = button.dataset.taskId;
        const reward = parseInt(button.dataset.reward, 10);

        if (userInfo && userInfo.id) {
            fetch(`${backendUrl}/api/complete-task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userInfo.id, taskId, reward }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateBalance(userBalance + reward);
                    alert('Task completed successfully!');
                    button.disabled = true;
                    button.innerText = 'Completed';
                } else {
                    alert('Failed to complete task: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error completing task:', error);
                alert('An error occurred while completing the task.');
            });
        }
    });
});
