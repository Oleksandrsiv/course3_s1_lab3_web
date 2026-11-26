import { carsApi, factoriesApi } from './api.js';
import { factoriesMap } from './factories.js';
import { showStatus, renderEmptyRow, removeEmptyRow, createActionButton } from './ui.js';

const carForm = document.getElementById('carForm');
const carFormLegend = document.getElementById('carFormLegend');
const carModelNameInput = document.getElementById('carModelName');
const carFactorySelect = document.getElementById('carFactoryId');
const carSubmitBtn = document.getElementById('carSubmitBtn');
const carCancelBtn = document.getElementById('carCancelBtn');
const carsTableBody = document.getElementById('carsTableBody');
const carFilterBar = document.getElementById('carFilterBar');
const carFilterText = document.getElementById('carFilterText');
const resetCarFilterBtn = document.getElementById('resetCarFilterBtn');

let activeFactoryFilterId = null;

function formatFactoryLabel(factoryId) {
    const name = factoriesMap.get(factoryId);
    return name ? `${name} (ID: ${factoryId})` : `ID: ${factoryId}`;
}

function createCarRow(car) {
    const tr = document.createElement('tr');
    tr.dataset.id = String(car.id);
    tr.dataset.factoryId = String(car.factoryId);

    const idCell = document.createElement('td');
    idCell.textContent = String(car.id);

    const modelCell = document.createElement('td');
    modelCell.textContent = car.modelName;

    const factoryCell = document.createElement('td');
    factoryCell.className = 'car-factory-cell';
    factoryCell.textContent = formatFactoryLabel(car.factoryId);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    actionsCell.append(
        createActionButton('Редагувати', 'edit', car.id, 'btn-secondary'),
        createActionButton('Видалити', 'delete', car.id, 'btn-danger')
    );

    tr.append(idCell, modelCell, factoryCell, actionsCell);
    return tr;
}

function renderCarList(cars, emptyText) {
    carsTableBody.replaceChildren();

    if (cars.length === 0) {
        renderEmptyRow(carsTableBody, 4, emptyText);
        return;
    }

    for (const car of cars) {
        carsTableBody.appendChild(createCarRow(car));
    }
}

function resetCarForm() {
    carForm.reset();
    delete carForm.dataset.editId;
    carFormLegend.textContent = 'Додати автомобіль';
    carSubmitBtn.textContent = 'Додати';
    carCancelBtn.hidden = true;
}

async function startEditCar(id) {
    try {
        const car = await carsApi.getById(id);
        carForm.dataset.editId = String(car.id);
        carModelNameInput.value = car.modelName;
        carFactorySelect.value = String(car.factoryId);
        carFormLegend.textContent = `Редагувати автомобіль (ID: ${car.id})`;
        carSubmitBtn.textContent = 'Зберегти';
        carCancelBtn.hidden = false;
        carModelNameInput.focus();
    } catch (error) {
        showStatus(error.message, true);
    }
}

async function handleCarSubmit(event) {
    event.preventDefault();

    const modelName = carModelNameInput.value.trim();
    if (modelName.length < 2) {
        showStatus('Назва моделі має містити щонайменше 2 символи (без пробілів).', true);
        return;
    }

    const factoryId = Number(carFactorySelect.value);
    const editId = carForm.dataset.editId;

    try {
        if (editId) {
            await carsApi.update(editId, { modelName, factoryId });
            const updatedCar = await carsApi
                .getById(editId)
                .catch(() => ({ id: Number(editId), modelName, factoryId }));

            const existingRow = carsTableBody.querySelector(`tr[data-id="${editId}"]`);

            if (activeFactoryFilterId !== null && updatedCar.factoryId !== activeFactoryFilterId) {
                existingRow?.remove();
                if (carsTableBody.children.length === 0) {
                    renderEmptyRow(carsTableBody, 4, 'У цієї фабрики поки немає автомобілів.');
                }
            } else if (existingRow) {
                existingRow.replaceWith(createCarRow(updatedCar));
            }

            resetCarForm();
            showStatus(`Автомобіль оновлено: «${updatedCar.modelName}».`);
        } else {
            const createdCar = await carsApi.create({ modelName, factoryId });

            if (activeFactoryFilterId === null || createdCar.factoryId === activeFactoryFilterId) {
                removeEmptyRow(carsTableBody);
                carsTableBody.appendChild(createCarRow(createdCar));
            }

            resetCarForm();
            showStatus(`Автомобіль «${createdCar.modelName}» додано (ID: ${createdCar.id}).`);
        }
    } catch (error) {
        showStatus(error.message, true);
    }
}

async function deleteCar(id) {
    try {
        await carsApi.delete(id);

        carsTableBody.querySelector(`tr[data-id="${id}"]`)?.remove();

        if (carsTableBody.children.length === 0) {
            renderEmptyRow(carsTableBody, 4, 'Список автомобілів порожній.');
        }

        if (carForm.dataset.editId === String(id)) {
            resetCarForm();
        }

        showStatus(`Автомобіль з ID ${id} видалено.`);
    } catch (error) {
        showStatus(error.message, true);
    }
}

export function renderFactorySelect() {
    const previousValue = carFactorySelect.value;
    carFactorySelect.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Оберіть фабрику...';
    placeholder.disabled = true;
    placeholder.selected = true;
    carFactorySelect.appendChild(placeholder);

    for (const [id, name] of factoriesMap.entries()) {
        const option = document.createElement('option');
        option.value = String(id);
        option.textContent = `${name} (ID: ${id})`;
        carFactorySelect.appendChild(option);
    }

    if (previousValue && factoriesMap.has(Number(previousValue))) {
        carFactorySelect.value = previousValue;
    }
}

export function handleFactoryUpdated(factoryId, newName) {
    renderFactorySelect();

    carsTableBody.querySelectorAll(`tr[data-factory-id="${factoryId}"] .car-factory-cell`).forEach(cell => {
        cell.textContent = `${newName} (ID: ${factoryId})`;
    });

    if (activeFactoryFilterId === factoryId) {
        carFilterText.textContent = `Показано автомобілі фабрики: ${newName}`;
    }
}

export async function handleFactoryDeleted(factoryId) {
    renderFactorySelect();

    carsTableBody.querySelectorAll(`tr[data-factory-id="${factoryId}"]`).forEach(row => {
        if (carForm.dataset.editId === row.dataset.id) {
            resetCarForm();
        }
        row.remove();
    });

    if (activeFactoryFilterId === factoryId) {
        await clearCarFilter();
    } else if (carsTableBody.children.length === 0) {
        renderEmptyRow(carsTableBody, 4, 'Список автомобілів порожній.');
    }
}

export async function loadCars() {
    const cars = await carsApi.getAll();
    renderCarList(cars, 'Список автомобілів порожній.');
}

export async function filterCarsByFactory(factoryId) {
    try {
        const cars = await factoriesApi.getCars(factoryId);
        activeFactoryFilterId = factoryId;

        const factoryName = factoriesMap.get(factoryId) ?? `ID ${factoryId}`;
        carFilterText.textContent = `Показано автомобілі фабрики: ${factoryName}`;
        carFilterBar.hidden = false;

        renderCarList(cars, `У фабрики «${factoryName}» поки немає автомобілів.`);
        showStatus(`Завантажено автомобілі фабрики «${factoryName}».`);
    } catch (error) {
        showStatus(error.message, true);
    }
}

export async function clearCarFilter() {
    try {
        activeFactoryFilterId = null;
        carFilterBar.hidden = true;
        carFilterText.textContent = '';
        await loadCars();
        showStatus('Показано всі автомобілі.');
    } catch (error) {
        showStatus(error.message, true);
    }
}

export function initCars() {
    carForm.addEventListener('submit', handleCarSubmit);
    carCancelBtn.addEventListener('click', resetCarForm);
    resetCarFilterBtn.addEventListener('click', clearCarFilter);

    carsTableBody.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === 'edit') startEditCar(id);
        if (action === 'delete') deleteCar(id);
    });
}