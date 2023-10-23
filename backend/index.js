const express = require("express");
const con = require("./config")
const cors = require("cors");
const upload= require("./upload")
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('uploads'));


app.get("/", (req, res) => {
    con.query("select * from products", (error, result) => {
        if (error) {
            res.send("error in connection")
        }
        else {
            //console.log(result);
            res.send(result)
        }
    })
});


app.post("/", upload.single("image"), (req, res) => {
    const data = req.body;
    const uploadedFile = req.file; // Get the uploaded file information

    // Check if there's an uploaded file and handle it (e.g., save to a directory or database).
    if (uploadedFile) {
        // Handle the file, e.g., save it to a directory or database.
        data.img = uploadedFile.filename; // Update the data with the file name
    }

    con.query("INSERT INTO products SET ?", data, (error, result, fields) => {
        if (error) {
            res.status(500).json({ error: "Error inserting data" });
        } else {
            res.json(result);
        }
    });
});

app.put("/:id", upload.single("image"), (req, res) => {
    const data = [req.body.productname, req.body.category, req.file.filename, req.params.id];
    const uploadedFile = req.file; // Get the uploaded file information

    // Check if there's an uploaded file and handle it (e.g., update the image in the database).

    con.query("UPDATE products SET productname = ?, category = ?, img = ? WHERE Id = ?", data, (error, result, fields) => {
        if (error) {
            res.status(500).json({ error: "Error updating data" });
        } else {
            res.json(result);
        }
    });
});


app.delete("/:id", (req, res) => {
    con.query("DELETE FROM products WHERE Id= ?" , req.params.id,(error,result)=>{
        if(error) error;
        res.send(result);
    })
});



app.listen(port);
