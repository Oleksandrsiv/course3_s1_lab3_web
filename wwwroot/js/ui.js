const statusMessage = document.getElementById('statusMessage');

export function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = isError ? 'status status--error' : 'status status--success';
    statusMessage.hidden = false;
}

export function renderEmptyRow(tbody, colSpan, text) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';

    const td = document.createElement('td');
    td.colSpan = colSpan;
    td.textContent = text;

    tr.appendChild(td);
    tbody.appendChild(tr);
}

export function removeEmptyRow(tbody) {
    tbody.querySelector('tr.empty-row')?.remove();
}

export function createActionButton(text, action, id, extraClass = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.dataset.action = action;
    btn.dataset.id = String(id);
    if (extraClass) {
        btn.className = extraClass;
    }
    return btn;
}