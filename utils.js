// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if(!toast) return;
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 3000);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-BW', options);
}

// LocalStorage Wrapper
const Storage = {
    get(key, defaultValue = null) {
        const item = localStorage.getItem(`agileAtlas_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    },
    set(key, value) {
        localStorage.setItem(`agileAtlas_${key}`, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(`agileAtlas_${key}`);
    }
};

// PDF Generation (jsPDF)
async function generatePDF(data, filename = 'report.pdf') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Agile Atlas - Contribution Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Student: ${Storage.get('currentUser', 'Student').name || 'Student'}`, 20, 40);
    
    const contribution = Storage.get('contribution', { my: 42, team: 58 });
    doc.text(`Your Contribution: ${contribution.my}%`, 20, 60);
    
    const tasks = Storage.get('tasks', []);
    doc.text('\nCompleted Tasks:', 20, 80);
    tasks.filter(t => t.completed).forEach((task, i) => {
        doc.text(`• ${task.title}`, 25, 90 + (i * 7));
    });
    
    const files = Storage.get('files', []);
    doc.text('\nSubmitted Files:', 20, 140);
    files.forEach((file, i) => {
        doc.text(`• ${file.name}`, 25, 150 + (i * 7));
    });
    
    doc.save(filename);
    showToast('PDF report generated successfully!');
}

function exportReport() {
    generatePDF({}, 'AgileAtlas_Contribution_Report.pdf');
}