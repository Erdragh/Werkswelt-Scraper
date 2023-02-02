import { createServer, request, RequestOptions, Server } from "https";
import fetch, { RequestInit } from "node-fetch";

export default class Downloader {
  private sessionId: string | null = null;
  private formData: FormData = new FormData();

  private asdf: Server = createServer();

  private firstContent: any = null;

  constructor(private host: string, private path: string) {
    this.formData.append("mybutton", "vorwärts");
  }

  public download(method: string): Promise<string> {
    console.log(this.sessionId);
    return new Promise((resolve, reject) => {
      let content = "";
      const req = request(
        {
          host: this.host,
          path: this.path,
          method: method,
        },
        (res) => {
          res.setEncoding("utf-8");
          res.on("data", (chunk) => {
            content += chunk;
          });
          res.on("end", () => {
            resolve(content);
            this.firstContent = content;
            console.log(this.firstContent === content);
            const cookies = res.headers["set-cookie"];
            if (!cookies) return;
            this.sessionId = cookies[0].substring(0, cookies[0].indexOf(";"));
          });
          res.on("error", (err) => reject(err));
        }
      );
      if (this.sessionId) {
        req.setHeader("Cookie", this.sessionId);
        req.setHeader("Host", "www.werkswelt.de");
        req.setHeader("Origin", "https://www.werkswelt.de");
        req.setHeader("Referer", "https://www.werkswelt.de/?id=sued");
        req.setHeader("Content-Type", "application/x-www-form-urlencoded");
        req.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0");
      }
      (method === "POST" ? req.end(JSON.stringify(this.formData)) : req.end()).on("error", (err) => reject(err));
    });
  }
}
