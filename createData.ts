const data = {
  nodes: [
    { id: "get-population", comboId: "spark" },
    { id: "filter-relevant", comboId: "spark" },
    { id: "filter-usa", comboId: "spark" },
    { id: "extract", comboId: "spark" },
    { id: "split" },
    { id: "train-xgboost" },
    { id: "train-baseline" },
    { id: "pick-best-model" },
    { id: "model-store" },
    { id: "predict" },
    { id: "calc-model-mse" },
    { id: "load-scores" },
  ],
  combos: [
    {
      id: "spark",
      label: "spark",
    },
  ],
  edges: [
    {
      source: "get-population",
      target: "filter-relevant",
    },
    {
      source: "filter-relevant",
      target: "filter-usa",
    },
    { source: "extract", target: "split" },
    { source: "extract", target: "train-baseline" },
    { source: "filter-usa", target: "extract" },
    { source: "split", target: "train-xgboost" },
    { source: "split", target: "pick-best-model" },
    { source: "train-xgboost", target: "pick-best-model" },
    { source: "train-baseline", target: "pick-best-model" },
    { source: "pick-best-model", target: "model-store" },
    { source: "pick-best-model", target: "load-scores" },
  ],
};
export default data;
