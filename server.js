const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;
const PASSWORD = "123";

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: uploadDir });

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

const defaultImages = [
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1000&q=80"
];

function currentImage(i) {
  const files = fs.readdirSync(uploadDir).filter(f => f.startsWith(`pic${i}.`));
  return files.length ? `/uploads/${files[0]}` : defaultImages[i - 1];
}

app.get("/", (req, res) => {
  const cards = [
    ["Desktop Computer", 1],
    ["Laptop", 2],
    ["LED Monitor", 3],
    ["Computer Accessories", 4]
  ].map(([name, i]) => `
    <div class="card">
      <img src="${currentImage(i)}" alt="${name}">
      <h2>${name}</h2>
    </div>
  `).join("");

  res.send(`<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Irfan Computers</title>
<style>
body{margin:0;font-family:Arial;background:#f4f4f4;color:#111}
header{background:#111;color:white;text-align:center;padding:28px 12px}
main{max-width:1000px;margin:auto;padding:22px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.card{background:white;border-radius:15px;padding:14px;box-shadow:0 3px 15px #0002}.card img{width:100%;height:260px;object-fit:cover;border-radius:10px}
h2{text-align:center}@media(max-width:650px){.grid{grid-template-columns:1fr}}
</style></head><body>
<header><h1>IRFAN COMPUTERS</h1><p>R/o Duderhama, Ganderbal</p></header>
<main><h2>Our Products</h2><div class="grid">${cards}</div></main>
</body></html>`);
});

app.get("/admin", (req, res) => {
  res.send(`<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Irfan Computers Admin</title>
<style>body{font-family:Arial;max-width:600px;margin:auto;padding:25px}input,button{width:100%;padding:12px;margin:8px 0;box-sizing:border-box}button{background:#111;color:#fff;border:0;border-radius:7px}.box{border:1px solid #ddd;padding:15px;margin:15px 0;border-radius:10px}</style></head>
<body><h1>Irfan Computers Admin</h1>
<p>Password: 123</p>
<div class="box">
<form action="/admin/upload" method="post" enctype="multipart/form-data">
<input type="password" name="password" placeholder="Admin password" required>
<select name="pic" style="width:100%;padding:12px"><option value="1">Desktop Computer</option><option value="2">Laptop</option><option value="3">LED Monitor</option><option value="4">Computer Accessories</option></select>
<input type="file" name="image" accept="image/*" required>
<button type="submit">Upload / Change Picture</button>
</form></div>
<p><a href="/">Open Public Website</a></p></body></html>`);
});

app.post("/admin/upload", upload.single("image"), (req, res) => {
  if (req.body.password !== PASSWORD) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(401).send("Wrong password. <a href='/admin'>Go back</a>");
  }

  const n = Number(req.body.pic);
  if (!req.file || ![1,2,3,4].includes(n)) {
    return res.status(400).send("Invalid upload. <a href='/admin'>Go back</a>");
  }

  const old = fs.readdirSync(uploadDir).filter(f => f.startsWith(`pic${n}.`));
  old.forEach(f => fs.unlinkSync(path.join(uploadDir, f)));

  const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
  const newName = `pic${n}${ext}`;
  fs.renameSync(req.file.path, path.join(uploadDir, newName));

  res.send("Picture changed successfully! <a href='/'>Open website</a>");
});

app.listen(PORT, () => console.log(`Irfan Computers running on port ${PORT}`));
