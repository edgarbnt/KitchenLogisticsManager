from sqlalchemy.orm import Session
from models import PantryItem, RecipeIngredient, WeeklyStaple, ShoppingList, MealPlan, Recipe

def update_shopping_list_logic(db: Session):
    db.query(ShoppingList).delete()
    demand = {}

    # 1. Ajouter les basiques (Staples)
    for staple in db.query(WeeklyStaple).all():
        demand[staple.ingredient_id] = demand.get(staple.ingredient_id, 0) + staple.default_quantity

    # 2. Ajouter les besoins du Meal Plan
    plans = db.query(MealPlan).all()
    for plan in plans:
        for ri in db.query(RecipeIngredient).filter_by(recipe_id=plan.recipe_id).all():
            demand[ri.ingredient_id] = demand.get(ri.ingredient_id, 0) + ri.quantity_required

    # 3. Soustraire le stock actuel
    for ing_id, qty_needed in demand.items():
        pantry = db.query(PantryItem).filter_by(ingredient_id=ing_id).first()
        stock = pantry.quantity_available if pantry else 0
        final_need = qty_needed - stock
        
        if final_need > 0:
            db.add(ShoppingList(ingredient_id=ing_id, quantity_needed=final_need, source="AUTO"))
    db.commit()

def suggest_recipes_logic(db: Session):
    recipes = db.query(Recipe).all()
    suggestions = []
    
    for recipe in recipes:
        total_ing = len(recipe.ingredients)
        if total_ing == 0: continue
        
        in_stock_count = 0
        for ri in recipe.ingredients:
            pantry = db.query(PantryItem).filter_by(ingredient_id=ri.ingredient_id).first()
            if pantry and pantry.quantity_available >= ri.quantity_required:
                in_stock_count += 1
        
        score = (in_stock_count / total_ing) * 100
        suggestions.append({"recipe_name": recipe.name, "match_percentage": score})
    
    return sorted(suggestions, key=lambda x: x['match_percentage'], reverse=True)