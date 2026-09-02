document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    if (mobile.length !== 10) {
        errorMsg.textContent = 'Please enter a valid 10-digit mobile number.';
        errorMsg.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/patients/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, mobile: mobile })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('patient', JSON.stringify(data.data));
            window.location.href = 'appointment.html';
        } else {
            const errData = await response.json();
            errorMsg.textContent = errData.message || 'Login failed. Please try again.';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Cannot connect to server. Please make sure the backend is running.';
        errorMsg.style.display = 'block';
    }
});
