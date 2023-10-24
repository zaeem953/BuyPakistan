const express = require("express");
const con = require("./config")
const cors = require("cors");
const upload= require("./upload")
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000;
const jwtKey = "buy-pakistan";

app.use(express.json());
app.use(cors());
app.use(express.static('uploads'));


// app.post('/register', (req, res) => {
//     const userData = req.body;
  
   
//     con.query('INSERT INTO users (username,email, password) VALUES (?,?,?)', [userData.username,userData.email, userData.password], (err, result) => {
//       if (err) {
//         console.error('Error registering user: ' + err);
//         res.status(500).json({ result: 'Something went wrong' });
//       } else {
//         const userId = result.insertId;
//         const user = { id: userId, email: userData.email };
  
        
//         const token = jwt.sign({ user }, jwtKey, { expiresIn: '24h' });
//         res.json({ user, auth: token });
//       }
//     });
//   });
  
function shouldRegisterAsAdmin(userData) {
   
  
    const userEmail = userData.email;
    
   
    if (userEmail.endsWith('@admin.com')) {
      return true; 
    } else {
      return false; 
    }
  }
  
  app.post('/register', (req, res) => {
    const userData = req.body;
  
    
    const isAdmin = shouldRegisterAsAdmin(userData);
  
    const sqlQuery = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  
    con.query(sqlQuery, [userData.username, userData.email, userData.password, isAdmin ? 'admin' : 'user'], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ error: 'Registration failed' }); 
      }
  
      const userId = result.insertId;
      const user = { id: userId, email: userData.email, role: isAdmin ? 'admin' : 'user' };
  
      const token = jwt.sign({ user }, jwtKey, { expiresIn: '24h' });
      res.json({ user, auth: token });
    });
  });
  

  // User Login
  app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
   
    con.query('SELECT id, email FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
      if (err) {
        console.error('Error logging in: ' + err);
        res.status(500).json({ result: 'Something went wrong' });
      } else if (results.length === 1) {
        const user = results[0];
  
        
        const token = jwt.sign({ user }, jwtKey, { expiresIn: '2h' });
        res.json({ user, auth: token });
      } else {
        res.status(404).json({ result: 'Not Found' });
      }
    });
  });


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
    const uploadedFile = req.file; 

    
    if (uploadedFile) {
       
        data.img = uploadedFile.filename; 
    }

    con.query("INSERT INTO products SET ?", data, (error, result, fields) => {
        if (error) {
            res.status(500).json({ error: "Error inserting data" });
        } else {
            res.json(result);
        }
    });
});

app.put("/update/:id", upload.single("img"), (req, res) => {
    const data = [req.body.productname, req.body.category, req.file.filename, req.params.id];
    const uploadedFile = req.file; 

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

app.get("/product/:id", (req, res) => {
    const productId = req.params.id;

    con.query("SELECT * FROM products WHERE Id = ?", [productId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ error: "An error occurred while fetching the product." });
        } else {
            if (results.length > 0) {
                res.send(results[0]);
            } else {
                res.status(404).send({ message: "No product found with the specified ID" });
            }
        }
    });
});


function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (token) {
      token = token.split(" ")[1];
      
      jwt.verify(token, jwtKey, (err, decoded) => {
        if (err) {
          res.status(401).send({ result: "Please provide a valid token" });
        } else {
          // Check the user's role from the decoded token
          const userRole = decoded.user.role;
          if (userRole === 'admin') {
            // User is an admin, allow access
            next();
          } else {
            res.status(403).send({ result: "Access denied. Insufficient privileges." });
          }
        }
      });
    } else {
      res.status(403).send({ result: "Send header" });
    }
  }
  



app.listen(port);
