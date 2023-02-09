export type Dish = {
  title: string;
  ingredients: Ingredient[];
}

export type NutritionValues = {
  kilojoules: number;
  kilocalories: number;
  fat: number;
  saturated_fatty_acids: number;
  carbohydrates: number;
  sugar: number;
  fiber: number;
  protein: number;
  salt: number;
}

export type MainDish = {
  date: Date;
  disclaimers: Disclaimer[];
  nutrition: NutritionValues;
  prices: {
    student: number;
    staff: number;
    guest: number;
  },
  sideDishes: SideDish[]
} & Dish;

export type SideDish = Dish;

export enum Ingredient {
  COLOR = "color",
  CAFFEINE = "caffeine",
  PRESERVATIVES = "preservatives",
  SWEETENERS = "sweeteners",
  ANTIOXIDANTS = "antioxidants",
  FLAVOUR_ENHANCERS = "flavour-enhancers",
  SULPHURATED = "sulphurated",
  BLACKENED = "blackened",
  PHOSPHATE = "phosphate",
  PHENYLALANINE = "phenylalanine",
  COMPOUND_COATING = "compound-coating",
  WHEAT = "wheat",
  RYE = "rye",
  BARLEY = "barley",
  OATS = "oats",
  CRUSTACEANS = "crustaceans",
  EGG = "egg",
  FISH = "fish",
  PEANUT = "peanut",
  SOYBEANS = "soybeans",
  MILK = "milk",
  ALMONDS = "almonds",
  HAZELNUT = "hazelnut",
  PISTACHIOS = "pistachios",
  MACADEMIA_NUTS = "macademia-nuts",
  CELERIAC = "celeriac",
  MUSTARD = "mustard",
  SESAME = "sesame",
  SULPHUR = "sulphur",
  LUPINES = "lupines",
  MOLLUSCA = "mollusca"
}

export enum Disclaimer {
  VEGAN = "vegan",
  CO2_FOOTPRINT = "co2-footprint",
  PORK = "pork",
  VEGETARIAN = "vegetarian",
  POULTRY = "poultry",
  SUSTAINABLE_FISH = "sustainable-fish",
  FISH = "fish",
  GLUTEN_FREE = "gluten-free",
  BEEF = "beef",
  MENSA_VITAL = "mensa-vital",
  VENISON = "venison",
  LAMB = "lamb"
}