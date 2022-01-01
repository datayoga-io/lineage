import glob from "fast-glob";
import Handlebars from "handlebars";
import yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import renderPipeline from "./renderPipeline";
import { graphRenderOptions } from "./defaultOptions";

function loadCatalog(folder: string): any {
  const catalog = {};
  for (const filename of glob.sync(path.join(folder, "catalog", "*.yaml"))) {
    Object.assign(catalog, yaml.load(fs.readFileSync(filename), "utf8"));
  }
  return catalog;
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

  //
  // load the partials
  //
  const files = glob;
  for (const filename of glob.sync(path.join(templatesFolder, "_*.template"))) {
    Handlebars.registerPartial(
      path.basename(filename, ".template").substring(1),
      Handlebars.compile(fs.readFileSync(filename, "utf-8"))
    );
  }

  // load the templates
  const pipelineTemplate = loadTemplate(
    path.join(templatesFolder, "pipeline.template")
  );
  const datastoreTemplate = loadTemplate(
    path.join(templatesFolder, "datastore.template")
  );
  const fileTemplate = loadTemplate(
    path.join(templatesFolder, "file.template")
  );

  // merge the metadata to the pipelines
  let pipelines = Object.keys(catalog).filter((node) =>
    node.startsWith("pipeline:")
  );

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

    await renderPipeline(
      "pipeline",
      pipeline,
      metadata,
      pipelineTemplate,
      relations,
      {
        graphRenderOptions: graphRenderOptions,
      }
    );
  }
  process.stdout.write("\n");

  //
  // loop over each datastore
  //
  let datastores = Object.entries(catalog).filter(([key, node]) =>
    key.startsWith("datastore:")
  );
  for (let [datastore, metadata] of datastores) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`generating ${datastore}`);

    await renderPipeline(
      "datastore",
      datastore,
      metadata,
      pipelineTemplate,
      relations,
      {
        graphRenderOptions: graphRenderOptions,
      }
    );
  }
  process.stdout.write("\n");

  console.log("done");
}

function loadTemplate(filename: string): HandlebarsTemplateDelegate {
  const pipelineTemplateText: string = fs.readFileSync(filename, "utf-8");
  return Handlebars.compile(pipelineTemplateText, {
    noEscape: true,
    strict: false,
  });
}
