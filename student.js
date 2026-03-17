// ===== STUDENT DASHBOARD SPECIFIC LOGIC =====

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('contributionChart')) return;
    initContributionChart();
    loadTasks();
    renderFileList();
    updateContributionChart();
});

function initContributionChart() {
    const ctx = document.getElementById('contributionChart');
    if (!ctx) return;
    const contribution = Storage.get('contribution', { my: 42, team: 58 });
    window.contributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Your Contribution', 'Team Contribution'],
            datasets: [{ data: [contribution.my, contribution.team], backgroundColor: ['#0088cc', '#ecf0f1'], borderWidth: 0, cutout: '70%' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

const defaultTasks = [
    { id: '1', title: 'Final Report Draft', due: '2026-03-19', completed: false, project: 'ICT205' },
    { id: '2', title: 'Peer Review Module 3', due: '2026-03-20', completed: true, project: 'ICT205' },
    { id: '3', title: 'Code Review', due: '2026-03-22', completed: false, project: 'Web Dev' }
];

function loadTasks() {
    const tasks = Storage.get('tasks', defaultTasks);
    renderTasks(tasks);
}

function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    if (tasks.length === 0) { taskList.innerHTML = '<p class="hint">No tasks assigned</p>'; return; }
    taskList.innerHTML = tasks.map(task => `
        <div class="task-item">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
            <div class="task-content ${task.completed ? 'completed' : ''}">
                <strong>${task.title}</strong>
                <div class="task-due"><i class="fas fa-calendar"></i> Due: ${formatDate(task.due)}</div>
            </div>
            <span class="badge ${task.completed ? 'badge-success' : 'badge-danger'}">${task.completed ? 'Done' : 'Pending'}</span>
        </div>
    `).join('');
}

function toggleTask(taskId) {
    let tasks = Storage.get('tasks', defaultTasks);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        Storage.set('tasks', tasks);
        renderTasks(tasks);
        if (task.completed) { updateContribution('task'); showToast(`✓ "${task.title}" completed!`); }
    }
}

function addNewTask() {
    const title = prompt('Enter task title:');
    if (!title) return;
    const newTask = { id: generateId(), title, due: '2026-03-25', completed: false, project: 'ICT205' };
    const tasks = Storage.get('tasks', defaultTasks);
    tasks.push(newTask);
    Storage.set('tasks', tasks);
    renderTasks(tasks);
    showToast('Task added');
}