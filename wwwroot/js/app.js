import { showStatus } from './ui.js';
import { initFactories, loadFactories } from './factories.js';
import {
    initCars,
    loadCars,
    renderFactorySelect,
    filterCarsByFactory,
    handleFactoryUpdated,
    handleFactoryDeleted
} from './cars.js';

initCars();
initFactories({
    onFactoriesChanged: renderFactorySelect,
    onFactoryUpdated: handleFactoryUpdated,
    onFactoryDeleted: handleFactoryDeleted,
    onShowCars: filterCarsByFactory
});

async function init() {
    try {
        await loadFactories();
        await loadCars();
    } catch (error) {
        showStatus(`Не вдалося завантажити дані: ${error.message}`, true);
    }
}

init();