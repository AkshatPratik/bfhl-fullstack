const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;
const user_id = "full_name_24042026";
const email_id = "placeholder@example.com";
const college_roll_number = "ROLL123456";

app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({
      message: "Invalid input: data must be an array",
    });
  }

  const validEdges = [];
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenValidEdges = new Set();
  const seenDuplicateEdges = new Set();

  data.forEach((item) => {
    const trimmedItem = String(item).trim();
    const match = /^([A-Z])->([A-Z])$/.exec(trimmedItem);

    if (!match || match[1] === match[2]) {
      invalid_entries.push(trimmedItem);
      return;
    }

    if (seenValidEdges.has(trimmedItem)) {
      if (!seenDuplicateEdges.has(trimmedItem)) {
        duplicate_edges.push(trimmedItem);
        seenDuplicateEdges.add(trimmedItem);
      }

      return;
    }

    seenValidEdges.add(trimmedItem);
    validEdges.push(trimmedItem);
  });

  const adjacencyList = new Map();
  const childNodes = new Set();
  const parentNodes = [];
  const seenParents = new Set();

  validEdges.forEach((edge) => {
    const [parent, child] = edge.split("->");

    if (!adjacencyList.has(parent)) {
      adjacencyList.set(parent, []);
    }

    adjacencyList.get(parent).push(child);
    childNodes.add(child);

    if (!seenParents.has(parent)) {
      parentNodes.push(parent);
      seenParents.add(parent);
    }
  });

  const buildTree = (node) => {
    const children = adjacencyList.get(node) || [];
    const subtree = {};

    children.forEach((child) => {
      subtree[child] = buildTree(child);
    });

    return subtree;
  };

  const calculateDepth = (tree) => {
    const children = Object.keys(tree);

    if (children.length === 0) {
      return 1;
    }

    return 1 + Math.max(...children.map((child) => calculateDepth(tree[child])));
  };

  const rootNodes = parentNodes.filter((node) => !childNodes.has(node));
  const hierarchies = rootNodes.map((root) => {
    const tree = buildTree(root);

    return {
      root,
      tree,
      depth: calculateDepth(tree),
    };
  });

  let largestTreeRoot = null;
  let maxDepth = 0;

  hierarchies.forEach((hierarchy) => {
    if (hierarchy.depth > maxDepth) {
      maxDepth = hierarchy.depth;
      largestTreeRoot = hierarchy.root;
    }
  });

  const summary = {
    total_trees: hierarchies.length,
    total_cycles: 0,
    largest_tree_root: largestTreeRoot,
  };

  return res.json({
    user_id,
    email_id,
    college_roll_number,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
