from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- INGREDIENTS ---
class IngredientBase(BaseModel):
    name: str
    category: str
    unit: str

class IngredientCreate(IngredientBase): pass
class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None

class IngredientResponse(IngredientBase):
    id: int
    class Config: from_attributes = True

# --- RECIPES ---
class RecipeIngredientBase(BaseModel):
    ingredient_id: int
    quantity_required: float

class RecipeCreate(BaseModel):
    name: str
    instructions: Optional[str] = None
    ingredients: List[RecipeIngredientBase]

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    instructions: Optional[str] = None
    ingredients: Optional[List[RecipeIngredientBase]] = None

class RecipeResponse(BaseModel):
    id: int
    name: str
    instructions: Optional[str] = None
    class Config: from_attributes = True

# --- PANTRY ---
class PantryItemUpdate(BaseModel):
    quantity: float

# --- MEAL PLAN ---
class MealPlanCreate(BaseModel):
    date: date
    slot: str
    recipe_id: int

class MealPlanUpdate(BaseModel):
    date: Optional[date] = None
    slot: Optional[str] = None
    recipe_id: Optional[int] = None

# --- STAPLES ---
class StapleCreate(BaseModel):
    ingredient_id: int
    default_quantity: float

class StapleUpdate(BaseModel):
    default_quantity: float

# --- SHOPPING LIST ---
class ShoppingItemCreate(BaseModel):
    ingredient_id: int
    quantity_needed: float
    source: str = "MANUAL"

class ShoppingItemUpdate(BaseModel):
    quantity_needed: Optional[float] = None
    is_checked: Optional[bool] = None

class MarkCheckedRequest(BaseModel):
    item_ids: List[int]
    checked: bool