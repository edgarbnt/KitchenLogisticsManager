export interface Ingredient {
    id: number;
    name: string;
    category: string;
    unit: string;
}

export interface PantryItem {
    ingredient_id: number;
    quantity_available: number;
    ingredient: Ingredient;
}

export interface ShoppingItem {
    id: number;
    ingredient_id: number;
    quantity_needed: number;
    is_checked: boolean;
    source: string;
    ingredient: Ingredient;
}

export interface Recipe {
    id: number;
    name: string;
    instructions?: string;
}