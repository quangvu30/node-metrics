const express = require("express");
const promMid = require("express-prometheus-middleware");
const app = express();
const PORT = 3000;

app.use(
  promMid({
    metricsPath: "/metrics",
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    /**
     * Uncomenting the `authenticate` callback will make the `metricsPath` route
     * require authentication. This authentication callback can make a simple
     * basic auth test, or even query a remote server to validate access.
     * To access /metrics you could do:
     * curl -X GET user:password@localhost:9091/metrics
     */
    // authenticate: req => req.headers.authorization === 'Basic dXNlcjpwYXNzd29yZA==',
    /**
     * Uncommenting the `extraMasks` config will use the list of regexes to
     * reformat URL path names and replace the values found with a placeholder value
     */
    // extraMasks: [/..:..:..:..:..:../],
    /**
     * The prefix option will cause all metrics to have the given prefix.
     * E.g.: `app_prefix_http_requests_total`
     */
    // prefix: 'app_prefix_',
    /**
     * Can add custom labels with customLabels and transformLabels options
     */
    // customLabels: ['contentType'],
    // transformLabels(labels, req) {
    //   // eslint-disable-next-line no-param-reassign
    //   labels.contentType = req.headers['content-type'];
    // },
  })
);

// Middleware to parse JSON
app.use(express.json());

// In-memory "database" (for simplicity)
let items = [
  { id: 1, name: "Item 1", description: "This is item 1" },
  { id: 2, name: "Item 2", description: "This is item 2" },
];

// Routes
// 1. Get all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// 2. Get a single item by ID
app.get("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find((i) => i.id === id);

  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// 3. Create a new item
app.post("/api/items", (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    description: req.body.description,
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

// 4. Update an item by ID
app.put("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find((i) => i.id === id);

  if (item) {
    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    res.json(item);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// 5. Delete an item by ID
app.delete("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex((i) => i.id === id);

  if (itemIndex !== -1) {
    items.splice(itemIndex, 1);
    res.json({ message: "Item deleted successfully" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
