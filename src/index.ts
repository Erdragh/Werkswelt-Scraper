import selectAll, { selectOne } from "css-select";
import express, { Express, Request, Response } from "express";
import { DomHandler, parseDocument, Parser } from "htmlparser2";
import download from "./downloader";

const app: Express = express();
const port = 3001;
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

download("https://www.werkswelt.de/index.php?id=sued").then((res) => {
  const handler = new DomHandler((error, dom) => {
    if (error) {
      console.error(error);
    } else {
      const speiseplan = selectOne("img.infomax-food-icon", dom)?.parentNode;
      if (!speiseplan) return;
      const date = selectOne("h4", speiseplan.childNodes);
      if (!date) return;
      console.log((date as any).childNodes.find((node: any) => node.type).data);
    }
  });
  const parser = new Parser(handler);
  parser.write(res);
  parser.end();
});
