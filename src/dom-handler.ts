import { selectOne } from "css-select";
import { CDATA, ChildNode } from "domhandler";
import { DomHandler } from "htmlparser2";
import parseFoodNodes from "./food-parser";

export default () => new DomHandler((error, dom) => {
  if (error) {
    console.error(error);
  } else {
    // console.log(dom);
    const speiseplan = selectOne("img.infomax-food-icon", dom)?.parentNode;
    if (!speiseplan) return;
    const date = selectOne("h4", speiseplan.childNodes);
    if (!date) return;
    console.log((date as any).childNodes.find((node: any) => node.type).data);

    const indicesOfFoodNodes: {
      type: "normal" | "special";
      index: number;
    }[] = [];
    let indexOfForm: number = -1;

    for (let i = 0; i < speiseplan.childNodes.length; i++) {
      const child = speiseplan.childNodes[i];
      if (child.type === "text") {
        if (child.data.match(/^Essen \d/g)) {
          indicesOfFoodNodes.push({
            type: "normal",
            index: i,
          });
        } else if (child.data.match(/^Aktionsessen \d/g)) {
          indicesOfFoodNodes.push({
            type: "special",
            index: i,
          });
        }
      } else if ((child as any).name === "form") {
        indexOfForm = i;
      }
    }
    console.log(indicesOfFoodNodes, indexOfForm);

    if (indicesOfFoodNodes.length < 1 || indexOfForm < 0) {
      return;
    }

    const foodNodes: {
      type: "normal" | "special";
      relevantNodes: ChildNode[];
    }[] = [];

    for (let i = 0; i < indicesOfFoodNodes.length; i++) {
      const nextIndex = indicesOfFoodNodes[i + 1]
        ? indicesOfFoodNodes[i + 1].index
        : indexOfForm;
      const cur = indicesOfFoodNodes[i];
      foodNodes.push({
        type: cur.type,
        relevantNodes: speiseplan.childNodes?.filter(
          (_, j) => j < nextIndex && j >= cur.index
        ),
      });
    }

    // foodNodes.forEach((food) => console.log(parseFoodNodes(food)));
  }
});
