const jsonServer = require('json-server');
const multer = require('multer');

const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const middlewares = jsonServer.defaults({ 
  cors: true,
  logger: true
});
const upload = multer({ dest: 'uploads/' });

// Use default middlewares (cors, static, etc)
server.use(middlewares);

// Parse JSON body
server.use(jsonServer.bodyParser);

// Custom routes
server.get('/experts', (req, res) => {
  try {
    const db = router.db;
    const experts = db.get('experts').value();
    res.json({ experts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experts' });
  }
});

server.get('/sub_experts/', (req, res) => {
  const db = router.db;
  const expert = req.query.expert;
  const subExperts = db.get('sub_experts').value()[expert] || [];
  res.jsonp({
    sub_experts: subExperts
  });
});

server.post('/upload-pdf/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).jsonp({ error: 'No file uploaded' });
  }

  const fileHash = Date.now().toString(36);
  const db = router.db;
  
  // Store upload record
  db.get('uploads').push({
    file_hash: fileHash,
    original_name: req.file.originalname,
    path: req.file.path,
    timestamp: new Date()
  }).write();

  res.jsonp({
    message: 'PDF processed and added to the vector database.',
    file_hash: fileHash
  });
});

server.post('/ask-question', (req, res) => {
  const { question, expert, sub_expert } = req.body;

  // Simulate processing delay
  setTimeout(() => {
    res.jsonp({
      response: `Here is a response about "${question}" from ${expert}${sub_expert ? ` (${sub_expert})` : ''} expert.\n\nThis is a simulated response that demonstrates the API contract.`,
      citations: [
        {
          page_number: 1,
          document_name: "Sample_Document.pdf",
          excerpt: "This is a relevant excerpt from the document that answers the question."
        }
      ],
      image_paths: []
    });
  }, 1000); // 1 second delay to simulate processing
});

// Use default router for other routes
server.use(router);

// Start server
const port = 3001;
server.listen(port, () => {
  console.log(`Mock API Server is running on http://localhost:${port}`);
}); 