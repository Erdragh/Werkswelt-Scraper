import { CDATA, ChildNode } from "domhandler";
export default function parseFoodNodes({type, relevantNodes}: {
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
    guests: 0
  };
  let specialIngredients: string[] = [];
  let details: string = "";
  
  name = (relevantNodes[2] as any).data;

  for (let i = 0; i < relevantNodes.length; i++) {
    const node = relevantNodes[i];
    if (node.type === "text") {
      let priceMatches: IterableIterator<RegExpMatchArray>;
      if (priceMatches = node.data.matchAll(/\d,\d\d[  ]*?€[  ]*?\([\wäöüß]{3,5}\.?\)/g)) {
        let nextMatch = priceMatches.next();
        while (!nextMatch.done) {
          let value: string = nextMatch.value[0];

          let numberMatches = value.matchAll(/\d,\d\d/g);
          let price = parseFloat((numberMatches.next().value[0] as string).replace(",", "."));
          let bracketMatches = value.matchAll(/\([\wäöüß]{3,5}\.?\)/g);
          let type = (bracketMatches.next().value[0] as string).replace("(", "").replace(")", "");

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
              console.error(`Couldn't find attribute price ${price} to a category on ${name}`);
          }

          nextMatch = priceMatches.next();
        }
      }
    }
  }

  return {
    name,
    beilage,
    wahlbeilage,
    prices,
    specialIngredients,
    details
  }
}
