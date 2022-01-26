import glob from "fast-glob";
import Handlebars from "handlebars";
import yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import renderNode from "./renderNode";
import { graphRenderOptions } from "./defaultOptions";

function toPosix(inputPath: string) {
  return inputPath.split(path.sep).join(path.posix.sep);
}

function loadEntities(folder: string): any {
  const entitiesFolder = toPosix(path.join(folder, "entities", "**", "*.yaml"));
  const files = glob.sync(entitiesFolder);
  console.log(`Scanning folder ${entitiesFolder} for entities`);

  let catalog = {};
  for (let filename of files) {
    console.log(`Loading entities from ${filename}`);
    const contents = yaml.load(fs.readFileSync(filename, "utf8"));
    // convert to a dictionary indexed by 'id'
    let entities = {};
    if (Array.isArray(contents)) {
      // an array of objects
      entities = contents.reduce((result, entity) => {
        result[entity.id] = entity;
        return result;
      }, {});
      catalog = { ...catalog, ...entities };
    } else {
      // single object
      catalog[contents.id] = contents;
    }
  }
  return catalog;
}

function loadRelations(folder: string): any {
  const files = glob.sync(
    toPosix(path.join(folder, "relations", "**", "*.yaml"))
  );
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
    options.data.switch_value = value;
    return options.fn(this);
  });

  Handlebars.registerHelper("case", (value: string, options: any) => {
    if (value == options.data.switch_value) {
      return options.fn(this);
    }
  });
}
/**
 * Load a handlebars template
 * @param {string} filename - Filename containing handlebars template
 * @return {HandlebarsTemplateDelegate} Handlebars template object
 */
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

export default async function render(argv) {
  if (!fs.existsSync(argv.folder)) {
    console.log(`Source folder ${argv.folder} does not exist`);
    process.exit(1);
  }
  console.log(`Building from ${argv.folder} into ${argv.dest}`);
  // find templates folder
  const templatesFolder = toPosix(
    path.join(__dirname, "..", "..", "assets", "templates")
  );

  // load inputs
  console.log(`Loading entities`);
  const catalog = loadEntities(argv.folder);
  if (Object.keys(catalog).length == 0) {
    // can not find entities
    console.log(
      "Can not find any entities. make sure the source folder is correct and there are yaml files describing the entities"
    );
    process.exit(1);
  }
  console.log(`Found ${Object.keys(catalog).length} entities`);
  const relations = loadRelations(argv.folder);

  registerHandleBarsHelpers();

  //
  // load the partials
  //
  const files = glob;
  for (const filename of glob.sync(
    toPosix(path.join(templatesFolder, "_*.template"))
  )) {
    Handlebars.registerPartial(
      path.basename(filename, ".template").substring(1),
      Handlebars.compile(fs.readFileSync(filename, "utf-8"))
    );
  }

  // remove the docs folder
  fse.removeSync(argv.dest);

  const nodeTypes = ["datastore", "pipeline", "datastore", "file"];
  //
  // filter only the elements starting with datastore:
  //
  for (const nodeType of nodeTypes) {
    // load the template
    const template = loadTemplate(
      toPosix(path.join(templatesFolder, `${nodeType}.template`))
    );
    let entities = Object.fromEntries(
      Object.entries(catalog).filter(([key, node]) =>
        key.startsWith(nodeType + ":")
      )
    );
    console.log(`Rendering ${Object.keys(entities).length} ${nodeType}s`);
    await renderNodeType({
      folder: argv.dest,
      nodeType: nodeType,
      nodes: Object.keys(entities),
      relations: relations,
      metadata: entities,
      template: template,
      options: {
        baseUrl: argv.baseurl,
      },
    });
  }
  console.log("done");
}
