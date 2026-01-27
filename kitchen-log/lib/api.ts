// kitchen-log/lib/api.ts
import { db } from './firebase';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, where, writeBatch, getDoc, documentId
} from 'firebase/firestore';
import { Ingredient, PantryItem, Recipe, ShoppingItem, MealPlan } from '@/types';

// Convertir le snapshot Firestore en objet propre avec ID
const docData = (doc: any) => ({ id: doc.id, ...doc.data() });

export const api = {
    // --- INGRÉDIENTS (MASTER) ---
    getIngredients: async () => {
        const snap = await getDocs(collection(db, "ingredients"));
        return snap.docs.map(docData) as Ingredient[];
    },

    getMasterIngredients: async () => {
        // Alias pour la même fonction
        const snap = await getDocs(collection(db, "ingredients"));
        return snap.docs.map(docData).sort((a: any, b: any) => a.name.localeCompare(b.name));
    },

    createIngredient: async (name: string, category: string, unit: string) => {
        // Vérifier doublon par nom
        const q = query(collection(db, "ingredients"), where("name", "==", name));
        const existing = await getDocs(q);
        if (!existing.empty) return { id: existing.docs[0].id, ...existing.docs[0].data() };

        const ref = await addDoc(collection(db, "ingredients"), { name, category, unit });
        return { id: ref.id, name, category, unit };
    },

    // --- INVENTAIRE (PANTRY) ---
    getInventory: async () => {
        const snap = await getDocs(collection(db, "pantry"));
        return snap.docs.map(docData) as PantryItem[];
    },

    addToPantry: async (name: string, quantity: number, unit: string) => {
        // 1. Trouver ou créer l'ingrédient
        let ingId = "";
        let ingData = { name, unit, category: "Divers" };

        const ingQ = query(collection(db, "ingredients"), where("name", "==", name));
        const ingSnap = await getDocs(ingQ);

        if (!ingSnap.empty) {
            ingId = ingSnap.docs[0].id;
            ingData = ingSnap.docs[0].data() as any;
        } else {
            const newIng = await addDoc(collection(db, "ingredients"), ingData);
            ingId = newIng.id;
        }

        // 2. Mettre à jour le stock
        const pantryQ = query(collection(db, "pantry"), where("ingredient_id", "==", ingId));
        const pantrySnap = await getDocs(pantryQ);

        if (!pantrySnap.empty) {
            const item = pantrySnap.docs[0];
            const newQty = (item.data().quantity_available || 0) + quantity;
            await updateDoc(doc(db, "pantry", item.id), { quantity_available: newQty });
        } else {
            await addDoc(collection(db, "pantry"), {
                ingredient_id: ingId,
                quantity_available: quantity,
                ingredient: { id: ingId, ...ingData } // Dénormalisation
            });
        }
        return { status: "success" };
    },

    addBulkToPantry: async (items: any[]) => {
        // Note: Pour un vrai bulk efficace, on utiliserait un batch, 
        // mais ici on boucle pour réutiliser la logique "find or create"
        for (const item of items) {
            await api.addToPantry(item.name, parseFloat(item.quantity), item.unit);
        }
        return { status: "success" };
    },

    deletePantryItem: async (ingredient_id: string) => {
        // Attention: l'ID passé par le composant est parfois l'ID de l'ingrédient
        // Il faut trouver le document pantry correspondant
        const q = query(collection(db, "pantry"), where("ingredient_id", "==", ingredient_id));
        const snap = await getDocs(q);
        if (!snap.empty) {
            await deleteDoc(doc(db, "pantry", snap.docs[0].id));
        }
    },

    // --- RECETTES ---
    getRecipes: async () => {
        const snap = await getDocs(collection(db, "recipes"));
        return snap.docs.map(docData) as Recipe[];
    },

    createRecipe: async (data: any) => {
        // data.ingredients contient { name, quantity, unit }
        // On doit résoudre les IDs des ingrédients
        const cleanIngredients = [];
        for (const rawIng of data.ingredients) {
            // Créer l'ingrédient s'il n'existe pas (logique simplifiée)
            const ing = await api.createIngredient(rawIng.name, "Divers", rawIng.unit);
            cleanIngredients.push({
                ingredient_id: ing.id,
                name: rawIng.name,
                quantity_required: parseFloat(rawIng.quantity),
                unit: rawIng.unit,
                ingredient: ing // Stockage pour affichage
            });
        }

        const recipeDoc = {
            name: data.name,
            instructions: data.instructions,
            ingredients: cleanIngredients
        };

        await addDoc(collection(db, "recipes"), recipeDoc);
        return { status: "success" };
    },

    updateRecipe: async (id: string, data: any) => {
        const cleanIngredients = [];
        for (const rawIng of data.ingredients) {
            const ing = await api.createIngredient(rawIng.name, "Divers", rawIng.unit);
            cleanIngredients.push({
                ingredient_id: ing.id,
                name: rawIng.name,
                quantity_required: parseFloat(rawIng.quantity),
                unit: rawIng.unit,
                ingredient: ing
            });
        }

        await updateDoc(doc(db, "recipes", id), {
            name: data.name,
            instructions: data.instructions,
            ingredients: cleanIngredients
        });
    },

    addToMealPlan: async (recipeId: string) => {
        const recipeRef = await getDoc(doc(db, "recipes", recipeId));
        if (!recipeRef.exists()) throw new Error("Recette introuvable");

        await addDoc(collection(db, "meal_plans"), {
            date: new Date().toISOString(),
            slot: "ANY",
            recipe_id: recipeId,
            recipe: { id: recipeId, ...recipeRef.data() } // Dénormalisation
        });
    },

    getMealPlan: async () => {
        const snap = await getDocs(collection(db, "meal_plans"));
        return snap.docs.map(docData) as MealPlan[];
    },

    removeFromMealPlan: async (planId: string) => {
        await deleteDoc(doc(db, "meal_plans", planId));
    },

    cookRecipe: async (planId: string) => {
        const planRef = await getDoc(doc(db, "meal_plans", planId));
        if (!planRef.exists()) return;
        const plan = planRef.data() as MealPlan;

        // Décrémenter le stock
        if (plan.recipe && plan.recipe.ingredients) {
            for (const ing of plan.recipe.ingredients) {
                // Trouver l'item dans le stock
                const q = query(collection(db, "pantry"), where("ingredient_id", "==", ing.ingredient_id));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const pantryItem = snap.docs[0];
                    const currentQty = pantryItem.data().quantity_available;
                    const newQty = currentQty - ing.quantity_required;

                    if (newQty <= 0) {
                        await deleteDoc(doc(db, "pantry", pantryItem.id));
                    } else {
                        await updateDoc(doc(db, "pantry", pantryItem.id), { quantity_available: newQty });
                    }
                }
            }
        }
        await deleteDoc(doc(db, "meal_plans", planId));
    },

    // --- COURSES (LOGIQUE CLIENT-SIDE MAINTENANT) ---
    getShoppingList: async () => {
        const snap = await getDocs(collection(db, "shopping_list"));
        return snap.docs.map(docData) as ShoppingItem[];
    },

    toggleShoppingItem: async (id: string) => {
        const ref = doc(db, "shopping_list", id);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
            await updateDoc(ref, { is_checked: !snapshot.data().is_checked });
        }
    },

    clearShoppingList: async () => {
        const snap = await getDocs(collection(db, "shopping_list"));
        const batch = writeBatch(db);
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
    },

    checkoutShoppingList: async () => {
        const q = query(collection(db, "shopping_list"), where("is_checked", "==", true));
        const snap = await getDocs(q);

        const batch = writeBatch(db);

        for (const itemDoc of snap.docs) {
            const item = itemDoc.data() as ShoppingItem;
            // Ajouter au stock (logique simplifiée sans await dans boucle pour batch, mais ici on fait simple)
            // Pour faire propre avec Firestore, il faudrait lire le stock avant.
            // On va faire l'appel un par un ici car le batch mixing reads/writes est complexe sans transaction
            await api.addToPantry(item.ingredient.name, item.quantity_needed, item.ingredient.unit);
            await deleteDoc(itemDoc.ref); // Supprimer de la liste
        }
    },

    generateShoppingList: async () => {
        // 1. Vider les items automatiques
        const qList = query(collection(db, "shopping_list"), where("source", "==", "Planning"));
        const snapList = await getDocs(qList);
        const batch = writeBatch(db);
        snapList.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();

        // 2. Récupérer Plans et Pantry
        const plans = await api.getMealPlan();
        const pantry = await api.getInventory();

        // Map stock
        const pantryMap: Record<string, number> = {};
        pantry.forEach(p => { pantryMap[p.ingredient_id] = p.quantity_available; });

        // 3. Calculer les besoins
        const needed: Record<string, any> = {}; // ingredient_id -> { qty, ingredientObj }

        plans.forEach(plan => {
            plan.recipe.ingredients.forEach(ri => {
                if (!needed[ri.ingredient_id]) {
                    needed[ri.ingredient_id] = {
                        qty: 0,
                        ingredient: ri.ingredient || { name: ri.name, unit: ri.unit, id: ri.ingredient_id }
                    };
                }
                needed[ri.ingredient_id].qty += ri.quantity_required;
            });
        });

        const added = [];
        const skipped = [];

        // 4. Créer la liste
        for (const [ingId, data] of Object.entries(needed)) {
            const stock = pantryMap[ingId] || 0;
            const missing = data.qty - stock;

            const reportItem = {
                name: data.ingredient.name,
                unit: data.ingredient.unit,
                needed: data.qty,
                stock: stock,
                added_qty: missing
            };

            if (missing > 0) {
                await addDoc(collection(db, "shopping_list"), {
                    ingredient_id: ingId,
                    quantity_needed: missing,
                    is_checked: false,
                    source: "Planning",
                    ingredient: data.ingredient
                });
                added.push(reportItem);
            } else {
                skipped.push(reportItem);
            }
        }

        return { added, skipped };
    },

    // --- AI SCAN (VIA NEXT.JS API ROUTE) ---
    scanReceipt: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        // Appel à notre propre API Route Next.js (qui remplace le Python)
        const res = await fetch('/api/scan', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Erreur Scan");
        }
        return res.json();
    }
};