// =====My Part: STUDENT DASHBOARD CORE LOGIC =====

// ===== LOGIN FUNCTION =====
function handleLogin() {
    const role = document.getElementById('role-select').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    // Store user session
    const currentUser = {
        name: role === 'student' ? 'Student' : 'Dr. Smith',
        email: email,
        role: role
    };
    
    Storage.set('currentUser', currentUser);
    Storage.set('session', { loggedIn: true, timestamp: Date.now() });
    
    showToast('Login successful!');
    
    // Redirect based on role
    setTimeout(() => {
        if (role === 'student') {
            window.location.href = 'student.html';
        } else if (role === 'lecturer') {
            window.location.href = 'lecturer.html';
        }
    }, 1000);
}

// ===== LOGOUT FUNCTION =====
function logout() {
    Storage.remove('currentUser');
    Storage.remove('session');
    showToast('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ===== PAGE LOAD INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (for dashboard pages)
    const currentUser = Storage.get('currentUser');
    const isLoginPage = window.location.href.includes('index.html');
    
    if (!currentUser && !isLoginPage) {
        // Auto-create demo user for presentation purposes
        Storage.set('currentUser', { name: 'Student', email: 'student@bac.ac.bw', role: 'student' });
    }
    
    // Update user info in header if exists
    if (currentUser) {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = currentUser.name || 'User';
        }
    }
    
    // Initialize student dashboard features
    initFileUpload();
    initEditorSync();
    initNavigation();
});

// ===== NAVIGATION FUNCTIONS (ALL LINKS WORK) =====
function initNavigation() {
    // Handle all nav item clicks
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });
}

// Navigate to Analytics page (placeholder for MVP)
function showAnalytics() {
    showToast('📊 Analytics page coming in v2.0 - Track your progress over time!');

}

// Navigate to Export Report
function showExportReport() {
    exportReport();
}

// Navigate to Dashboard
function showDashboard() {
    window.location.href = 'student.html';
}

// ===== NOTIFICATIONS =====
function showNotifications() {
    const notifications = Storage.get('notifications', []);
    if (notifications.length === 0) {
        showToast('🔔 No new notifications');
    } else {
        showToast(`🔔 ${notifications.length} new notification(s)`);
    }
}

// ===== EDITOR FUNCTIONS (CO-EDIT WORKSPACE) =====
function formatText(command) {
    document.execCommand(command, false, null);
    const editor = document.getElementById('editor');
    if (editor) {
        editor.focus();
        autoSaveEditor();
    }
}

function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        document.execCommand('createLink', false, url);
        autoSaveEditor();
    }
}

// Auto-save editor content
let saveTimeout;
function autoSaveEditor() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveDocument();
    }, 2000); // Save after 2 seconds of inactivity
}

function saveDocument() {
    const editor = document.getElementById('editor');
    if (editor) {
        const content = editor.innerHTML;
        Storage.set('documentContent', content);
        const lastSavedEl = document.getElementById('last-saved');
        if (lastSavedEl) {
            lastSavedEl.textContent = 'Just now';
        }
        showToast('✅ Document saved to cloud');
        
        // Update contribution for editing activity
        updateContribution('edit');
    }
}

function exportDocument() {
    const editor = document.getElementById('editor');
    if (editor) {
        const text = editor.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'group-proposal.txt';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Document exported successfully');
    }
}

function initEditorSync() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    // Load saved content
    const savedContent = Storage.get('documentContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }
    
    // Save on input
    editor.addEventListener('input', autoSaveEditor);
}

// ===== FILE UPLOAD FUNCTIONS =====
function initFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    if (!dropZone) return;
    
    // Drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight on drag
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });
    
    // Handle drop
    dropZone.addEventListener('drop', handleDrop, false);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(event) {
    handleFiles(event.target.files);
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast('❌ File too large (max 10MB)', 'error');
            return;
        }
        
        // Create file record
        const fileRecord = {
            id: generateId(),
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded'
        };
        
        // Save to storage
        const files = Storage.get('files', []);
        files.push(fileRecord);
        Storage.set('files', files);
        
        // Update UI
        renderFileList();
        
        // Update contribution
        updateContribution('upload');
        
        showToast(`✅ ${file.name} uploaded`);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderFileList() {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;
    
    const files = Storage.get('files', []);
    
    if (files.length === 0) {
        fileList.innerHTML = '<p class="hint">📂 No files uploaded yet</p>';
        return;
    }
    
    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <i class="fas fa-file-${getFileIcon(file.type)}"></i>
                <div>
                    <strong>${file.name}</strong><br>
                    <small>${file.size} • ${formatDate(file.uploadedAt)}</small>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-sm btn-outline" onclick="downloadFile('${file.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-sm btn-outline" onclick="deleteFile('${file.id}')" style="color:#e74c3c">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function getFileIcon(type) {
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('word') || type.includes('document')) return 'word';
    return 'file';
}

function downloadFile(fileId) {
    const files = Storage.get('files', []);
    const file = files.find(f => f.id === fileId);
    if (file) {
        showToast(`📥 Downloading ${file.name}...`);
        // In production: trigger actual download from AFRICLOUD server
    }
}

function deleteFile(fileId) {
    if (!confirm('🗑️ Delete this file?')) return;
    
    let files = Storage.get('files', []);
    files = files.filter(f => f.id !== fileId);
    Storage.set('files', files);
    
    renderFileList();
    showToast('File deleted');
}

// ===== CONTRIBUTION TRACKING =====
function updateContribution(activity) {
    const contribution = Storage.get('contribution', { my: 42, team: 58 });
    
    
    const increments = { edit: 1, upload: 2, task: 3 };
    const increment = increments[activity] || 1;
    
    contribution.my = Math.min(100, contribution.my + increment);
    contribution.team = Math.max(0, 100 - contribution.my);
    
    Storage.set('contribution', contribution);
    
    // Update UI if chart exists
    updateContributionChart();
}

function updateContributionChart() {
    const contribution = Storage.get('contribution', { my: 42, team: 58 });
    
    // Update stat displays
    const myEl = document.getElementById('my-contribution');
    const teamEl = document.getElementById('team-contribution');
    if (myEl) myEl.textContent = `${contribution.my}%`;
    if (teamEl) teamEl.textContent = `${contribution.team}%`;
    
    // Update Chart.js if initialized
    if (window.contributionChart) {
        window.contributionChart.data.datasets[0].data = [contribution.my, contribution.team];
        window.contributionChart.update();
    }
}

// ===== EXPORT REPORT (PDF GENERATION) =====
function exportReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const currentUser = Storage.get('currentUser', { name: 'Student' });
    
    doc.setFontSize(18);
    doc.text('Agile Atlas - Contribution Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Student: ${currentUser.name || 'Student'}`, 20, 40);
    doc.text(`Email: ${currentUser.email || 'student@bac.ac.bw'}`, 20, 50);
    
    const contribution = Storage.get('contribution', { my: 42, team: 58 });
    doc.text(`\nYour Contribution: ${contribution.my}%`, 20, 70);
    doc.text(`Team Contribution: ${contribution.team}%`, 20, 80);
    
    const tasks = Storage.get('tasks', []);
    doc.text('\nCompleted Tasks:', 20, 100);
    tasks.filter(t => t.completed).forEach((task, i) => {
        doc.text(`• ${task.title}`, 25, 110 + (i * 7));
    });
    
    const files = Storage.get('files', []);
    doc.text('\nSubmitted Files:', 20, 150);
    files.forEach((file, i) => {
        doc.text(`• ${file.name}`, 25, 160 + (i * 7));
    });
    
    doc.save('AgileAtlas_Contribution_Report.pdf');
    showToast('📄 PDF report downloaded!');
}

// ===== MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.handleLogin = handleLogin;
window.logout = logout;
window.showNotifications = showNotifications;
window.showAnalytics = showAnalytics;
window.showExportReport = showExportReport;
window.showDashboard = showDashboard;
window.formatText = formatText;
window.insertLink = insertLink;
window.saveDocument = saveDocument;
window.exportDocument = exportDocument;
window.handleFileSelect = handleFileSelect;
window.downloadFile = downloadFile;
window.deleteFile = deleteFile;
window.updateContribution = updateContribution;
window.exportReport = exportReport;