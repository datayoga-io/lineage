import * as path from "path";
import * as fse from "fs-extra";
export default async function scaffold(argv) {
  // find templates folder
  const exampleFolder = path.join(__dirname, "..", "..", "example", "input");
  // copy to dest
  fse.copySync(exampleFolder, argv.folder);
  console.log(`Created Lineage scaffold folder in ${argv.folder}`);
}
