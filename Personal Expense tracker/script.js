const form = document.getElementById('transaction-form');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const clearBtn = document.getElementById('clear-btn');
const filterType = document.getElementById('filter-type');
const searchInput = document.getElementById('search');
const tableBody = document.getElementById('transaction-table-body');
const noTransactions = document.getElementById('no-transactions');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const currentBalanceEl = document.getElementById('current-balance');
const alertBox = document.getElementById('alert-box');
const alertMessage = document.getElementById('alert-message');
const alertClose = document.getElementById('alert-close');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let alertTimeout;

function showAlert(message, type = 'success') {
    alertMessage.textContent = message;
    alertBox.className = `fixed top-5 right-5 z-50 max-w-sm w-full border rounded-xl shadow-lg p-4 flex items-center justify-between transition-all duration-300 ${
        type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-900 border-gray-800 text-white'
    }`;
    alertBox.classList.remove('hidden');
    
    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 4000);
}

alertClose.addEventListener('click', () => {
    alertBox.classList.add('hidden');
    clearTimeout(alertTimeout);
});

function init() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    render();
}

function formatCurrency(amount) {
    return 'LKR ' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function addTransaction(e) {
    e.preventDefault();
    const type = typeInput.value;
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description || isNaN(amount) || amount <= 0 || !date) {
        showAlert('Please complete all required fields with a valid amount greater than zero.', 'error');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        type,
        description,
        amount,
        category,
        date
    };

    transactions.push(newTransaction);
    saveAndRender();
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    showAlert('Transaction added successfully!');
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndRender();
    showAlert('Transaction deleted successfully!');
}

function clearForm() {
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
}

function saveAndRender() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    render();
}

function render() {
    tableBody.innerHTML = '';

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
        if (t.type === 'Income') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
        }
    });

    const currentBalance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    currentBalanceEl.textContent = formatCurrency(currentBalance);

    const filterVal = filterType.value;
    const searchVal = searchInput.value.toLowerCase().trim();

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filterVal === 'All' || t.type === filterVal;
        const matchesSearch = t.description.toLowerCase().includes(searchVal) || t.category.toLowerCase().includes(searchVal);
        return matchesType && matchesSearch;
    });

    if (filteredTransactions.length === 0) {
        noTransactions.style.display = 'block';
    } else {
        noTransactions.style.display = 'none';
        filteredTransactions.forEach(t => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-100 hover:bg-gray-50 text-sm';
            
            const isIncome = t.type === 'Income';
            const badgeClass = isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const amountPrefix = isIncome ? '+ ' : '- ';

            tr.innerHTML = `
                <td class="py-3 px-4">${t.date}</td>
                <td class="py-3 px-4 font-medium text-gray-900">${t.description}</td>
                <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}">${t.type}</span></td>
                <td class="py-3 px-4 text-gray-600">${t.category}</td>
                <td class="py-3 px-4 font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}">${amountPrefix}${formatCurrency(t.amount)}</td>
                <td class="py-3 px-4">
                    <button onclick="deleteTransaction(${t.id})" class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded text-xs font-medium transition">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

form.addEventListener('submit', addTransaction);
clearBtn.addEventListener('click', clearForm);
filterType.addEventListener('change', render);
searchInput.addEventListener('input', render);

init();