//nouveau version using async function & await 
const connectedUser = JSON.parse(sessionStorage.getItem("connectedUser"));

const greetingName = document.getElementById("greetingName");
const availableBalance = document.getElementById("availableBalance");
const monthlyIncome = document.getElementById("monthlyIncome");
const monthlyExpenses = document.getElementById("monthlyExpenses");
const activeCards = document.getElementById("activeCards");
const listContainer = document.getElementById("recentTransactionsList");
const submitTransferBtn = document.getElementById("submitTransferBtn");
const submitRechargerBtn = document.getElementById("submitRechargerBtn");

if (!connectedUser) {
    document.location = "index.html"; 
} else {
    updateDashboardStats();
    fillTransferMenus();
    fillRechargerMenus();
    displayTransactions();
}

function updateDashboardStats() {
    greetingName.textContent = connectedUser.name;

    const total = connectedUser.wallet.cards.reduce((sum, c) => sum + Number(c.balance), 0);
    availableBalance.textContent = `${total.toLocaleString()} MAD`;

    const totalIn = connectedUser.wallet.transactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + Number(t.amount), 0);
    monthlyIncome.textContent = `${totalIn.toLocaleString()} MAD`;

    const totalOut = connectedUser.wallet.transactions
        .filter(t => t.type === "debit")
        .reduce((sum, t) => sum + Number(t.amount), 0);
    monthlyExpenses.textContent = `${totalOut.toLocaleString()} MAD`;

    if (activeCards) activeCards.textContent = connectedUser.wallet.cards.length;
}

function fillTransferMenus() {
    const cardSelect = document.getElementById("sourceCard");
    const beneSelect = document.getElementById("beneficiary");

    cardSelect.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';
    connectedUser.wallet.cards.forEach(c => {
        cardSelect.innerHTML += `<option value="${c.numcards}">${c.type} (**** ${c.numcards.slice(-4)})</option>`;
    });

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

async function transfererArgent(cardNum, beneficiary, amount) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (amount <= 0) throw "Montant invalide.";

    await new Promise(resolve => setTimeout(resolve, 1000));
    const card = connectedUser.wallet.cards.find(c => c.numcards === cardNum);
    if (!card || Number(card.balance) < amount) throw "Solde insuffisant.";

    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!beneficiary) throw "Bénéficiaire manquant.";

    await new Promise(resolve => setTimeout(resolve, 1000));
    card.balance = Number(card.balance) - amount;
    
    connectedUser.wallet.transactions.unshift({
        id: Date.now().toString(),
        type: "debit",
        amount: amount,
        date: new Date().toLocaleDateString(),
        to: beneficiary
    });

    sessionStorage.setItem("connectedUser", JSON.stringify(connectedUser));
    return "Transfert réussi !";
}

//  EVENT LISTENERS
document.getElementById("quickTransfer").addEventListener("click", () => {
    document.getElementById("transfer-section").classList.remove("hidden");
});
//r
document.getElementById("quickTopup").addEventListener("click", () => {
    document.getElementById("recharger-section").classList.remove("hidden");
});
//t
const closeTransfer_t = () => {
    document.getElementById("transferForm").reset();
    document.getElementById("transfer-section").classList.add("hidden");
};
document.getElementById("closeTransferBtn").addEventListener("click", closeTransfer_t);
document.getElementById("cancelTransferBtn").addEventListener("click", closeTransfer_t);

//r
const closeTransfer_r = () => {
    document.getElementById("rechargeForm").reset();
    document.getElementById("recharger-section").classList.add("hidden");
};
document.getElementById("closeRechargerBtn").addEventListener("click", closeTransfer_r);
document.getElementById("cancelRechargerBtn").addEventListener("click", closeTransfer_r);

//t
document.getElementById("transferForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const amt = Number(document.getElementById("amount").value);
    const card = document.getElementById("sourceCard").value;
    const bene = document.getElementById("beneficiary").value;

    submitTransferBtn.disabled = true;
    submitTransferBtn.textContent = "Chargement...";

    try {
        const message = await transfererArgent(card, bene, amt);
        alert(message);
        updateDashboardStats();
        displayTransactions();
        closeTransfer_t();
    } catch (err) {
        alert(err);
    } finally {
        submitTransferBtn.disabled = false;
        submitTransferBtn.textContent = "Transférer";
    }
});

//r
document.getElementById("rechargeForm").addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const amt = Number(document.getElementById("rechargeAmount").value);
    const card = document.getElementById("rechargeSourceCard").value;

    submitRechargerBtn.disabled = true;
    submitRechargerBtn.textContent = "Chargement...";

    try {
        const message = await rechargerArgent(card, amt);
        alert(message);
        updateDashboardStats(); 
        displayTransactions();  
        closeTransfer_r();    
    } catch (err) {
        alert(err);
    } finally {
        submitRechargerBtn.disabled = false;
        submitRechargerBtn.textContent = "Recharger";
    }
});

function fillRechargerMenus() {
    const rechargeCardSelect = document.getElementById("rechargeSourceCard");

    rechargeCardSelect.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';

    connectedUser.wallet.cards.forEach(c => {
        rechargeCardSelect.innerHTML += `
            <option value="${c.numcards}">
                ${c.type} (**** ${c.numcards.slice(-4)})
            </option>`;
    });
}
//rechargerArgent
async function rechargerArgent(cardNum, amount) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (amount <= 0) throw "Montant invalide.";
    if (!cardNum) throw "Veuillez choisir une carte.";

    const card = connectedUser.wallet.cards.find(c => c.numcards === cardNum);

    if (!card) throw "Carte introuvable.";

    card.balance = Number(card.balance) + amount;

    connectedUser.wallet.transactions.unshift({
        id: Date.now().toString(),
        type: "credit",
        amount: amount,
        date: new Date().toLocaleDateString(),
        from: "Auto-Recharge"
    });

    sessionStorage.setItem("connectedUser", JSON.stringify(connectedUser));
    return "Recharge réussie !";
}