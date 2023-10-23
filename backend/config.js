const mysql=require("mysql");

const con=mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"12345",
    database:"buy-pakistan"
});
con.connect((err)=>{
    if(err){
        //console.log(err)
        console.log("error in connecting with database");
    }
});

module.exports= con;