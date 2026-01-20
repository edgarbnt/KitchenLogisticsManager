from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload # IMPORT IMPORTANT
import models, schemas, database, ai_service
from typing import List

app = FastAPI(title="Kitchen Logistics Manager Pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
models.Base.metadata.create_all(bind=database.engine)

# --- UTILITAIRE ---
def get_or_create_ingredient(db: Session, name: str, unit: str = "unit", category: str = "Divers"):
    name_clean = name.strip()
    ing = db.query(models.Ingredient).filter(models.Ingredient.name.ilike(name_clean)).first()
    if not ing:
        ing = models.Ingredient(name=name_clean, unit=unit, category=category)
        db.add(ing)
        db.commit()
        db.refresh(ing)
    return ing

# --- INGREDIENTS ---
@app.get("/api/ingredients")
def list_ingredients(db: Session = Depends(database.get_db)):
    return db.query(models.Ingredient).all()

# --- RECIPES ---
@app.get("/api/recipes")
def list_recipes(db: Session = Depends(database.get_db)):
    # On charge les ingrédients liés pour éviter l'erreur .map() au clic
    return db.query(models.Recipe).options(
        joinedload(models.Recipe.ingredients).joinedload(models.RecipeIngredient.ingredient)
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

# --- PANTRY (INVENTAIRE) ---
@app.get("/api/pantry")
def list_pantry(db: Session = Depends(database.get_db)):
    # jointure pour avoir le nom et l'unité de l'article
    return db.query(models.PantryItem).options(joinedload(models.PantryItem.ingredient)).all()

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

@app.put("/api/recipes/{recipe_id}")
async def update_recipe(recipe_id: int, request: Request, db: Session = Depends(database.get_db)):
    data = await request.json()
    try:
        db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
        if not db_recipe:
            raise HTTPException(status_code=404, detail="Recette non trouvée")

        db_recipe.name = data.get('name')
        db_recipe.instructions = data.get('instructions', "")

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

# --- AI & SHOPPING ---
@app.get("/api/shopping-list")
def get_shopping_list(db: Session = Depends(database.get_db)):
    return db.query(models.ShoppingList).options(joinedload(models.ShoppingList.ingredient)).all()

@app.post("/api/scan-receipt")
async def scan_receipt(file: UploadFile = File(...)):
    content = await file.read()
    return ai_service.scan_receipt_with_gemini(content)