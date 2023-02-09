import { selectOne } from "css-select";
import { DomHandler, ElementType } from "htmlparser2";
import { ChildNode, NodeWithChildren, ParentNode } from "domhandler";
import {
  Disclaimer,
  Ingredient,
  MainDish,
  NutritionValues,
  SideDish,
} from "./types";

const ingredientsRegex = /\(([\d\w]+,?)+\)/g;

export default new DomHandler((error, dom) => {
  if (error) {
    console.error(error);
    return;
  }

  const speiseplan: ParentNode | null = selectOne("speiseplan", dom);
  if (!speiseplan) return;
  const days = speiseplan.children.filter((c) => c.type === ElementType.Tag);

  for (let day of days) {
    const dishes = parseDay(day as any);
    dishes.forEach((d) => console.log(d));
  }
});

function parseDay(
  day: ParentNode & ChildNode & { attribs: { timestamp: string } }
): MainDish[] {
  const timestamp = Number.parseInt(day.attribs.timestamp);
  // the timestamps in xml are in seconds, the javascript date wants
  // milliseconds. The timestamps are also somewhy always one hour late.
  // What this means: the timestamp for the food of the 10th of a month
  // has a timestamp for 23:00 on the 9th of that month. So I add 1 hour
  // to the timestamp to get a perfect date at 00:00:00.
  const date = new Date(timestamp * 1000 + 1 * 60 * 60 * 1000);

  const dishes: MainDish[] = (day.children as NodeWithChildren[])
    .filter((dish) => {
      return dish.type !== ElementType.Text;
    })
    .map((dish) => {
      // title parsing
      const titleText: string = (
        (selectOne("title", dish) as NodeWithChildren)?.children[0] as any
      )?.data;

      // --- name of dish
      let title = cleanupTitle(titleText);
      title = title.substring(0, 1).toUpperCase() + title.substring(1);

      // --- ingredients of dish
      const foundIngredients: string[] = extractIngredients(titleText);

      // price parsing
      const prices = {
        student: getNumberFromElement("preis1", dish),
        staff: getNumberFromElement("preis2", dish),
        guest: getNumberFromElement("preis3", dish),
      };

      // optional side dishes
      const sideDishText: string = (
        (selectOne("beilagen", dish) as NodeWithChildren)?.children[0] as any
      )?.data;
      let sideDishes: SideDish[] = [];
      if (sideDishText) {
        sideDishes = sideDishText
          .replace("Wahlbeilagen: ", "")
          .split(", ")
          .map((sd) => {
            return {
              title: sd.replace(/\r\n */g, ""),
              ingredients: [],
            };
          })
          .filter((sd) => {
            return !!sd.title && sd.title !== " ";
          });
        if (sideDishes) {
          sideDishes = sideDishes.map((sd) => {
            sd.ingredients = beautifyIngredients(
              extractIngredients(sideDishText)
            );
            sd.title = cleanupTitle(sd.title)
            return sd;
          });
        }
      }

      // nutrition values
      const nutrition: NutritionValues = {
        kilojoules: getNumberFromElement("kj", dish),
        kilocalories: getNumberFromElement("kcal", dish),
        fat: getNumberFromElement("fett", dish),
        saturated_fatty_acids: getNumberFromElement("gesfett", dish),
        carbohydrates: getNumberFromElement("kh", dish),
        sugar: getNumberFromElement("zucker", dish),
        fiber: getNumberFromElement("ballaststoffe", dish),
        protein: getNumberFromElement("eiweiss", dish),
        salt: getNumberFromElement("salz", dish),
      };

      // disclaimers
      const imageContainer: string = (
        selectOne("piktogramme", dish)?.children[0] as any
      ).data;
      const matches = imageContainer.matchAll(/infomax-food-icon \w{1,3}/g);
      let match = matches.next();
      let disclaimers: string[] = [];
      while (!match.done) {
        disclaimers.push(match.value[0].replace("infomax-food-icon ", ""));
        match = matches.next();
      }

      const mainDish: MainDish = {
        title,
        date,
        ingredients: beautifyIngredients(foundIngredients),
        disclaimers: beautifyDisclaimers(disclaimers),
        // disclaimers,
        nutrition,
        prices,
        sideDishes,
      };
      return mainDish;
    });
  return dishes;
}

function extractIngredients(text: string): string[] {
  // --- ingredients of dish
  let foundIngredients: string[] = [];

  const specialIngredientsTexts = text.matchAll(ingredientsRegex);
  let ingredientsMatch;
  do {
    ingredientsMatch = specialIngredientsTexts.next();
    if (!ingredientsMatch.value) continue;
    const ingredients = (ingredientsMatch.value[0] as string).matchAll(
      /[\d\w]+/g
    );
    let ingredient;
    do {
      ingredient = ingredients.next();
      if (!ingredient.value) continue;
      foundIngredients.push(ingredient.value[0]);
    } while (!ingredient.done);
  } while (!ingredientsMatch.done);

  return foundIngredients;
}

function beautifyIngredients(ingredients: string[]): Ingredient[] {
  const {
    COLOR,
    CAFFEINE,
    PRESERVATIVES,
    SWEETENERS,
    ANTIOXIDANTS,
    FLAVOUR_ENHANCERS,
    SULPHURATED,
    BLACKENED,
    PHOSPHATE,
    PHENYLALANINE,
    COMPOUND_COATING,
    WHEAT,
    RYE,
    BARLEY,
    OATS,
    CRUSTACEANS,
    EGG,
    FISH,
    PEANUT,
    SOYBEANS,
    MILK,
    ALMONDS,
    HAZELNUT,
    PISTACHIOS,
    MACADEMIA_NUTS,
    CELERIAC,
    MUSTARD,
    SESAME,
    SULPHUR,
    LUPINES,
    MOLLUSCA,
  } = Ingredient;
  const i: Ingredient[] = ingredients
    .map((ingr) => {
      switch (ingr) {
        case "1":
          return COLOR;
        case "2":
          return CAFFEINE;
        case "4":
          return PRESERVATIVES;
        case "5":
          return SWEETENERS;
        case "7":
          return ANTIOXIDANTS;
        case "8":
          return FLAVOUR_ENHANCERS;
        case "9":
          return SULPHURATED;
        case "10":
          return BLACKENED;
        case "12":
          return PHOSPHATE;
        case "13":
          return PHENYLALANINE;
        case "30":
          return COMPOUND_COATING;
        case "Wz":
          return WHEAT;
        case "Ro":
          return RYE;
        case "Ge":
          return BARLEY;
        case "Hf":
          return OATS;
        case "Kr":
          return CRUSTACEANS;
        case "Ei":
          return EGG;
        case "Fi":
          return FISH;
        case "Er":
          return PEANUT;
        case "So":
          return SOYBEANS;
        case "Mi":
          return MILK;
        case "Man":
          return ALMONDS;
        case "Hs":
          return HAZELNUT;
        case "Pi":
          return PISTACHIOS;
        case "Mac":
          return MACADEMIA_NUTS;
        case "Sel":
          return CELERIAC;
        case "Sen":
          return MUSTARD;
        case "Ses":
          return SESAME;
        case "Su":
          return SULPHUR;
        case "Lu":
          return LUPINES;
        case "We":
          return MOLLUSCA;
        default:
          return undefined;
      }
    })
    .filter(
      (ingr, outerIndex, arr) =>
        !!ingr && !arr.find((i, index) => i === ingr && outerIndex !== index)
    ) as any;
  return i;
}

function beautifyDisclaimers(disclaimers: string[]): Disclaimer[] {
  const {
    VEGAN,
    CO2_FOOTPRINT,
    PORK,
    VEGETARIAN,
    POULTRY,
    SUSTAINABLE_FISH,
    FISH,
    GLUTEN_FREE,
    BEEF,
    MENSA_VITAL,
    VENISON,
    LAMB,
  } = Disclaimer;
  return disclaimers
    .map((d) => {
      switch (d) {
        case "veg":
          return VEGAN;
        case "CO2":
          return CO2_FOOTPRINT;
        case "S":
          return PORK;
        case "V":
          return VEGETARIAN;
        case "G":
          return POULTRY;
        case "MSC":
          return SUSTAINABLE_FISH;
        case "F":
          return FISH;
        case "Gf":
          return GLUTEN_FREE;
        case "R":
          return BEEF;
        case "MV":
          return MENSA_VITAL;
        case "W":
          return VENISON;
        case "L":
          return LAMB;
        default:
          return undefined;
      }
    })
    .filter((d, i, arr) => {
      return !!d && !arr.find((a, j) => d === a && i !== j);
    }) as any;
}

function getNumberFromElement(
  elementName: string,
  dish: NodeWithChildren
): number {
  return Number.parseFloat(
    (selectOne(elementName, dish)?.children[0] as any).data.replace(",", ".")
  );
}

function cleanupTitle(title: string): string {
  return title
    .replace(ingredientsRegex, "")
    .replace(/ +/g, " ")
    .replace(/ $/g, "")
    .replace(/^ /g, "")
    .replace(/^mit /g, "");
}
