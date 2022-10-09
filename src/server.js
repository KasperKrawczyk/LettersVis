// @ts-check
import express from 'express'
import path from 'path';
const __dirname = path.resolve();


const app = express();
const port = 8080;
app.use(express.static(__dirname + '/src'));
app.use(express.static(__dirname + '/files'));
app.use(express.static(__dirname + '/css'));

app.get("/", async (req, res) => {
    // res.setHeader("Content-Type", "text/html");
    res.status(200);
    res.sendFile('index.html', { root: __dirname })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});