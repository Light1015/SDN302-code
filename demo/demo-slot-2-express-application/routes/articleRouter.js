// Import Express
const express = require('express');

// Tạo router cho phép bạn định tuyến các yêu cầu đến các xử lý cụ thể dựa trên URL và phương thức HTTP (GET, POST, v.v.)
const articleRouter = express.Router();

// Fake DB (lưu tạm trong bộ nhớ)
let articles = [
    { id: 1, title: "First Article", text: "Hello Express!" },
    { id: 2, title: "Second Article", text: "Learning Express CRUD" }
];

// Biến lưu id hiện tại (auto increment)
let currentId = articles.length;

// ==========================
// Middleware auto-assign id
// ==========================
function assignId(req, res, next) {
    if (req.method === "POST") {
        currentId++;
        req.body.id = currentId;
    }
    next();
}

// Middleware parse 
// Middleware express.json() được sử dụng ở đây để tự động phân tích cú pháp
// các nội dung yêu cầu JSON thành các đối tượng JavaScript
articleRouter.use(express.json());
// Middleware này được sử dụng để phân tích cú pháp các yêu cầu được mã hóa bằng URL. 
// Tham số mở rộng: true cho phép mã hóa các đối tượng và mảng trong URL. 
// Điều này hữu ích khi bạn cần xử lý dữ liệu từ các biểu mẫu HTML.
articleRouter.use(express.urlencoded({ extended: true }));

// ==========================
// GET /articles
// Lấy toàn bộ danh sách articles
// ==========================
articleRouter.get('/', (req, res) => {
    res.status(200).json(articles); // Trả về mảng articles dưới dạng JSON
});

// ==========================
// GET /articles/:id
// Lấy một article theo id (lấy từ params URL)
// ==========================
articleRouter.get('/:id', (req, res) => {
    // req.params.id là string -> dùng == để so sánh với number
    const article = articles.find(a => a.id == req.params.id);

    // Nếu không tìm thấy, trả về 404
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
});

// ==========================
// POST /articles
// Tạo mới một article
// ==========================
articleRouter.post('/', assignId, (req, res) => {
    const newArticle = req.body;
    articles.push(newArticle);
    res.status(201).json(newArticle);
});

// PUT update article
articleRouter.put('/:id', (req, res) => {
    const index = articles.findIndex(a => a.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: "Article not found" });

    articles[index] = { ...articles[index], ...req.body };
    res.json({ message: "Updated successfully", data: articles[index] });
});

// DELETE article
articleRouter.delete('/:id', (req, res) => {
    const index = articles.findIndex(a => a.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: "Article not found" });

    const deleted = articles.splice(index, 1);
    res.json({ message: "Deleted successfully", deleted });
});

module.exports = articleRouter;
