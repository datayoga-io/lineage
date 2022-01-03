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
  folder: string,
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
  let [nodeType, nodeId] = id.split(":");
  const nodePath = nodeId.split(".");

  // set output folder
  const outputFolder = path.join(folder, nodeType + "s", ...nodePath);

  //
  // dependants graph
  //
  const dependantsTree = getDependantsGraph(data, id);

  if (dependantsTree.edges.length > 0) {
    const dependantsBinaryData = await graph.render(
      dependantsTree,
      options.graphRenderOptions
    );

    // write image to file
    fse.outputFileSync(
      path.join(outputFolder, "dependants.png"),
      dependantsBinaryData,
      "binary"
    );
  }
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
  if (dependenciesTree.edges.length > 0) {
    const dependenciesBinaryData = await graph.render(
      dependenciesTree,
      graphRenderOptions
    );
    // write image to file
    fse.outputFileSync(
      path.join(outputFolder, "dependencies.png"),
      dependenciesBinaryData,
      "binary"
    );
  }

  const dependencies = dependenciesTree.nodes
    .filter((node) => node.id != id)
    .map((node) => ({
      type: node.id.split(":")[0],
      id: node.id.split(":")[1],
      link: createLink(node.id),
    }));

  // write markdown file

  fse.outputFileSync(
    path.join(outputFolder, `${nodePath[nodePath.length - 1]}.md`),
    template(
      Object.assign(
        {
          id: nodeId,
          type: nodeType,
          dependants,
          dependencies,
        },
        metadata
      )
    )
  );
}

function createLink(id: string) {
  let type = id.split(":")[0];
  let fullname = id.split(":")[1];
  let fullpath = fullname.split(".");
  return `${type}s/${fullpath.join("/")}/${fullpath[fullpath.length - 1]}.md`;
}
