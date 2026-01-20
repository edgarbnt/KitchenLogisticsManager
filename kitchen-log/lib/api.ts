// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/api";

export const api = {
    // --- Ingrédients ---
    getIngredients: () => fetch(`${API_BASE}/ingredients`).then(res => res.json()),

    // --- Inventaire (Pantry) ---
    getInventory: () => fetch(`${API_BASE}/pantry`).then(res => res.json()),

    // --- Recettes ---
    getRecipes: () => fetch(`${API_BASE}/recipes`).then(res => res.json()),

    addToPantry: (name: string, quantity: number, unit: string) =>
        fetch(`${API_BASE}/pantry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, quantity, unit })
        }).then(res => res.json()),

    // --- Courses ---
    getShoppingList: () => fetch(`${API_BASE}/shopping-list`).then(res => res.json()),

    createRecipe: (data: any) =>
        fetch(`${API_BASE}/recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()),

    updateRecipe: (id: number, data: any) =>
        fetch(`${API_BASE}/recipes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()),

    // --- AI Scan ---
    scanReceipt: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/scan-receipt`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error("Erreur serveur lors du scan");
        return res.json();
    }
};