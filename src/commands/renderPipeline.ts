import * as path from "path";
import * as fs from "fs";
import * as graph from "@datayoga-io/node-g6";
import { getDependantsGraph, getDependenciesGraph } from "../getNodes";
import { graphRenderOptions } from "./defaultOptions";
import * as fse from "fs-extra";
import { IRenderOptions } from "@datayoga-io/node-g6";

/** 
* Render a pipeline graph to markdown
* @param {string} pipeline - Pipline object to render
* @param {
    source: string;
    target: string;
  }[] relations - Array of edges of lineage to other objects
* @param {
    graphRenderOptions: IRenderOptions;
} options - Rendering options
*/
export default async function renderNode(
  type: string,
  id: string,
  metadata: any,
  template: HandlebarsTemplateDelegate,
  relations: {
    source: string;
    target: string;
  }[],
  options: {
    graphRenderOptions: IRenderOptions;
  }
) {
  // generate set of unique node ids
  let allNodes = new Set();
  relations.forEach((rel) => {
    allNodes.add(rel.source);
    allNodes.add(rel.target);
  });
  const data = {
    nodes: [...allNodes].map((node) => ({ id: node })),
    edges: relations,
  };

  //
  // create the filename as the full path of the module (separated by '.')
  //
  let pipelinePath = id.split(".");

  //
  // dependants graph
  //
  const dependantsTree = getDependantsGraph(data, id);

  const dependantsBinaryData = await graph.render(
    dependantsTree,
    options.graphRenderOptions
  );
  const dependants = dependantsTree.nodes
    .filter((node) => node.id != id)
    .map((node) => ({
      type: node.id.split(":")[0],
      id: node.id.split(":")[1],
      link: createLink(node.id),
    }));

  //
  // dependencies graph
  //
  const dependenciesTree = getDependenciesGraph(data, id);
  const dependenciesBinaryData = await graph.render(
    dependenciesTree,
    graphRenderOptions
  );
  const dependencies = dependenciesTree.nodes
    .filter((node) => node.id != id)
    .map((node) => ({
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
    template(
      Object.assign(
        {
          id,
          dependants,
          dependencies,
        },
        metadata
      )
    )
  );

  // write images to file
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

function createLink(id: string) {
  let type = id.split(":")[0];
  let fullname = id.split(":")[1];
  let fullpath = fullname.split(".");
  return `${type}s/${fullpath.join("/")}/${fullpath[fullpath.length - 1]}.md`;
}
