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

  return {
    name,
    beilage,
    wahlbeilage,
    prices,
    specialIngredients,
    details
  }
}
