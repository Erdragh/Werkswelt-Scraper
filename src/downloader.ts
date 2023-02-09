import { readFile } from "fs";
import { request } from "https";

export default function download({file, url}: {file?: string, url?: string}): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file) {
      readFile(file, {
        encoding: "utf-8"
      } ,(err, data) => {
        if (err) reject(err)
        else resolve(data);
      })
      return;
    } else if (url) {
      let content: string;
      const req = request(
      // {
      //   host: "www.max-manager.de",
      //   path: "/daten-extern/sw-erlangen-nuernberg/xml/mensa-sued.xml",
      //   method: "GET",
      // },
      url,
      (res) => {
        res.setEncoding("utf-8");
        res.on("data", (chunk) => (content += chunk));
        res.on("end", () => resolve(content));
        res.on("error", (err) => reject(err));
      }
      );
      req.end().on("error", (err) => reject(err));
    } else {
      reject("Neither a file, nor a url was specified");
    }
  });
}
