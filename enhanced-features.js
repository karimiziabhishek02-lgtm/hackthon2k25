// Enhanced Features for Student Finance Manager

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
        this.animateThemeChange();
    }

    updateThemeIcon() {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    animateThemeChange() {
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
}

// Enhanced Data Storage
class DataManager {
    constructor() {
        this.storageKey = 'financeAI_data';
        this.init();
    }

    init() {
        this.loadData();
        this.setupAutoSave();
    }

    saveData() {
        const data = {
            expenses: expenses,
            goals: goals,
            currentUser: currentUser,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.showToast('Data saved successfully!', 'success');
    }

    loadData() {
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.expenses) expenses = data.expenses;
                if (data.goals) goals = data.goals;
                if (data.currentUser) currentUser = { ...currentUser, ...data.currentUser };
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveData();
        }, 30000);
    }

    exportData() {
        const data = {
            expenses: expenses,
            goals: goals,
            currentUser: currentUser,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('successToast');
        const messageEl = document.getElementById('toastMessage');
        
        if (toast && messageEl) {
            messageEl.textContent = message;
            toast.className = `toast toast-${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }
}

// Enhanced Notification System
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
        this.updateNotificationCount();
    }

    setupEventListeners() {
        const bell = document.getElementById('notificationBell');
        if (bell) {
            bell.addEventListener('click', () => this.toggleNotificationPanel());
        }
    }

    addNotification(title, message, type = 'info', priority = 'normal') {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            priority,
            timestamp: new Date(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.updateNotificationCount();
        this.renderNotifications();
        
        // Play sound for high priority notifications
        if (priority === 'high') {
            this.playNotificationSound();
        }
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.toggle('show');
            this.renderNotifications();
        }
    }

    renderNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="no-notifications">No notifications</div>';
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${this.formatTime(notification.timestamp)}</small>
                </div>
                <button class="notification-close" onclick="notificationManager.removeNotification(${notification.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'bell';
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
        return `${Math.floor(minutes / 1440)}d ago`;
    }

    updateNotificationCount() {
        const count = this.notifications.filter(n => !n.read).length;
        const countEl = document.getElementById('notificationCount');
        
        if (countEl) {
            countEl.textContent = count;
            countEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.updateNotificationCount();
        this.renderNotifications();
    }

    saveNotifications() {
        localStorage.setItem('financeAI_notifications', JSON.stringify(this.notifications));
    }

    loadNotifications() {
        const saved = localStorage.getItem('financeAI_notifications');
        if (saved) {
            try {
                this.notifications = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        }
    }

    playNotificationSound() {
        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Audio not supported');
        }
    }
}

// Voice Command System
class VoiceCommandManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.init();
    }

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.setupRecognition();
            this.setupEventListeners();
        } else {
            console.log('Speech recognition not supported');
            const voiceBtn = document.getElementById('voiceCommand');
            if (voiceBtn) voiceBtn.style.display = 'none';
        }
    }

    setupRecognition() {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.processCommand(command);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.stopListening();
        };
    }

    setupEventListeners() {
        const voiceBtn = document.getElementById('voiceCommand');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleListening());
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (this.recognition) {
            this.recognition.start();
            this.isListening = true;
            this.updateVoiceButton();
            notificationManager.addNotification('Voice Command', 'Listening for commands...', 'info');
        }
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
            this.isListening = false;
            this.updateVoiceButton();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceCommand');
        if (voiceBtn) {
            const icon = voiceBtn.querySelector('i');
            if (this.isListening) {
                icon.className = 'fas fa-microphone-slash';
                voiceBtn.classList.add('listening');
            } else {
                icon.className = 'fas fa-microphone';
                voiceBtn.classList.remove('listening');
            }
        }
    }

    processCommand(command) {
        console.log('Voice command:', command);
        
        if (command.includes('add expense')) {
            openExpenseModal();
            notificationManager.addNotification('Voice Command', 'Opening expense form', 'success');
        } else if (command.includes('create goal')) {
            openGoalModal();
            notificationManager.addNotification('Voice Command', 'Opening goal form', 'success');
        } else if (command.includes('show dashboard')) {
            showSection('dashboard');
            notificationManager.addNotification('Voice Command', 'Showing dashboard', 'success');
        } else if (command.includes('show expenses')) {
            showSection('expenses');
            notificationManager.addNotification('Voice Command', 'Showing expenses', 'success');
        } else if (command.includes('show analytics')) {
            showSection('analytics');
            notificationManager.addNotification('Voice Command', 'Showing analytics', 'success');
        } else {
            notificationManager.addNotification('Voice Command', 'Command not recognized', 'warning');
        }
    }
}

// Enhanced AI Insights
class AIInsightsEngine {
    constructor() {
        this.insights = [];
        this.patterns = {};
    }

    generateAdvancedInsights() {
        this.insights = [];
        
        // Analyze spending patterns
        this.analyzeSpendingPatterns();
        this.analyzeBudgetHealth();
        this.analyzeGoalProgress();
        this.predictFutureSpending();
        
        return this.insights;
    }

    analyzeSpendingPatterns() {
        const categoryTotals = this.getCategoryTotals();
        const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        
        // Find highest spending category
        const maxCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b
        );
        
        if (categoryTotals[maxCategory] > totalSpending * 0.4) {
            this.insights.push({
                type: 'warning',
                title: 'High Category Spending',
                message: `${maxCategory.charAt(0).toUpperCase() + maxCategory.slice(1)} accounts for ${Math.round((categoryTotals[maxCategory] / totalSpending) * 100)}% of your spending. Consider diversifying your expenses.`,
                priority: 'high'
            });
        }
    }

    analyzeBudgetHealth() {
        const monthlyExpenses = this.getMonthlyExpenses();
        const budgetUsage = (monthlyExpenses / currentUser.monthlyBudget) * 100;
        
        if (budgetUsage > 90) {
            this.insights.push({
                type: 'error',
                title: 'Budget Exceeded',
                message: `You've used ${budgetUsage.toFixed(1)}% of your monthly budget. Immediate action required!`,
                priority: 'high'
            });
        } else if (budgetUsage > 75) {
            this.insights.push({
                type: 'warning',
                title: 'Budget Alert',
                message: `You've used ${budgetUsage.toFixed(1)}% of your monthly budget. Consider reducing expenses.`,
                priority: 'medium'
            });
        }
    }

    analyzeGoalProgress() {
        goals.forEach(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft < 30 && progress < 80) {
                this.insights.push({
                    type: 'warning',
                    title: 'Goal At Risk',
                    message: `Your "${goal.name}" goal is ${progress.toFixed(1)}% complete with only ${daysLeft} days left.`,
                    priority: 'medium'
                });
            }
        });
    }

    predictFutureSpending() {
        const recentExpenses = expenses.slice(0, 10);
        const avgDailySpending = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 10;
        const projectedMonthly = avgDailySpending * 30;
        
        if (projectedMonthly > currentUser.monthlyBudget) {
            this.insights.push({
                type: 'warning',
                title: 'Spending Projection',
                message: `Based on recent patterns, you're projected to spend ₹${projectedMonthly.toFixed(0)} this month, exceeding your budget by ₹${(projectedMonthly - currentUser.monthlyBudget).toFixed(0)}.`,
                priority: 'high'
            });
        }
    }

    getCategoryTotals() {
        const totals = {};
        expenses.forEach(expense => {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        });
        return totals;
    }

    getMonthlyExpenses() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);
    }
}

// Initialize enhanced features
let themeManager, dataManager, notificationManager, voiceCommandManager, aiInsightsEngine;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced features
    themeManager = new ThemeManager();
    dataManager = new DataManager();
    notificationManager = new NotificationManager();
    voiceCommandManager = new VoiceCommandManager();
    aiInsightsEngine = new AIInsightsEngine();
    
    // Setup export functionality
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => dataManager.exportData());
    }
    
    // Add sample notifications
    setTimeout(() => {
        notificationManager.addNotification(
            'Budget Alert',
            'You\'ve spent 85% of your monthly budget',
            'warning',
            'high'
        );
        notificationManager.addNotification(
            'Goal Achievement',
            'You\'re 74% towards your Emergency Fund goal!',
            'success'
        );
        notificationManager.addNotification(
            'Spending Tip',
            'Consider meal planning to save ₹500 this month',
            'info'
        );
    }, 2000);
});

// Enhanced close notifications function
function closeNotifications() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.remove('show');
    }
}

// Enhanced file upload handling
document.addEventListener('DOMContentLoaded', function() {
    const receiptUpload = document.getElementById('receiptUpload');
    const fileInput = document.getElementById('expenseReceipt');
    
    if (receiptUpload && fileInput) {
        receiptUpload.addEventListener('click', () => fileInput.click());
        
        receiptUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            receiptUpload.classList.add('dragover');
        });
        
        receiptUpload.addEventListener('dragleave', () => {
            receiptUpload.classList.remove('dragover');
        });
        
        receiptUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            receiptUpload.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileUpload(files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }
});

function handleFileUpload(file) {
    const receiptUpload = document.getElementById('receiptUpload');
    if (receiptUpload) {
        receiptUpload.innerHTML = `
            <i class="fas fa-check-circle" style="color: #10b981;"></i>
            <p style="color: #10b981;">Receipt uploaded: ${file.name}</p>
        `;
    }
    
    // Simulate AI processing
    setTimeout(() => {
        notificationManager.addNotification(
            'Receipt Processed',
            'AI has extracted expense details from your receipt',
            'success'
        );
    }, 1500);
}
