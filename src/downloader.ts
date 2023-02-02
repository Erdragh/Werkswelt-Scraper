import { ClientRequest } from "http";
import { get, request } from "https";

export default function download(): Promise<string> {
  return new Promise((resolve, reject) => {
    let content: string;
    const req = request(
      {
        host: "www.max-manager.de",
        path: "/daten-extern/sw-erlangen-nuernberg/xml/mensa-sued.xml",
        method: "GET",
      },
      (res) => {
        res.setEncoding("utf-8");
        res.on("data", (chunk) => (content += chunk));
        res.on("end", () => resolve(content));
        res.on("error", (err) => reject(err));
      }
    );
    req.end().on("error", (err) => reject(err));
  });
}
