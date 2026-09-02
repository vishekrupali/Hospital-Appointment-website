let doctor = JSON.parse(localStorage.getItem('doctor'));

function checkAuth() {
    if (!doctor) {
        window.location.href = 'doctor-login.html';
        return;
    }
}

function logout() {
    localStorage.removeItem('doctor');
    window.location.href = 'doctor-login.html';
}

async function loadAppointments() {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:8080/api/appointments');
        
        if (response.ok) {
            const result = await response.json();
            const appointments = result.data;
            const tbody = document.getElementById('appointmentsBody');
            const emptyState = document.getElementById('emptyState');
            
            tbody.innerHTML = '';
            
            if (appointments.length === 0) {
                emptyState.style.display = 'block';
                document.getElementById('totalCount').textContent = '0';
                document.getElementById('confirmedCount').textContent = '0';
                document.getElementById('pendingCount').textContent = '0';
                return;
            }
            
            emptyState.style.display = 'none';
            
            const sorted = appointments.sort((a, b) => {
                return new Date(b.date) - new Date(a.date) || b.time.localeCompare(a.time);
            });
            
            let confirmed = 0;
            let pending = 0;
            
            sorted.forEach(apt => {
                if (apt.status === 'CONFIRMED') confirmed++;
                if (apt.status === 'PENDING') pending++;
                
                const statusClass = apt.status === 'CONFIRMED' ? 'confirmed' : apt.status === 'CANCELLED' ? 'cancelled' : 'pending';
                const dateFormatted = formatDate(apt.date);
                
                const row = document.createElement('tr');
                const displayName = apt.patient_name !== undefined ? apt.patient_name : apt.patientName;
                row.innerHTML = `
                    <td><strong>${displayName}</strong></td>
                    <td>${apt.mobile}</td>
                    <td>${dateFormatted}</td>
                    <td>${apt.time}</td>
                    <td>${apt.reason ? apt.reason : '-'}</td>
                    <td><span class="status-badge ${statusClass}">${apt.status}</span></td>
                    <td>
                        <div class="action-btns">
                            ${apt.status === 'PENDING' ? `
                                <button class="confirm-btn" onclick="updateStatus(${apt.id}, 'CONFIRMED')">Confirm</button>
                                <button class="cancel-btn" onclick="updateStatus(${apt.id}, 'CANCELLED')">Cancel</button>
                            ` : apt.status === 'CONFIRMED' ? `
                                <button class="cancel-btn" onclick="updateStatus(${apt.id}, 'CANCELLED')">Cancel</button>
                            ` : ''}
                        </div>
                    </td>`;
                tbody.appendChild(row);
            });
            
            document.getElementById('totalCount').textContent = appointments.length;
            document.getElementById('confirmedCount').textContent = confirmed;
            document.getElementById('pendingCount').textContent = pending;
        } else {
            errorMsg.textContent = 'Failed to load appointments. Please try again.';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Cannot connect to server. Please make sure the backend is running.';
        errorMsg.style.display = 'block';
    }
}

async function updateStatus(id, status) {
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    
    try {
        const response = await fetch(`http://localhost:8080/api/appointments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });
        
        if (response.ok) {
            successMsg.textContent = `Appointment ${status.toLowerCase()} successfully!`;
            successMsg.style.display = 'block';
            loadAppointments();
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        } else {
            const errData = await response.json();
            errorMsg.textContent = errData.message || 'Failed to update status.';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Cannot connect to server. Please make sure the backend is running.';
        errorMsg.style.display = 'block';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

setInterval(loadAppointments, 30000);

checkAuth();
loadAppointments();
