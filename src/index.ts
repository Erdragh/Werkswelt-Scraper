import selectAll, { selectOne } from "css-select";
import express, { Express, Request, Response } from "express";
import { DomHandler, parseDocument, Parser } from "htmlparser2";
import downloader from "./downloader";
import handler from "./handler";

const app: Express = express();
const port = 3001;
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

downloader()
  .then((content) => {
    const parser = new Parser(handler);
    parser.write(content);
    parser.end();
  })
  .catch((err) => console.error(err));
