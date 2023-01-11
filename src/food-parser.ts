import { CDATA, ChildNode } from "domhandler";

const ingredientMap: Map<string, string> = new Map();
ingredientMap.set("S", "pork");
ingredientMap.set("V", "veggie");
ingredientMap.set("R", "beef");
ingredientMap.set("veg", "vegan");
ingredientMap.set("G", "poultry");
//TODO: Add additional icons whenever they are used on the page,
//      as for some reason unknown even to god almighty, the images
//      in the list of dishes and the images on the legend on the
//      bottom have differen sources and different alt-texts.
//      Also: Why the fuck would you not give the icons appropriate
//      alt-texts? No matter what they are, they all have the alt-text
//      "food-icon", so anyone who relies on accessibilty features is
//      utterly fucked.

export default function parseFoodNodes({
  type,
  relevantNodes,
}: {
  type: "normal" | "special";
  relevantNodes: ChildNode[];
}) {
  let name: string = "";
  let beilage: string = "";
  let wahlbeilage: string = "";
  let prices: {
    stud: number;
    // TODO: find out what "bed" means
    bed: number;
    guests: number;
  } = {
    stud: 0,
    bed: 0,
    guests: 0,
  };
  let specialIngredients: string[] = [];
  let details: string = "";

  name = (relevantNodes[2] as any).data;

  for (let i = 0; i < relevantNodes.length; i++) {
    const node = relevantNodes[i];
    if (node.type === "text") {
      let parsedPrices = extractPrices(node.data);
      if (parsedPrices) prices = parsedPrices;
    } else if (node.type === "tag") {
      switch (node.name) {
        case "img":
          const srcMatch = node.attribs.src.match(/\/\w+?\.png/g);
          if (!srcMatch) break;
          const ingredient = ingredientMap.get(srcMatch[0].replace(".png", "").replace("/", ""));
          if (ingredient) specialIngredients.push(ingredient);
          break;
      }
    }
  }

  return {
    name,
    beilage,
    wahlbeilage,
    prices,
    specialIngredients,
    details,
  };
}

function extractPrices(data: string) {
  let prices: {
    stud: number;
    // TODO: find out what "bed" means
    bed: number;
    guests: number;
  } | null = null;

  let priceMatches: IterableIterator<RegExpMatchArray>;
  if (
    (priceMatches = data.matchAll(/\d,\d\d[  ]*?€[  ]*?\([\wäöüß]{3,5}\.?\)/g))
  ) {
    let nextMatch = priceMatches.next();
    while (!nextMatch.done) {
      if (!prices)
        prices = {
          stud: 0,
          bed: 0,
          guests: 0,
        };
      let value: string = nextMatch.value[0];

      let numberMatch = value.match(/\d,\d\d/g);
      if (!numberMatch) continue;
      let price = parseFloat(
        (numberMatch[0] as string).replace(",", ".")
      );
      let bracketMatch = value.match(/\([\wäöüß]{3,5}\.?\)/g);
      if (!bracketMatch) continue;
      let type = (bracketMatch[0] as string)
        .replace("(", "")
        .replace(")", "");

      switch (type) {
        case "Stud.":
          prices.stud = price;
          break;
        case "Bed.":
          prices.bed = price;
          break;
        case "Gäste":
          prices.guests = price;
          break;
        default:
          console.error(
            `Couldn't attribute price ${price} to a category`
          );
      }

      nextMatch = priceMatches.next();
    }
  }
  return prices;
}
