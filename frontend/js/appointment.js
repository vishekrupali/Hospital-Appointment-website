let selectedTime = null;
let patient = JSON.parse(localStorage.getItem('patient'));

if (patient && patient.data && !patient.id) {
    patient = patient.data;
    localStorage.setItem('patient', JSON.stringify(patient));
}

function checkAuth() {
    if (!patient) {
        window.location.href = 'patient-login.html';
        return;
    }
    document.getElementById('userNameDisplay').textContent = patient.name;
}

function logout() {
    localStorage.removeItem('patient');
    window.location.href = 'patient-login.html';
}

function setMinDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    document.getElementById('aptDate').min = `${yyyy}-${mm}-${dd}`;
}

document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', function() {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');
        selectedTime = this.dataset.time;
    });
});

document.getElementById('appointmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const date = document.getElementById('aptDate').value;
    const reason = document.getElementById('reason').value.trim();
    
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    if (!selectedTime) {
        errorMsg.textContent = 'Please select a time slot.';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (!patient) {
        window.location.href = 'patient-login.html';
        return;
    }
    
    const appointmentData = {
        patientId: patient.id,
        patientName: patient.name,
        mobile: patient.mobile,
        date: date,
        time: selectedTime,
        reason: reason,
        status: 'PENDING'
    };
    
    try {
        const response = await fetch('http://localhost:8080/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });
        
        if (response.ok) {
            const result = await response.json();
            const data = result.data;
            successMsg.textContent = 'Appointment booked successfully!';
            successMsg.style.display = 'block';
            
            document.getElementById('confirmName').textContent = patient.name;
            document.getElementById('confirmDate').textContent = data.date;
            document.getElementById('confirmTime').textContent = data.time;
            document.getElementById('confirmationModal').classList.add('active');
            
            document.getElementById('aptDate').value = '';
            document.getElementById('reason').value = '';
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            selectedTime = null;
            
            loadMyAppointments();
        } else {
            const errData = await response.json();
            errorMsg.textContent = errData.message || 'Failed to book appointment.';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Cannot connect to server. Please make sure the backend is running.';
        errorMsg.style.display = 'block';
    }
});

function closeModal() {
    document.getElementById('confirmationModal').classList.remove('active');
}

async function loadMyAppointments() {
    if (!patient) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/appointments/patient/${patient.id}`);
        
        if (response.ok) {
            const result = await response.json();
            const appointments = result.data;
            const listContainer = document.getElementById('appointmentList');
            listContainer.innerHTML = '';
            
            if (appointments.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📋</div>
                        <p>No appointments booked yet. Book your first appointment above!</p>
                    </div>`;
                return;
            }
            
            const sorted = appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sorted.forEach(apt => {
                const statusClass = apt.status === 'CONFIRMED' ? 'confirmed' : apt.status === 'CANCELLED' ? 'cancelled' : 'pending';
                const dateFormatted = formatDate(apt.date);
                
                const item = document.createElement('div');
                item.className = 'appointment-item';
                item.innerHTML = `
                    <div class="apt-info">
                        <h4>${dateFormatted}</h4>
                        <p>${apt.reason ? apt.reason : 'General Consultation'}</p>
                        <span class="status-badge ${statusClass}">${apt.status}</span>
                    </div>
                    <div class="apt-time">
                        <div class="time">🕐 ${apt.time}</div>
                        <div class="date">${apt.id ? 'Booking #' + apt.id : ''}</div>
                    </div>`;
                listContainer.appendChild(item);
            });
        }
    } catch (err) {
        console.error('Failed to load appointments:', err);
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

checkAuth();
setMinDate();
loadMyAppointments();
