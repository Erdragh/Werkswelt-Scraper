import { selectOne } from "css-select";
import { DomHandler, ElementType } from "htmlparser2";
import { ChildNode, NodeWithChildren, ParentNode } from "domhandler";

export default new DomHandler((error, dom) => {
  if (error) {
    console.error(error);
    return;
  }

  const speiseplan: ParentNode | null = selectOne("speiseplan", dom);
  if (!speiseplan) return;
  const days = speiseplan.children.filter((c) => c.type === ElementType.Tag);

  for (let day of days) {
    handleDay(day as any);
  }
});

function handleDay(
  day: ParentNode & ChildNode & { attribs: { timestamp: string } }
) {
  const timestamp = Number.parseInt(day.attribs.timestamp);
  const date = new Date(timestamp * 1000 + 24 * 60 * 60 * 1000);

  const dishes = (day.children as NodeWithChildren[])
    .filter((dish) => {
      return dish.type !== ElementType.Text;
    })
    .map((dish) => {
      // title parsing
      const titleText: string = (
        (selectOne("title", dish) as NodeWithChildren)?.children[0] as any
      )?.data;

      // --- name of dish
      const ingredientsRegex = /\(([\d\w]+,?)+\)/g;
      let title = titleText
        .replace(ingredientsRegex, "")
        .replace("  ", " ")
        .replace(/ $/g, "");
      title = title.substring(0, 1).toUpperCase() + title.substring(1);

      // --- ingredients of dish
      let foundIngredients: string[] = [];

      const specialIngredientsTexts = titleText.matchAll(ingredientsRegex);
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

      // price parsing
      const prices = {
        student: Number.parseFloat(
          (selectOne("preis1", dish)?.children[0] as any).data.replace(",", ".")
        ),
        staff: Number.parseFloat(
          (selectOne("preis2", dish)?.children[0] as any).data.replace(",", ".")
        ),
        guest: Number.parseFloat(
          (selectOne("preis3", dish)?.children[0] as any).data.replace(",", ".")
        ),
      };

      return {
        title,
        ingredients: foundIngredients
          .map((ingr) => {
            switch (ingr) {
              case "1":
                return "color";
              case "2":
                return "caffeine";
              case "4":
                return "preservatives";
              case "5":
                return "sweeteners";
              case "7":
                return "antioxidants";
              case "8":
                return "flavour-enhancers";
              case "9":
                return "sulphurated";
              case "10":
                return "blackened";
              case "12":
                return "phosphate";
              case "13":
                return "phenylalanine";
              case "30":
                return "compound-coating";
              case "Wz":
                return "wheat";
              case "Ro":
                return "rye";
              case "Ge":
                return "barley";
              case "Hf":
                return "oats";
              case "Kr":
                return "crustaceans";
              case "Ei":
                return "egg";
              case "Fi":
                return "fish";
              case "Er":
                return "peanut";
              case "So":
                return "soybeans";
              case "Mi":
                return "milk";
              case "Man":
                return "almonds";
              case "Hs":
                return "hazelnut";
              case "Pi":
                return "pistachios";
              case "Mac":
                return "macademia-nuts";
              case "Sel":
                return "celeriac";
              case "Sen":
                return "mustard";
              case "Ses":
                return "sesame";
              case "Su":
                return "sulphur";
              case "Lu":
                return "lupines";
              case "We":
                return "mollusca";
              default:
                return undefined;
            }
          })
          .filter(
            (ingr, outerIndex, arr) =>
              !!ingr &&
              !arr.find((i, index) => i === ingr && outerIndex !== index)
          ),
        prices,
      };
    });
  console.log(date);
  dishes.forEach((d) => console.log(d));
}
