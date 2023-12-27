const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const { Post }  = require('./models'); 
const { uploadFile, deleteFile, getImageSignedUrl } = require('./s3.js');

const app = express();
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/api/posts", async (req, res) => {
  console.log("GET request");
  
  try {
    const posts = await Post.findAll({order: [['createdAt', 'DESC']]});
    for (let post of posts) {
      post.dataValues.imageURL = await getImageSignedUrl(post.fileName);
    }
    res.status(201).send(posts);
  } catch (error) {
    res.status(500).send({ message: "Error getting post" });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  console.log("POST request");

  const fileBuffer = req.file.buffer;
  const caption = req.body.caption;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName);
  const fileName = `${uuid()}${ext}`;

  await uploadFile(fileBuffer, fileName, req.file.mimetype);
  
  try {
    const post = await Post.create({ fileName, caption });
    post.dataValues.imageURL = await getImageSignedUrl(fileName);
    return res.status(201).send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error uploading post" });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  console.log("DELETE request");

  try{
    const id = +req.params.id;
    const post = await Post.findOne({
      where: { id: id }, 
    });

    await deleteFile(post.fileName);
    await Post.destroy({ where: { id: id } });
    res.status(200).send("");
  } catch (error) {
    res.status(500).send({ message: "Error deleting post" });
  }
});

app.listen(8080, () => console.log("listening on port 8080"));