/**
 * GroupTrack Lecturer Dashboard Logic
 * Implements functionality for monitoring student contributions
 */

// Global chart instance
let lecturerChart = null;

// Sample data (in production, this would come from utils.Storage or API)
const sampleGroups = {
    labels: ['Group A', 'Group B', 'Group C'],
    data: [85, 45, 90]
};

const sampleStudents = [
    { name: 'Alice Johnson', tasks: 12, files: 5, contribution: 25, status: 'Active' },
    { name: 'Bob Smith', tasks: 2, files: 0, contribution: 5, status: 'Idle' },
    { name: 'Charlie Lee', tasks: 8, files: 3, contribution: 15, status: 'At Risk' },
    { name: 'Diana Prince', tasks: 10, files: 4, contribution: 22, status: 'Active' },
    { name: 'Evan Wright', tasks: 1, files: 0, contribution: 8, status: 'Idle' }
];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initLecturerChart();
    updateStatusCounts();
    renderStudentTable();
    setupEventListeners();
});

/**
 * 1. Creates a bar chart for group performance
 */
function initLecturerChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    lecturerChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sampleGroups.labels,
            datasets: [{
                label: 'Group Contribution Score',
                data: sampleGroups.data,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            onClick: handleChartClick,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

/**
 * 2. Handles click events on chart bars to view student details
 */
function handleChartClick(evt, elements) {
    if (elements.length > 0) {
        const index = elements[0].index;
        const groupName = sampleGroups.labels[index];
        utils.showToast(`Viewing details for ${groupName}`);
        
        // Ensure table is visible when chart is clicked
        const tableSection = document.getElementById('drilldownSection');
        if (tableSection.style.display === 'none') {
            toggleDrilldown();
        }
    }
}

/**
 * 3. Shows or hides the student detail table
 */
function toggleDrilldown() {
    const tableSection = document.getElementById('drilldownSection');
    const toggleBtn = document.getElementById('btnToggleTable');
    
    if (tableSection.style.display === 'none' || tableSection.style.display === '') {
        tableSection.style.display = 'block';
        toggleBtn.textContent = 'Hide Details';
    } else {
        tableSection.style.display = 'none';
        toggleBtn.textContent = 'Show Details';
    }
}

/**
 * 4. Exports class-wide reports as a PDF
 */
function generateLecturerPDF() {
    const reportData = {
        title: 'GroupTrack Class Report',
        date: utils.formatDate(new Date()),
        groups: sampleGroups,
        students: sampleStudents
    };
    
    utils.generatePDF(reportData, 'lecturer_report.pdf');
    utils.showToast('PDF Report generated successfully');
}

/**
 * 5. Sends alerts to students with low contribution
 */
function notifyLowContributors() {
    const lowContributors = sampleStudents.filter(s => s.contribution < 15);
    
    if (lowContributors.length > 0) {
        const names = lowContributors.map(s => s.name).join(', ');
        utils.showToast(`Alert sent to: ${names}`);
        utils.Storage.set('last_notification', new Date().toISOString());
    } else {
        utils.showToast('No low contributors found');
    }
}

/**
 * 6. Provides AI-based workload balancing suggestions
 */
function getAISuggestion() {
    const atRiskGroups = sampleGroups.data.filter(score => score < 50);
    
    if (atRiskGroups.length > 0) {
        utils.showToast('AI Suggestion: Reallocate tasks from Group C to Group B to balance workload.');
    } else {
        utils.showToast('AI Suggestion: All groups are performing within optimal parameters.');
    }
}

/**
 * Export reports function
 */
function exportReports() {
    generateLecturerPDF();
}

/**
 * Helper: Setup Event Listeners for Action Buttons
 */
function setupEventListeners() {
    document.getElementById('btnExportPDF').addEventListener('click', generateLecturerPDF);
    document.getElementById('btnAISuggest').addEventListener('click', getAISuggestion);
    document.getElementById('btnNotify').addEventListener('click', notifyLowContributors);
    document.getElementById('btnToggleTable').addEventListener('click', toggleDrilldown);
}

/**
 * Helper: Render Student Table
 */
function renderStudentTable() {
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';
    
    sampleStudents.forEach(student => {
        const row = document.createElement('tr');
        const statusClass = student.status === 'Active' ? 'status-active' : 
                            student.status === 'At Risk' ? 'status-at-risk' : 'status-idle';
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.tasks}</td>
            <td>${student.files}</td>
            <td>${student.contribution}%</td>
            <td><span class="badge ${statusClass}">${student.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Helper: Update Status Counts in Cards
 */
function updateStatusCounts() {
    const active = sampleStudents.filter(s => s.status === 'Active').length;
    const atRisk = sampleStudents.filter(s => s.status === 'At Risk').length;
    const idle = sampleStudents.filter(s => s.status === 'Idle').length;
    
    document.getElementById('activeCount').textContent = active;
    document.getElementById('atRiskCount').textContent = atRisk;
    document.getElementById('idleCount').textContent = idle;
