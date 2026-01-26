// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = `${API_BASE}/api`;

export const api = {
    // --- Ingrédients ---
    getIngredients: () => fetch(`${API_URL}/ingredients`).then(res => res.json()),

    // NOUVEAU: Création manuelle d'un ingrédient dans la base "Master"
    createIngredient: (name: string, category: string, unit: string) =>
        fetch(`${API_URL}/ingredients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, unit })
        }).then(async res => {
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Erreur lors de la création");
            }
            return res.json();
        }),

    // --- Inventaire (Pantry) ---
    getInventory: () => fetch(`${API_URL}/pantry`).then(res => res.json()),

    addToPantry: (name: string, quantity: number, unit: string) =>
        fetch(`${API_URL}/pantry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, quantity, unit })
        }).then(res => res.json()),

    addBulkToPantry: (items: any[]) =>
        fetch(`${API_URL}/pantry/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        }).then(res => {
            if (!res.ok) throw new Error("Erreur lors de l'ajout groupé");
            return res.json();
        }),

    deletePantryItem: (ingredient_id: number) =>
        fetch(`${API_URL}/pantry/${ingredient_id}`, {
            method: 'DELETE'
        }).then(res => res.json()),

    // --- Recettes ---
    getRecipes: () => fetch(`${API_URL}/recipes`).then(res => res.json()),

    createRecipe: (data: any) =>
        fetch(`${API_URL}/recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()),

    updateRecipe: (id: number, data: any) =>
        fetch(`${API_URL}/recipes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()),

    // --- Courses ---
    getShoppingList: () => fetch(`${API_URL}/shopping-list`).then(res => res.json()),

    toggleShoppingItem: (id: number) =>
        fetch(`${API_URL}/shopping-list/${id}/toggle`, { method: 'PUT' }).then(res => res.json()),

    clearShoppingList: () =>
        fetch(`${API_URL}/shopping-list/clear`, { method: 'DELETE' }).then(res => res.json()),

    checkoutShoppingList: () =>
        fetch(`${API_URL}/shopping-list/checkout`, { method: 'POST' }).then(res => res.json()),

    generateShoppingList: () => fetch(`${API_URL}/shopping-list/generate`, { method: 'POST' }).then(res => res.json()),

    // --- Meal Plan ---
    getMealPlan: () => fetch(`${API_URL}/meal-plan`).then(res => res.json()),
    addToMealPlan: (recipeId: number) => fetch(`${API_URL}/meal-plan/${recipeId}`, { method: 'POST' }).then(res => res.json()),
    removeFromMealPlan: (planId: number) => fetch(`${API_URL}/meal-plan/${planId}`, { method: 'DELETE' }).then(res => res.json()),
    cookRecipe: (planId: number) => fetch(`${API_URL}/meal-plan/${planId}/cook`, { method: 'POST' }).then(res => res.json()),

    // --- Utils ---
    scanReceipt: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/scan-receipt`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Erreur lors du scan");
        }
        return res.json();
    },

    getMasterIngredients: () => fetch(`${API_URL}/ingredients/master`).then(res => res.json()),
};