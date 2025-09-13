// Student Finance Manager - AI-Powered JavaScript

// Global Variables
let expenses = [];
let goals = [];
let budgets = {};
let currentUser = {
    balance: 12450,
    monthlyIncome: 15000,
    monthlyBudget: 10000
};

// Sample Data for Demo
const sampleExpenses = [
    { id: 1, amount: 250, description: "Lunch at cafeteria", category: "food", date: "2024-01-15", aiCategory: "food" },
    { id: 2, amount: 50, description: "Bus fare", category: "transport", date: "2024-01-15", aiCategory: "transport" },
    { id: 3, amount: 500, description: "Movie tickets", category: "entertainment", date: "2024-01-14", aiCategory: "entertainment" },
    { id: 4, amount: 1200, description: "Textbooks", category: "education", date: "2024-01-13", aiCategory: "education" },
    { id: 5, amount: 300, description: "Groceries", category: "food", date: "2024-01-12", aiCategory: "food" }
];

const sampleGoals = [
    { id: 1, name: "Emergency Fund", targetAmount: 5000, currentAmount: 3700, deadline: "2024-06-30", category: "emergency" },
    { id: 2, name: "New Laptop", targetAmount: 50000, currentAmount: 15000, deadline: "2024-08-15", category: "gadget" },
    { id: 3, name: "Summer Trip", targetAmount: 20000, currentAmount: 5000, deadline: "2024-05-30", category: "travel" }
];

// AI Expense Categorization
const aiCategoryKeywords = {
    food: ['lunch', 'dinner', 'breakfast', 'restaurant', 'cafe', 'food', 'meal', 'pizza', 'burger', 'coffee', 'snack', 'groceries'],
    transport: ['bus', 'taxi', 'uber', 'metro', 'train', 'fuel', 'petrol', 'parking', 'auto', 'rickshaw'],
    entertainment: ['movie', 'cinema', 'game', 'concert', 'party', 'club', 'music', 'streaming', 'netflix'],
    education: ['book', 'course', 'fee', 'tuition', 'exam', 'study', 'library', 'stationery', 'notebook'],
    shopping: ['clothes', 'shirt', 'shoes', 'shopping', 'mall', 'online', 'amazon', 'flipkart', 'dress'],
    utilities: ['electricity', 'water', 'internet', 'phone', 'mobile', 'recharge', 'bill', 'wifi']
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
    updateDashboard();
    initializeCharts();
    showBudgetAlert();
});

function initializeApp() {
    // Set current date for expense form
    const today = new Date().toISOString().split('T')[0];
    const expenseDateInput = document.getElementById('expenseDate');
    if (expenseDateInput) {
        expenseDateInput.value = today;
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Sidebar menu
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', handleSidebarClick);
    });

    // Forms
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }

    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', handleGoalSubmit);
    }

    // AI categorization on description change
    const expenseDescription = document.getElementById('expenseDescription');
    if (expenseDescription) {
        expenseDescription.addEventListener('input', handleDescriptionChange);
    }

    // Filters
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterExpenses);
    }

    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', filterExpenses);
    }

    const searchExpense = document.getElementById('searchExpense');
    if (searchExpense) {
        searchExpense.addEventListener('input', filterExpenses);
    }

    // Time range selector
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', updateDashboard);
    }
}

function loadSampleData() {
    expenses = [...sampleExpenses];
    goals = [...sampleGoals];
}

function handleNavigation(e) {
    e.preventDefault();
    const targetSection = e.target.getAttribute('href').substring(1);
    showSection(targetSection);
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
}

function handleSidebarClick(e) {
    e.preventDefault();
    const action = e.target.getAttribute('href').substring(1);
    
    switch(action) {
        case 'add-expense':
            openExpenseModal();
            break;
        case 'create-goal':
            openGoalModal();
            break;
        case 'ai-insights':
            showSection('analytics');
            break;
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update content based on section
        switch(sectionId) {
            case 'expenses':
                renderExpenses();
                break;
            case 'goals':
                renderGoals();
                break;
            case 'analytics':
                updateAnalyticsCharts();
                break;
        }
    }
}

// AI Expense Categorization
function categorizeExpenseAI(description) {
    const desc = description.toLowerCase();
    let bestMatch = 'shopping'; // default
    let maxScore = 0;
    
    for (const [category, keywords] of Object.entries(aiCategoryKeywords)) {
        let score = 0;
        keywords.forEach(keyword => {
            if (desc.includes(keyword)) {
                score += keyword.length; // Longer matches get higher scores
            }
        });
        
        if (score > maxScore) {
            maxScore = score;
            bestMatch = category;
        }
    }
    
    return bestMatch;
}

function handleDescriptionChange(e) {
    const description = e.target.value;
    if (description.length > 3) {
        const suggestedCategory = categorizeExpenseAI(description);
        const categorySelect = document.getElementById('expenseCategory');
        const aiSuggestion = document.getElementById('aiCategorySuggestion');
        
        if (categorySelect && aiSuggestion) {
            categorySelect.value = suggestedCategory;
            aiSuggestion.textContent = `AI suggests this is a ${suggestedCategory.charAt(0).toUpperCase() + suggestedCategory.slice(1)} expense.`;
        }
    }
}

// Expense Management
function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const expense = {
        id: Date.now(),
        amount: parseFloat(document.getElementById('expenseAmount').value),
        description: document.getElementById('expenseDescription').value,
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        aiCategory: categorizeExpenseAI(document.getElementById('expenseDescription').value)
    };
    
    expenses.unshift(expense);
    updateDashboard();
    closeModal('expenseModal');
    e.target.reset();
    
    // Show success message
    showNotification('Expense added successfully!', 'success');
    
    // Check budget alert
    checkBudgetAlert();
}

function renderExpenses() {
    const expensesList = document.getElementById('expensesList');
    if (!expensesList) return;
    
    const filteredExpenses = getFilteredExpenses();
    
    if (filteredExpenses.length === 0) {
        expensesList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No expenses found.</p>';
        return;
    }
    
    expensesList.innerHTML = filteredExpenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-category category-${expense.category}">
                    ${getCategoryIcon(expense.category)}
                </div>
                <div class="expense-details">
                    <h4>${expense.description}</h4>
                    <p>${formatDate(expense.date)} • ${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</p>
                </div>
            </div>
            <div class="expense-amount">-₹${expense.amount}</div>
        </div>
    `).join('');
}

function getFilteredExpenses() {
    let filtered = [...expenses];
    
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    const dateFilter = document.getElementById('dateFilter')?.value;
    const searchTerm = document.getElementById('searchExpense')?.value.toLowerCase();
    
    if (categoryFilter && categoryFilter !== 'all') {
        filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    if (dateFilter) {
        filtered = filtered.filter(expense => expense.date === dateFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(expense => 
            expense.description.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

function filterExpenses() {
    renderExpenses();
}

// Goal Management
function handleGoalSubmit(e) {
    e.preventDefault();
    
    const goal = {
        id: Date.now(),
        name: document.getElementById('goalName').value,
        targetAmount: parseFloat(document.getElementById('goalAmount').value),
        currentAmount: 0,
        deadline: document.getElementById('goalDeadline').value,
        category: document.getElementById('goalCategory').value
    };
    
    goals.push(goal);
    closeModal('goalModal');
    e.target.reset();
    
    showNotification('Goal created successfully!', 'success');
    
    if (document.getElementById('goals').classList.contains('active')) {
        renderGoals();
    }
}

function renderGoals() {
    const goalsGrid = document.getElementById('goalsGrid');
    if (!goalsGrid) return;
    
    if (goals.length === 0) {
        goalsGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No goals created yet.</p>';
        return;
    }
    
    goalsGrid.innerHTML = goals.map(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="goal-card">
                <div class="goal-header">
                    <h3>${goal.name}</h3>
                    <span class="goal-category">${goal.category}</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-text">
                        <span>₹${goal.currentAmount} / ₹${goal.targetAmount}</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                </div>
                <p style="color: #666; font-size: 0.9rem;">
                    ${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                </p>
                <button class="btn-primary" onclick="addToGoal(${goal.id})" style="margin-top: 1rem; width: 100%;">
                    Add Money
                </button>
            </div>
        `;
    }).join('');
}

function addToGoal(goalId) {
    const amount = prompt('Enter amount to add to this goal:');
    if (amount && !isNaN(amount)) {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            goal.currentAmount += parseFloat(amount);
            renderGoals();
            updateDashboard();
            showNotification('Amount added to goal!', 'success');
        }
    }
}

// Dashboard Updates
function updateDashboard() {
    updateFinancialCards();
    updateCharts();
    updateAIInsights();
}

function updateFinancialCards() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses
        .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((total, expense) => total + expense.amount, 0);
    
    const budgetRemaining = currentUser.monthlyBudget - monthlyExpenses;
    const totalSavings = goals.reduce((total, goal) => total + goal.currentAmount, 0);
    
    // Update DOM elements
    const monthlyExpensesEl = document.getElementById('monthlyExpenses');
    if (monthlyExpensesEl) {
        monthlyExpensesEl.textContent = `₹${monthlyExpenses.toLocaleString()}`;
    }
    
    const budgetRemainingEl = document.getElementById('budgetRemaining');
    if (budgetRemainingEl) {
        budgetRemainingEl.textContent = `₹${budgetRemaining.toLocaleString()} left`;
    }
    
    const currentBalanceEl = document.getElementById('currentBalance');
    if (currentBalanceEl) {
        currentBalanceEl.textContent = `₹${currentUser.balance.toLocaleString()}`;
    }
}

// Charts
function initializeCharts() {
    createSpendingChart();
    createCategoryChart();
}

function createSpendingChart() {
    const ctx = document.getElementById('spendingChart');
    if (!ctx) return;
    
    const last7Days = getLast7DaysData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.labels,
            datasets: [{
                label: 'Daily Spending',
                data: last7Days.amounts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const categoryData = getCategoryData();
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.amounts,
                backgroundColor: [
                    '#ef4444', '#3b82f6', '#8b5cf6', 
                    '#10b981', '#f59e0b', '#6b7280'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateCharts() {
    // Destroy existing charts and recreate
    Chart.helpers.each(Chart.instances, function(instance) {
        instance.destroy();
    });
    
    setTimeout(() => {
        createSpendingChart();
        createCategoryChart();
    }, 100);
}

function updateAnalyticsCharts() {
    createPredictionChart();
    createBudgetChart();
    createSavingsChart();
    createTrendsChart();
}

function createPredictionChart() {
    const ctx = document.getElementById('predictionChart');
    if (!ctx) return;
    
    const predictionData = generatePredictionData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: predictionData.labels,
            datasets: [{
                label: 'Actual Spending',
                data: predictionData.actual,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2
            }, {
                label: 'Predicted Spending',
                data: predictionData.predicted,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function createBudgetChart() {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;
    
    const budgetData = getBudgetVsActualData();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: budgetData.labels,
            datasets: [{
                label: 'Budget',
                data: budgetData.budget,
                backgroundColor: 'rgba(102, 126, 234, 0.7)',
                borderColor: '#667eea',
                borderWidth: 1
            }, {
                label: 'Actual',
                data: budgetData.actual,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#ef4444',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function createSavingsChart() {
    const ctx = document.getElementById('savingsChart');
    if (!ctx) return;
    
    const savingsData = getSavingsForecastData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: savingsData.labels,
            datasets: [{
                label: 'Projected Savings',
                data: savingsData.amounts,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function createTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    const trendsData = getCategoryTrendsData();
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: trendsData.labels,
            datasets: [{
                label: 'This Month',
                data: trendsData.thisMonth,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 2
            }, {
                label: 'Last Month',
                data: trendsData.lastMonth,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Data Generation Functions
function getLast7DaysData() {
    const labels = [];
    const amounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayExpenses = expenses
            .filter(expense => expense.date === dateStr)
            .reduce((total, expense) => total + expense.amount, 0);
        
        amounts.push(dayExpenses);
    }
    
    return { labels, amounts };
}

function getCategoryData() {
    const categories = {};
    
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    
    return {
        labels: Object.keys(categories).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
        amounts: Object.values(categories)
    };
}

function generatePredictionData() {
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5 (Predicted)'];
    const actual = [2000, 2500, 1800, 2200, null];
    const predicted = [null, null, null, null, 2400];
    
    return { labels, actual, predicted };
}

function getBudgetVsActualData() {
    const labels = ['Food', 'Transport', 'Entertainment', 'Education', 'Shopping'];
    const budget = [3000, 1000, 1500, 2000, 1500];
    const actual = [3500, 800, 2000, 1800, 1200];
    
    return { labels, budget, actual };
}

function getSavingsForecastData() {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const amounts = [1000, 2200, 3500, 5000, 6800, 8500];
    
    return { labels, amounts };
}

function getCategoryTrendsData() {
    const labels = ['Food', 'Transport', 'Entertainment', 'Education', 'Shopping', 'Utilities'];
    const thisMonth = [85, 60, 90, 70, 65, 80];
    const lastMonth = [75, 70, 80, 85, 70, 75];
    
    return { labels, thisMonth, lastMonth };
}

// AI Insights
function updateAIInsights() {
    // This would typically connect to an AI service
    // For demo purposes, we'll generate insights based on spending patterns
    generateAIInsights();
}

function generateAIInsights() {
    const insights = [];
    
    // Analyze spending patterns
    const categoryTotals = getCategoryData();
    const totalSpending = categoryTotals.amounts.reduce((sum, amount) => sum + amount, 0);
    
    // Find highest spending category
    const maxSpendingIndex = categoryTotals.amounts.indexOf(Math.max(...categoryTotals.amounts));
    const highestCategory = categoryTotals.labels[maxSpendingIndex];
    
    if (totalSpending > currentUser.monthlyBudget * 0.8) {
        insights.push({
            type: 'warning',
            title: 'Budget Alert',
            message: `You're approaching your monthly budget limit. Consider reducing ${highestCategory.toLowerCase()} expenses.`
        });
    }
    
    // Update insights in DOM (this is already handled in the HTML)
}

// Budget Alerts
function checkBudgetAlert() {
    const monthlyExpenses = expenses
        .filter(expense => {
            const expenseDate = new Date(expense.date);
            const currentDate = new Date();
            return expenseDate.getMonth() === currentDate.getMonth() && 
                   expenseDate.getFullYear() === currentDate.getFullYear();
        })
        .reduce((total, expense) => total + expense.amount, 0);
    
    const budgetUsed = (monthlyExpenses / currentUser.monthlyBudget) * 100;
    
    if (budgetUsed > 85) {
        showBudgetAlert();
    }
}

function showBudgetAlert() {
    const alert = document.getElementById('budgetAlert');
    if (alert) {
        alert.style.display = 'block';
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }
}

function closeAlert() {
    const alert = document.getElementById('budgetAlert');
    if (alert) {
        alert.style.display = 'none';
    }
}

// Modal Functions
function openExpenseModal() {
    const modal = document.getElementById('expenseModal');
    if (modal) {
        modal.style.display = 'block';
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
    }
}

function openGoalModal() {
    const modal = document.getElementById('goalModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Utility Functions
function getCategoryIcon(category) {
    const icons = {
        food: '🍽️',
        transport: '🚗',
        entertainment: '🎬',
        education: '📚',
        shopping: '🛍️',
        utilities: '💡'
    };
    return icons[category] || '💰';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        openExpenseModal();
    }
    
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        openGoalModal();
    }
});
