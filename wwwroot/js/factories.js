import { factoriesApi } from './api.js';
import { showStatus, renderEmptyRow, removeEmptyRow, createActionButton } from './ui.js';

const factoryForm = document.getElementById('factoryForm');
const factoryFormLegend = document.getElementById('factoryFormLegend');
const factoryNameInput = document.getElementById('factoryName');
const factorySubmitBtn = document.getElementById('factorySubmitBtn');
const factoryCancelBtn = document.getElementById('factoryCancelBtn');
const factoriesTableBody = document.getElementById('factoriesTableBody');

export const factoriesMap = new Map();

let callbacks = {
    onFactoriesChanged: () => {},
    onFactoryUpdated: () => {},
    onFactoryDeleted: async () => {},
    onShowCars: () => {}
};

function createFactoryRow(factory) {
    const tr = document.createElement('tr');
    tr.dataset.id = String(factory.id);

    const idCell = document.createElement('td');
    idCell.textContent = String(factory.id);

    const nameCell = document.createElement('td');
    nameCell.textContent = factory.name;

    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    actionsCell.append(
        createActionButton('Авто', 'cars', factory.id, 'btn-secondary'),
        createActionButton('Редагувати', 'edit', factory.id, 'btn-secondary'),
        createActionButton('Видалити', 'delete', factory.id, 'btn-danger')
    );

    tr.append(idCell, nameCell, actionsCell);
    return tr;
}

function resetFactoryForm() {
    factoryForm.reset();
    delete factoryForm.dataset.editId;
    factoryFormLegend.textContent = 'Додати фабрику';
    factorySubmitBtn.textContent = 'Додати';
    factoryCancelBtn.hidden = true;
}

async function startEditFactory(id) {
    try {
        const factory = await factoriesApi.getById(id);
        factoryForm.dataset.editId = String(factory.id);
        factoryNameInput.value = factory.name;
        factoryFormLegend.textContent = `Редагувати фабрику (ID: ${factory.id})`;
        factorySubmitBtn.textContent = 'Зберегти';
        factoryCancelBtn.hidden = false;
        factoryNameInput.focus();
    } catch (error) {
        showStatus(error.message, true);
    }
}

async function handleFactorySubmit(event) {
    event.preventDefault();

    const name = factoryNameInput.value.trim();
    if (name.length < 2) {
        showStatus('Назва фабрики має містити щонайменше 2 символи (без пробілів).', true);
        return;
    }

    const editId = factoryForm.dataset.editId;

    try {
        if (editId) {
            await factoriesApi.update(editId, { name });
            const updatedFactory = await factoriesApi
                .getById(editId)
                .catch(() => ({ id: Number(editId), name }));

            factoriesMap.set(updatedFactory.id, updatedFactory.name);
            factoriesTableBody
                .querySelector(`tr[data-id="${editId}"]`)
                ?.replaceWith(createFactoryRow(updatedFactory));

            callbacks.onFactoryUpdated(updatedFactory.id, updatedFactory.name);
            resetFactoryForm();
            showStatus(`Фабрику «${updatedFactory.name}» оновлено.`);
        } else {
            const createdFactory = await factoriesApi.create({ name });
            factoriesMap.set(createdFactory.id, createdFactory.name);

            removeEmptyRow(factoriesTableBody);
            factoriesTableBody.appendChild(createFactoryRow(createdFactory));

            callbacks.onFactoriesChanged();
            resetFactoryForm();
            showStatus(`Фабрику «${createdFactory.name}» додано (ID: ${createdFactory.id}).`);
        }
    } catch (error) {
        showStatus(error.message, true);
    }
}

async function deleteFactory(id) {
    try {
        await factoriesApi.delete(id);

        const deletedName = factoriesMap.get(id) ?? `ID ${id}`;
        factoriesMap.delete(id);
        factoriesTableBody.querySelector(`tr[data-id="${id}"]`)?.remove();

        if (factoriesTableBody.children.length === 0) {
            renderEmptyRow(factoriesTableBody, 3, 'Список фабрик порожній.');
        }

        if (factoryForm.dataset.editId === String(id)) {
            resetFactoryForm();
        }

        await callbacks.onFactoryDeleted(id);
        showStatus(`Фабрику «${deletedName}» видалено.`);
    } catch (error) {
        showStatus(error.message, true);
    }
}

export async function loadFactories() {
    const factories = await factoriesApi.getAll();
    factoriesMap.clear();
    factoriesTableBody.replaceChildren();

    if (factories.length === 0) {
        renderEmptyRow(factoriesTableBody, 3, 'Список фабрик порожній.');
    } else {
        for (const factory of factories) {
            factoriesMap.set(factory.id, factory.name);
            factoriesTableBody.appendChild(createFactoryRow(factory));
        }
    }

    callbacks.onFactoriesChanged();
}

export function initFactories(handlers) {
    callbacks = { ...callbacks, ...handlers };

    factoryForm.addEventListener('submit', handleFactorySubmit);
    factoryCancelBtn.addEventListener('click', resetFactoryForm);

    factoriesTableBody.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === 'cars') callbacks.onShowCars(id);
        if (action === 'edit') startEditFactory(id);
        if (action === 'delete') deleteFactory(id);
    });
}