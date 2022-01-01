import Handlebars from "handlebars";
import yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import renderPipeline from "./renderPipeline";
import { graphRenderOptions } from "./defaultOptions";

function loadCatalog(folder: string): any {
  // JSON.parse(fs.readFileSync("./input/catalog.json", "utf-8"));
  const catalogDir = "./input/catalog";
  const file = "sample.yaml";
  return yaml.load(fs.readFileSync(catalogDir + path.sep + file, "utf8"));
}

function loadPipeline(pipeline: string): any {
  const catalogDir = "./input/pipelines";
  const file = "sample.yaml";
  return yaml.load(fs.readFileSync(catalogDir + path.sep + file, "utf8"));
}

function loadRelations(folder: string): any {
  const catalogDir = "./input/relations";
  const file = "sample.yaml";
  return yaml.load(fs.readFileSync(catalogDir + path.sep + file, "utf8"));
}

function registerHandleBarsHelpers() {
  Handlebars.registerHelper("capitalize", function (aString) {
    return aString.charAt(0).toUpperCase() + aString.slice(1);
  });
  Handlebars.registerHelper("switch", (value: string, options: any) => {
    (this as any).switch_value = value;
    return options.fn(this);
  });

  Handlebars.registerHelper("case", (value: string, options: any) => {
    if (value == (this as any).switch_value) {
      return options.fn(this);
    }
  });
}

export default async function render(argv) {
  // find templates folder
  const templatesFolder = path.join(
    __dirname,
    "..",
    "..",
    "assets",
    "templates"
  );

  // load inputs
  const catalog = loadCatalog(argv.folder);
  const relations = loadRelations(argv.folder);

  registerHandleBarsHelpers();

  // load the templates
  const pipelineTemplateText: string = fs.readFileSync(
    path.join(templatesFolder, "pipeline.template"),
    "utf-8"
  );

  // load the partials
  const partialDataStoreText: string = fs.readFileSync(
    path.join(templatesFolder, "_datastore.template"),
    "utf-8"
  );
  Handlebars.registerPartial("store", Handlebars.compile(partialDataStoreText));

  const pipelineTemplate = Handlebars.compile(pipelineTemplateText, {
    noEscape: true,
    strict: false,
  });

  // merge the metadata to the pipelines
  let pipelines = Object.keys(catalog).filter((node) =>
    node.startsWith("pipeline:")
  );

  // console.log(entities);
  //   const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

  // remove the docs folder
  fse.removeSync(path.join(".", "docs"));
  //
  // loop over each pipline
  //
  for (let pipeline of pipelines) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`generating ${pipeline}`);
    // load pipline metadata
    const metadata = loadPipeline(pipeline);

    await renderPipeline(pipeline, metadata, pipelineTemplate, relations, {
      graphRenderOptions: graphRenderOptions,
    });
  }
  process.stdout.write("\n");
  console.log("done");
}
