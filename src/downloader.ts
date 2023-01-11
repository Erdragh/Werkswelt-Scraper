import { request } from "https";

export default function download(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let content = "";
    const req = request(url, (res) => {
      res.setEncoding("utf-8");
      res.on("data", (chunk) => {
        content += chunk;
      });
      res.on("end", () => {
        resolve(content);
      })
      res.on("error", (err) => reject(err))
    })
    req.end();
  })
}