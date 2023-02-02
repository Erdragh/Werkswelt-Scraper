import selectAll, { selectOne } from "css-select";
import express, { Express, Request, Response } from "express";
import { DomHandler, parseDocument, Parser } from "htmlparser2";

const app: Express = express();
const port = 3001;
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
