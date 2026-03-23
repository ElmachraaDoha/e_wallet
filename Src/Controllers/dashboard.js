// 1. DATA INITIALIZATION
const connectedUser = JSON.parse(sessionStorage.getItem("connectedUser"));

// DOM Elements
const greetingName = document.getElementById("greetingName");
const availableBalance = document.getElementById("availableBalance");
const monthlyIncome = document.getElementById("monthlyIncome");
const monthlyExpenses = document.getElementById("monthlyExpenses");
const activeCards = document.getElementById("activeCards");
const listContainer = document.getElementById("recentTransactionsList");

// SECURITY CHECK
if (!connectedUser) {
    document.location = "index.html"; 
} else {
    // START DASHBOARD
    updateDashboardStats();
    fillTransferMenus();
    displayTransactions();
}

// 2. CALCULATIONS & STATS
function updateDashboardStats() {
    greetingName.textContent = connectedUser.name;

    // Calculate Balance
    const total = connectedUser.wallet.cards.reduce((sum, c) => sum + Number(c.balance), 0);
    availableBalance.textContent = `${total.toLocaleString()} MAD`;

    // Calculate Income (Credits)
    const totalIn = connectedUser.wallet.transactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + Number(t.amount), 0);
    monthlyIncome.textContent = `${totalIn.toLocaleString()} MAD`;

    // Calculate Expenses (Debits)
    const totalOut = connectedUser.wallet.transactions
        .filter(t => t.type === "debit")
        .reduce((sum, t) => sum + Number(t.amount), 0);
    monthlyExpenses.textContent = `${totalOut.toLocaleString()} MAD`;

    if (activeCards) activeCards.textContent = connectedUser.wallet.cards.length;
}

// 3. UI HELPERS (Dropdowns & History)
function fillTransferMenus() {
    const cardSelect = document.getElementById("sourceCard");
    const beneSelect = document.getElementById("beneficiary");

    // Fill Cards
    cardSelect.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';
    connectedUser.wallet.cards.forEach(c => {
        cardSelect.innerHTML += `<option value="${c.numcards}">${c.type} (**** ${c.numcards.slice(-4)})</option>`;
    });

    // Fill Beneficiaries
    beneSelect.innerHTML = `
        <option value="" disabled selected>Choisir un bénéficiaire</option>
        <option value="Fatima Zahra">Fatima Zahra</option>
        <option value="Ahmed Amine">Ahmed Amine</option>
    `;
}

function displayTransactions() {
    listContainer.innerHTML = ""; 
    connectedUser.wallet.transactions.forEach(t => {
        const isCredit = t.type === "credit";
        listContainer.innerHTML += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${isCredit ? 'green' : 'red'}">
                        <i class="fas ${isCredit ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <span class="transaction-name">${isCredit ? "De: " + t.from : "À: " + t.to}</span>
                        <span class="transaction-date">${t.date}</span>
                    </div>
                </div>
                <div class="transaction-amount ${isCredit ? 'green' : 'red'}">
                    ${isCredit ? '+' : '-'}${t.amount} MAD
                </div>
            </div>`;
    });
}

// 4. ASYNCHRONOUS TRANSFER LOGIC
/*
function transfererArgent(cardNum, beneficiary, amount, onSuccess, onError) {
    // Step 1: Check Amount
    setTimeout(() => {
        if (amount <= 0) return onError("Montant invalide.");

        // Step 2: Check Solde
        setTimeout(() => {
            const card = connectedUser.wallet.cards.find(c => c.numcards === cardNum);
            if (!card || Number(card.balance) < amount) return onError("Solde insuffisant.");

            // Step 3: Check Beneficiary
            setTimeout(() => {
                if (!beneficiary) return onError("Bénéficiaire manquant.");

                // Step 4: Finalize
                setTimeout(() => {
                    card.balance = Number(card.balance) - amount;
                    connectedUser.wallet.transactions.unshift({
                        id: Date.now().toString(),
                        type: "debit",
                        amount: amount,
                        date: new Date().toLocaleDateString(),
                        to: beneficiary
                    });

                    sessionStorage.setItem("connectedUser", JSON.stringify(connectedUser));
                    onSuccess();
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}
*/
// 4. ASYNCHRONOUS TRANSFER LOGIC (promises-newVersion)
function transfererArgent(cardNum, beneficiary, amount) {
    return new Promise((resolve, reject) => {
        // Step 1: Check Amount
        setTimeout(() => {
            if (amount <= 0) return reject("Montant invalide.");

            // Step 2: Check Solde
            setTimeout(() => {
                const card = connectedUser.wallet.cards.find(c => c.numcards === cardNum);
                if (!card || Number(card.balance) < amount) return reject("Solde insuffisant.");

                // Step 3: Check Beneficiary
                setTimeout(() => {
                    if (!beneficiary) return reject("Bénéficiaire manquant.");

                    // Step 4: Finalize
                    setTimeout(() => {
                        card.balance = Number(card.balance) - amount;
                        connectedUser.wallet.transactions.unshift({
                            id: Date.now().toString(),
                            type: "debit",
                            amount: amount,
                            date: new Date().toLocaleDateString(),
                            to: beneficiary
                        });

                        sessionStorage.setItem("connectedUser", JSON.stringify(connectedUser));
                        resolve("Transfert réussi !"); // Success!
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    });
}

// 5. EVENT LISTENERS 
document.getElementById("quickTransfer").addEventListener("click", () => {
    document.getElementById("transfer-section").classList.remove("hidden");
});

// Close / Annuler Logic
const closeTransfer = () => {
    document.getElementById("transferForm").reset();
    document.getElementById("transfer-section").classList.add("hidden");
};

document.getElementById("closeTransferBtn").addEventListener("click", closeTransfer);
document.getElementById("cancelTransferBtn").addEventListener("click", closeTransfer);

// Form Submit(callbacks-oldVersion)
document.getElementById("transferForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("submitTransferBtn");
    const amt = Number(document.getElementById("amount").value);
    const card = document.getElementById("sourceCard").value;
    const bene = document.getElementById("beneficiary").value;

    btn.disabled = true;
    btn.textContent = "Chargement...";

    transfererArgent(card, bene, amt, 
        () => {
            alert("Transfert réussi !");
            location.reload(); 
        }, 
        (err) => {
            alert(err);
            btn.disabled = false;
            btn.textContent = "Transférer";
        }
    );
});
// Form Submit(promises-newVersion)
document.getElementById("transferForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("submitTransferBtn");
    const amt = Number(document.getElementById("amount").value);
    const card = document.getElementById("sourceCard").value;
    const bene = document.getElementById("beneficiary").value;

    btn.disabled = true;
    btn.textContent = "Chargement...";

    // Use the Promise
    transfererArgent(card, bene, amt)
        .then((message) => {
            alert(message);
            location.reload(); 
        })
        .catch((err) => {
            alert(err);
            btn.disabled = false;
            btn.textContent = "Transférer";
        });
});