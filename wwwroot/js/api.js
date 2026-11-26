const API_FACTORIES = '/api/Factories';
const API_CARS = '/api/Cars';

async function extractErrorMessage(response) {
    const text = await response.text();
    if (!text) {
        return `Помилка сервера (HTTP ${response.status})`;
    }

    try {
        const json = JSON.parse(text);
        if (json.errors) {
            return Object.values(json.errors).flat().join(' ');
        }
        if (json.title) {
            return json.title;
        }
    } catch {
    }

    return text;
}

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function jsonOptions(method, body) {
    return {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}

export const factoriesApi = {
    getAll: () => request(API_FACTORIES),
    getById: id => request(`${API_FACTORIES}/${id}`),
    getCars: id => request(`${API_FACTORIES}/${id}/cars`),
    create: dto => request(API_FACTORIES, jsonOptions('POST', dto)),
    update: (id, dto) => request(`${API_FACTORIES}/${id}`, jsonOptions('PUT', dto)),
    delete: id => request(`${API_FACTORIES}/${id}`, { method: 'DELETE' })
};

export const carsApi = {
    getAll: () => request(API_CARS),
    getById: id => request(`${API_CARS}/${id}`),
    create: dto => request(API_CARS, jsonOptions('POST', dto)),
    update: (id, dto) => request(`${API_CARS}/${id}`, jsonOptions('PUT', dto)),
    delete: id => request(`${API_CARS}/${id}`, { method: 'DELETE' })
};