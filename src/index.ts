import selectAll, { selectOne } from "css-select";
import express, { Express, Request, Response } from "express";
import { DomHandler, parseDocument, Parser } from "htmlparser2";
import domHandler from "./dom-handler";
import Downloader from "./downloader";
import download from "./downloader";

const app: Express = express();
const port = 3001;
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

const downloader: Downloader = new Downloader(
  "www.werkswelt.de",
  "/index.php?id=sued"
);

downloader
  .download("GET")
  .then((res) => {
    const parser = new Parser(domHandler());
    parser.write(res);
    parser.end();
  })
  .catch((err) => console.error(err));

new Promise((resolve) => setTimeout(resolve, 3000)).then(() => { 
  downloader
  .download("POST")
  .then((res) => {
    const parser = new Parser(domHandler());
    parser.write(res);
    parser.end();
  })
  .catch((err) => console.error(err));
});
