from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload, selectinload
import models, schemas, database, ai_service
from typing import List, Optional
from datetime import date
import json
import os
from pydantic import BaseModel

app = FastAPI(title="Kitchen Logistics Manager Pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
models.Base.metadata.create_all(bind=database.engine)

# --- SCHEMA LOCAL POUR LA CREATION D'INGREDIENT ---
class IngredientCreateRequest(BaseModel):
    name: str
    category: str = "Divers"
    unit: str = "unit"

# --- UTILITAIRE ---
def get_or_create_ingredient(db: Session, name: str, unit: str = "unit", category: str = "Divers"):
    name_clean = name.strip()
    # Recherche insensible à la casse
    ing = db.query(models.Ingredient).filter(models.Ingredient.name.ilike(name_clean)).first()
    if not ing:
        ing = models.Ingredient(name=name_clean, unit=unit, category=category)
        db.add(ing)
        db.commit()
        db.refresh(ing)
    return ing

# --- STARTUP EVENT (IMPORT JSON) ---
@app.on_event("startup")
def startup_load_master_ingredients():
    """
    Au démarrage, vérifie si 'ingredient_master.json' existe et
    charge son contenu dans la base de données s'il n'est pas déjà présent.
    """
    db = database.SessionLocal()
    file_path = "ingredient_master.json"
    
    if os.path.exists(file_path):
        print(f"Chargement du fichier maître : {file_path}")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            count = 0
            for item in data:
                # Utilise la fonction utilitaire qui gère déjà les doublons (get_or_create)
                name = item.get("name")
                if name:
                    get_or_create_ingredient(
                        db, 
                        name, 
                        item.get("unit", "unit"), 
                        item.get("category", "Divers")
                    )
                    count += 1
            print(f"Succès : {count} ingrédients traités depuis le fichier maître.")
        except Exception as e:
            print(f"Erreur lors de l'import des ingrédients : {e}")
        finally:
            db.close()
    else:
        print("Aucun fichier 'ingredient_master.json' trouvé. Démarrage sans import.")

# --- INGREDIENTS (MODIFIED) ---
@app.get("/api/ingredients")
def list_ingredients(db: Session = Depends(database.get_db)):
    return db.query(models.Ingredient).all()

@app.post("/api/ingredients")
def create_ingredient_endpoint(item: IngredientCreateRequest, db: Session = Depends(database.get_db)):
    # Vérifier si existe déjà
    existing = db.query(models.Ingredient).filter(models.Ingredient.name.ilike(item.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cet ingrédient existe déjà.")
    
    new_ing = models.Ingredient(name=item.name.strip(), category=item.category, unit=item.unit)
    db.add(new_ing)
    db.commit()
    db.refresh(new_ing)
    return new_ing

# --- MASTER LIST (REPLACED JSON WITH DB) ---
@app.get("/api/ingredients/master")
def get_master(db: Session = Depends(database.get_db)):
    # Retourne tous les ingrédients connus en base au lieu du fichier JSON
    return db.query(models.Ingredient).order_by(models.Ingredient.name).all()

# --- RECIPES ---
@app.get("/api/recipes")
def list_recipes(db: Session = Depends(database.get_db)):
    return db.query(models.Recipe).options(
        selectinload(models.Recipe.ingredients).joinedload(models.RecipeIngredient.ingredient)
    ).all()

@app.post("/api/recipes")
async def create_recipe(request: Request, db: Session = Depends(database.get_db)):
    data = await request.json()
    db_recipe = models.Recipe(name=data['name'], instructions=data.get('instructions', ""))
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    for ing_data in data['ingredients']:
        ing = get_or_create_ingredient(db, ing_data['name'], ing_data.get('unit', 'unit'))
        ri = models.RecipeIngredient(
            recipe_id=db_recipe.id, 
            ingredient_id=ing.id, 
            quantity_required=float(ing_data['quantity'])
        )
        db.add(ri)
    db.commit()
    return db_recipe

@app.put("/api/recipes/{recipe_id}")
async def update_recipe(recipe_id: int, request: Request, db: Session = Depends(database.get_db)):
    data = await request.json()
    try:
        db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
        if not db_recipe:
            raise HTTPException(status_code=404, detail="Recette non trouvée")

        db_recipe.name = data.get('name')
        db_recipe.instructions = data.get('instructions', "")

        # Suppression des anciens ingrédients liés
        db.query(models.RecipeIngredient).filter_by(recipe_id=recipe_id).delete()

        for ing_data in data.get('ingredients', []):
            name = ing_data.get('name', 'Inconnu')
            qty = float(ing_data.get('quantity', 0))
            unit = ing_data.get('unit', 'unit')
            
            ing = get_or_create_ingredient(db, name, unit)
            ri = models.RecipeIngredient(
                recipe_id=db_recipe.id, 
                ingredient_id=ing.id, 
                quantity_required=qty
            )
            db.add(ri)
        
        db.commit()
        db.refresh(db_recipe)
        return db_recipe
    except Exception as e:
        db.rollback()
        print(f"Erreur update: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- PANTRY (INVENTAIRE) ---
@app.get("/api/pantry")
def list_pantry(db: Session = Depends(database.get_db)):
    return db.query(models.PantryItem).options(joinedload(models.PantryItem.ingredient)).all()

@app.delete("/api/pantry/{ingredient_id}")
def delete_pantry_item(ingredient_id: int, db: Session = Depends(database.get_db)):
    db_item = db.query(models.PantryItem).filter_by(ingredient_id=ingredient_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    db.delete(db_item)
    db.commit()
    return {"status": "success"}

@app.post("/api/pantry")
async def add_pantry_item(request: Request, db: Session = Depends(database.get_db)):
    data = await request.json()
    ing = get_or_create_ingredient(db, data['name'], data.get('unit', 'unit'))
    
    db_item = db.query(models.PantryItem).filter_by(ingredient_id=ing.id).first()
    if db_item:
        db_item.quantity_available += float(data['quantity'])
    else:
        db_item = models.PantryItem(ingredient_id=ing.id, quantity_available=float(data['quantity']))
        db.add(db_item)
    db.commit()
    return {"status": "success"}

@app.post("/api/pantry/bulk")
async def add_pantry_bulk(items: List[dict], db: Session = Depends(database.get_db)):
    try:
        for item in items:
            name = item.get('name', '').strip()
            if not name: continue
            
            qty = float(item.get('quantity', 0))
            unit = item.get('unit', 'unit')
            
            ing = get_or_create_ingredient(db, name, unit)
            
            db_item = db.query(models.PantryItem).filter_by(ingredient_id=ing.id).first()
            if db_item:
                db_item.quantity_available += qty
            else:
                db_item = models.PantryItem(ingredient_id=ing.id, quantity_available=qty)
                db.add(db_item)
        
        db.commit()
        return {"status": "success", "message": f"{len(items)} articles ajoutés"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- AI & SHOPPING ---
@app.get("/api/shopping-list")
def get_shopping_list(db: Session = Depends(database.get_db)):
    return db.query(models.ShoppingList).options(joinedload(models.ShoppingList.ingredient)).all()

@app.post("/api/scan-receipt")
async def scan_receipt(file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = ai_service.scan_receipt_with_gemini(content)
        return result
    except Exception as e:
        print(f"Erreur Scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/shopping-list/{item_id}/toggle")
def toggle_shopping_item(item_id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.ShoppingList).filter_by(id=item_id).first()
    if not item: raise HTTPException(status_code=404)
    item.is_checked = not item.is_checked
    db.commit()
    return {"status": "success", "is_checked": item.is_checked}

@app.post("/api/shopping-list/checkout")
def checkout_shopping_list(db: Session = Depends(database.get_db)):
    purchased_items = db.query(models.ShoppingList).filter_by(is_checked=True).all()
    for item in purchased_items:
        pantry_item = db.query(models.PantryItem).filter_by(ingredient_id=item.ingredient_id).first()
        if pantry_item:
            pantry_item.quantity_available += item.quantity_needed
        else:
            new_pantry_item = models.PantryItem(
                ingredient_id=item.ingredient_id,
                quantity_available=item.quantity_needed
            )
            db.add(new_pantry_item)
    
    db.query(models.ShoppingList).filter_by(is_checked=True).delete()
    db.commit()
    return {"status": "success"}

@app.delete("/api/shopping-list/clear")
def clear_shopping_list(db: Session = Depends(database.get_db)):
    db.query(models.ShoppingList).delete()
    db.commit()
    return {"status": "success"}

@app.post("/api/shopping-list/generate")
def generate_shopping_list(db: Session = Depends(database.get_db)):
    # 1. Nettoyer
    db.query(models.ShoppingList).filter(models.ShoppingList.source == "Planning").delete(synchronize_session=False)
    db.commit()
    
    # 2. Récupérer TOUS les plans de repas
    plans = db.query(models.MealPlan).options(
        joinedload(models.MealPlan.recipe)
        .selectinload(models.Recipe.ingredients)
        .joinedload(models.RecipeIngredient.ingredient)
    ).all()
    
    # 3. Agréger les ingrédients nécessaires
    needed = {} # { ingredient_id: {qty: float, name: str, unit: str} }
    
    for plan in plans:
        if not plan.recipe: continue
        for ri in plan.recipe.ingredients:
            qty = ri.quantity_required or 0
            ing_id = ri.ingredient_id
            
            if ing_id not in needed:
                needed[ing_id] = {
                    "qty": 0.0,
                    "name": ri.ingredient.name if ri.ingredient else "Inconnu",
                    "unit": ri.ingredient.unit if ri.ingredient else "unit"
                }
            needed[ing_id]["qty"] += qty

    # 4. Vérifier le stock actuel (Pantry)
    pantry_items = db.query(models.PantryItem).all()
    pantry_map = {item.ingredient_id: item.quantity_available for item in pantry_items}
    
    # Listes pour le rapport de retour
    added_items = []
    skipped_items = []

    # 5. Créer les entrées de liste de courses
    for ing_id, data in needed.items():
        qty_available = pantry_map.get(ing_id, 0.0)
        qty_needed = data["qty"]
        qty_missing = qty_needed - qty_available
        
        item_info = {
            "name": data["name"],
            "unit": data["unit"],
            "needed": qty_needed,
            "stock": qty_available
        }

        if qty_missing > 0:
            new_item = models.ShoppingList(
                ingredient_id=ing_id,
                quantity_needed=qty_missing,
                is_checked=False,
                source="Planning"
            )
            db.add(new_item)
            item_info["added_qty"] = qty_missing
            added_items.append(item_info)
        else:
            skipped_items.append(item_info)
    
    db.commit()
    
    return {
        "status": "success", 
        "message": "Calcul terminé.",
        "added": added_items,
        "skipped": skipped_items
    }

# --- MEAL PLAN ---
@app.get("/api/meal-plan")
def get_meal_plan(db: Session = Depends(database.get_db)):
    return db.query(models.MealPlan).options(
        joinedload(models.MealPlan.recipe)
            .selectinload(models.Recipe.ingredients)
            .joinedload(models.RecipeIngredient.ingredient)
    ).all()

@app.post("/api/meal-plan/{recipe_id}")
def add_to_plan(recipe_id: int, db: Session = Depends(database.get_db)):
    from datetime import datetime
    internal_id = datetime.now().strftime("%Y%m%d%H%M%S%f")
    new_plan = models.MealPlan(recipe_id=recipe_id, date=date.today(), slot=internal_id)
    db.add(new_plan)
    db.commit()
    return {"status": "success"}

@app.delete("/api/meal-plan/{plan_id}")
def remove_from_plan(plan_id: int, db: Session = Depends(database.get_db)):
    db.query(models.MealPlan).filter_by(id=plan_id).delete()
    db.commit()
    return {"status": "success"}

@app.post("/api/meal-plan/{plan_id}/cook")
def cook_recipe(plan_id: int, db: Session = Depends(database.get_db)):
    plan = db.query(models.MealPlan).options(
        joinedload(models.MealPlan.recipe)
        .selectinload(models.Recipe.ingredients)
    ).filter_by(id=plan_id).first()
    
    if not plan: 
        raise HTTPException(status_code=404, detail="Plan non trouvé")
    
    for ri in plan.recipe.ingredients:
        pantry_item = db.query(models.PantryItem).filter_by(ingredient_id=ri.ingredient_id).first()
        if pantry_item:
            pantry_item.quantity_available -= ri.quantity_required
            if pantry_item.quantity_available <= 0:
                db.delete(pantry_item)
    
    db.delete(plan)
    db.commit()
    return {"status": "success"}