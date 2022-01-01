import Handlebars from "handlebars";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as graph from "@datayoga-io/node-g6";
import { getDependantsGraph, getDependenciesGraph } from "./getNodes";
const graphRenderOptions: graph.IRenderOptions = {
  nodes: {
    pipeline: {
      fill: "#acd3e4",
      stroke: "#135570",
      fontSize: 12,
      fontColor: "#333333",
    },
    datastore: {
      fill: "#ca9998",
      stroke: "#135570",
      fontSize: 12,
      fontColor: "#333333",
    },
    table: {
      fill: "#ca9998",
      stroke: "#135570",
      fontSize: 12,
      fontColor: "#333333",
    },
    file: {
      fill: "#5bbae2",
      stroke: "#135570",
      fontSize: 12,
      fontColor: "#333333",
    },
  },
};

(async () => {
  const catalog = JSON.parse(fs.readFileSync("catalog.json", "utf-8"));
  let pipelines = JSON.parse(fs.readFileSync("pipelines.json", "utf-8"));

  const templateText: string = fs.readFileSync(
    "doc_pipeline.template",
    "utf-8"
  );

  const template = Handlebars.compile(templateText, {
    noEscape: true,
    strict: false,
  });

  const partialStoreText: string = fs.readFileSync("_store.template", "utf-8");
  Handlebars.registerPartial("store", Handlebars.compile(partialStoreText));

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

  pipelines = pipelines.map((pipeline) => {
    pipeline.sources = pipeline.sources.map((source) =>
      Object.assign({ type: source.type, id: source.id }, catalog[source.id])
    );
    return pipeline;
  });

  const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

  // remove the docs folder
  fse.removeSync(path.join(".", "docs"));
  //
  // loop over each pipline
  //
  let promises = [];
  for (let pipeline of pipelines.slice(0, 1250)) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`generating ${pipeline.id}`);
    await generatePipelineDoc(pipeline, template, data);
    // promises.push(generatePipelineDoc(pipeline, template, data));
  }
  // Promise.all(promises);
  // const data = pipelines[0];
  // console.log(data);
  // console.log(template(data));
  // fs.writeFileSync(path.join(".", "docs", data.pipeline.id), template(data));
})();

function createLink(id: string) {
  let type = id.split(":")[0];
  let fullname = id.split(":")[1];
  let fullpath = fullname.split(".");
  return `${type}s/${fullpath.join("/")}/${fullpath[fullpath.length - 1]}.md`;
}

async function generatePipelineDoc(pipeline, template, data) {
  //
  // create the filename as the full path of the module (separated by '.')
  //
  let pipelinePath = pipeline.id.split(".");

  // dependants graph
  const dependantsTree = getDependantsGraph(data, "pipeline:" + pipeline.id);
  const dependantsBinaryData = await graph.render(
    dependantsTree,
    graphRenderOptions
  );
  pipeline.dependants = dependantsTree.nodes.map((node) => ({
    type: node.id.split(":")[0],
    id: node.id.split(":")[1],
    link: createLink(node.id),
  }));

  // dependencies graph
  const dependenciesTree = getDependenciesGraph(
    data,
    "pipeline:" + pipeline.id
  );
  pipeline.dependencies = dependenciesTree.nodes.map((node) => ({
    type: node.id.split(":")[0],
    id: node.id.split(":")[1],
    link: createLink(node.id),
  }));
  // write markdown file
  fse.outputFileSync(
    path.join(
      ".",
      "docs",
      "pipelines",
      ...pipelinePath,
      `${pipelinePath[pipelinePath.length - 1]}.md`
    ),
    template(pipeline)
  );

  // write images to file

  const dependenciesBinaryData = await graph.render(
    dependenciesTree,
    graphRenderOptions
  );
  fs.writeFileSync(
    path.join(".", "docs", "pipelines", ...pipelinePath, "dependencies.png"),
    dependenciesBinaryData,
    "binary"
  );
  fs.writeFileSync(
    path.join(".", "docs", "pipelines", ...pipelinePath, "dependants.png"),
    dependantsBinaryData,
    "binary"
  );
}
