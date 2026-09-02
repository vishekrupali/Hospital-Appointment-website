document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:8080/api/doctor/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('doctor', JSON.stringify(data));
            successMsg.textContent = 'Login successful! Redirecting...';
            successMsg.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'doctor-dashboard.html';
            }, 1000);
        } else {
            const errData = await response.json();
            errorMsg.textContent = errData.message || 'Invalid username or password.';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Cannot connect to server. Please make sure the backend is running.';
        errorMsg.style.display = 'block';
    }
});
