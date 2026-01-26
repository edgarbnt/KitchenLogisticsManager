from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)
    unit = Column(String)

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    instructions = Column(String)
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    quantity_required = Column(Float)
    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient")

class PantryItem(Base):
    __tablename__ = "pantry"
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), primary_key=True)
    quantity_available = Column(Float, default=0.0)
    ingredient = relationship("Ingredient")

class WeeklyStaple(Base):
    __tablename__ = "weekly_staples"
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), primary_key=True)
    default_quantity = Column(Float)
    ingredient = relationship("Ingredient")

class MealPlan(Base):
    __tablename__ = "meal_plans"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    slot = Column(String) # LUNCH, DINNER, ANY...
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    recipe = relationship("Recipe")

class ShoppingList(Base):
    __tablename__ = "shopping_list"
    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    quantity_needed = Column(Float)
    is_checked = Column(Boolean, default=False)
    source = Column(String) # RECIPE, STAPLE, MANUAL
    ingredient = relationship("Ingredient")