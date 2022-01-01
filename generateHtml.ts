// import klaw from "klaw";
import { marked } from "marked";
marked.use({
  renderer: {
    link(href, title, text): string {
      return `<a href="/${href}.html">${text}</a>`;
    },
  },
});
// import through2 from "through2";
import * as fs from "fs";
import glob from "fast-glob";

const files = glob
  .stream("docs/**/*.md")
  .on("data", (item) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(item);
    toMarkdown(item);
  })
  .on("end", () => console.log("done"));
fs.copyFileSync("github-markdown.css", "docs/github-markdown.css");

function toMarkdown(path: string) {
  let html = `
    <head>
    <link rel="stylesheet" href="/github-markdown.css"></link>
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
    
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0d1117;
            }
        }
    </style>
    </head>
    <body>
    <div class="markdown-body">
    ${marked.parse(fs.readFileSync(path, "utf-8"))}
    </div>
    </body>
    `;

  fs.writeFileSync(path + ".html", html);
}
