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
      const titleText: string = (
        (selectOne("title", dish) as NodeWithChildren)?.children[0] as any
      )?.data;

      const ingredientsRegex = /\(([\d\w]+,?)+\)/g;
      let title = titleText
        .replace(ingredientsRegex, "")
        .replace("  ", " ")
        .replace(/ $/g, "");
      title = title.substring(0, 1).toUpperCase() + title.substring(1);

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

      return {
        title,
        ingredients: foundIngredients,
      };
    });
  console.log(date);
  dishes.forEach((d) => console.log(d));
}
