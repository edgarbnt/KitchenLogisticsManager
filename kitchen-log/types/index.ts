// kitchen-log/types/index.ts
export interface Ingredient {
    id: string; // Changé de number à string
    name: string;
    category: string;
    unit: string;
}

export interface PantryItem {
    id?: string; // ID du document Firestore
    ingredient_id: string;
    quantity_available: number;
    ingredient: Ingredient; // On stockera une copie de l'ingrédient pour simplifier (NoSQL)
}

export interface ShoppingItem {
    id: string;
    ingredient_id: string;
    quantity_needed: number;
    is_checked: boolean;
    source: string;
    ingredient: Ingredient;
}

export interface RecipeIngredient {
    ingredient_id: string;
    quantity_required: number;
    unit?: string;
    name?: string; // Copie locale pour affichage rapide
    ingredient?: Ingredient;
}

export interface Recipe {
    id: string;
    name: string;
    instructions?: string;
    ingredients: RecipeIngredient[];
}

export interface MealPlan {
    id: string;
    date: any; // Timestamp Firestore ou Date JS
    slot: string;
    recipe_id: string;
    recipe: Recipe;
}