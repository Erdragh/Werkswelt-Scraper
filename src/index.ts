import selectAll, { selectOne } from "css-select";
import express, { Express, Request, Response } from "express";
import { DomHandler, parseDocument, Parser } from "htmlparser2";
import CliParser from "./cli-parser";
import downloader from "./downloader";
import handler from "./handler";

// const app: Express = express();
// const port = 3001;
// app.get("/", (req: Request, res: Response) => {
//   res.send("Express + TypeScript Server");
// });

// app.listen(port, () => {
//   console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
// });

const cliParser = new CliParser("scraper", [{
  optional: true,
  identifier: "url",
  type: "string"
}], [{
  optional: true,
  identifier: "file",
  type: "string",
  description: "If you want to parse a file instead of a web url, use this option."
}]);
const results = cliParser.parse(process.argv.slice(2));

downloader({file: results?.file, url: results?.url})
  .then((content) => {
    const parser = new Parser(handler);
    parser.write(content);
    parser.end();
  })
  .catch((err) => console.error(err));
