import glob from "fast-glob";
import Handlebars from "handlebars";
import yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import renderNode from "./renderNode";
import { graphRenderOptions } from "./defaultOptions";

function loadCatalog(folder: string): any {
  const files = glob.sync(path.join(folder, "catalog", "**", "*.yaml"));
  let catalog = {};
  for (let filename of files) {
    const contents = yaml.load(fs.readFileSync(filename, "utf8"));
    catalog = { ...catalog, ...contents };
  }
  return catalog;
}

function loadPipeline(folder: string, pipeline: string): any | null {
  // load a pipeline file on demand
  const filename = path.join(folder, "pipelines", pipeline + ".yaml");
  if (fs.existsSync(filename)) {
    return yaml.load(fs.readFileSync(filename, "utf8"));
  } else return null;
}

function loadRelations(folder: string): any {
  const files = glob.sync(path.join(folder, "relations", "**", "*.yaml"));
  const relations = [];
  for (let filename of files) {
    const contents = yaml.load(fs.readFileSync(filename, "utf8"));
    relations.push(...contents);
  }
  return relations;
}

function registerHandleBarsHelpers() {
  Handlebars.registerHelper("capitalize", function (aString) {
    return aString && aString.charAt(0).toUpperCase() + aString.slice(1);
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
  fse.removeSync(argv.dest);

  await renderNodeType({
    folder: argv.dest,
    nodeType: "pipeline",
    nodes: pipelines,
    relations: relations,
    template: pipelineTemplate,
    enrichmentFunc: (pipeline) => loadPipeline(argv.folder, pipeline),
    options: {
      baseUrl: argv.baseurl,
    },
  });

  //
  // filter only the elements starting with datastore:
  //
  let datastores = Object.fromEntries(
    Object.entries(catalog).filter(([key, node]) =>
      key.startsWith("datastore:")
    )
  );
  await renderNodeType({
    folder: argv.dest,
    nodeType: "datastore",
    nodes: Object.keys(datastores),
    relations: relations,
    metadata: datastores,
    template: datastoreTemplate,
    options: {
      baseUrl: argv.baseurl,
    },
  });

  console.log("done");
}

function loadTemplate(filename: string): HandlebarsTemplateDelegate {
  const pipelineTemplateText: string = fs.readFileSync(filename, "utf-8");
  return Handlebars.compile(pipelineTemplateText, {
    noEscape: true,
    strict: false,
  });
}
async function renderNodeType({
  folder,
  nodeType,
  nodes,
  template,
  metadata,
  relations,
  enrichmentFunc,
  options = {},
}: {
  folder: string;
  nodeType: string;
  nodes: any[];
  metadata?: { [node: string]: any };
  relations: { source: string; target: string }[];
  template: HandlebarsTemplateDelegate;
  enrichmentFunc?: Function;
  options?: any;
}) {
  // loop over each node
  for (let node of nodes) {
    console.log(`generating ${node}`);
    // load pipline metadata
    let properties = {};
    if (metadata && metadata[node]) {
      properties = metadata[node];
    } else if (enrichmentFunc) {
      properties = enrichmentFunc(node);
    }
    await renderNode(folder, nodeType, node, properties, template, relations, {
      baseUrl: options["baseUrl"] || "",
      graphRenderOptions: graphRenderOptions,
    });
  }
}
