import selectAll, { selectOne } from "css-select";
import express, { Express, Request, Response } from "express";
import { DomHandler, parseDocument, Parser } from "htmlparser2";
import domHandler from "./dom-handler";
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
  const parser = new Parser(domHandler);
  parser.write(res);
  parser.end();
});
