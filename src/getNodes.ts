import * as Algorithm from "@antv/algorithm";
function getDependantsGraph(data: any, nodeId: string) {
  const nodes = [];
  const edges = [];
  Algorithm.depthFirstSearch(data, nodeId, {
    enter: ({ current, previous }) => {
      nodes.push({ id: current });
      if (current && current != "" && previous && previous != "") {
        edges.push({
          source: previous,
          target: current,
        });
      }
    },
  });
  return {
    nodes,
    edges,
  };
}
function getDependenciesGraph(data: any, nodeId: string) {
  const reversedData = reverseGraph(data);
  const nodes = [];
  const edges = [];
  Algorithm.depthFirstSearch(reversedData, nodeId, {
    enter: ({ current, previous }) => {
      nodes.push({ id: current });
      if (current && current != "" && previous && previous != "") {
        edges.push({
          source: previous,
          target: current,
        });
      }
    },
  });
  // reverse back to original direction
  return reverseGraph({
    nodes,
    edges,
  });
}

function reverseGraph(data) {
  return {
    nodes: data.nodes,
    edges: data.edges.map((edge) => ({
      source: edge.target,
      target: edge.source,
    })),
  };
}

export { getDependantsGraph, getDependenciesGraph };
