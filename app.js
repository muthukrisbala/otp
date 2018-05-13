var express=require("express");
var app=express();
var bodyParser=require("body-parser");
app.use(express.static("public"));
app.set("view engine","ejs");

var options = {
  useMongoClient: true
};

app.get("/", function(req, res){

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/webmuthu";

    MongoClient.connect(url, function(err, MongoClient) {
      if (err) throw err;
        var db = MongoClient.db("webmuthu");

        db.collection("product").find({}).toArray( function(err, result){
          if (err) throw err;
            console.log("Result: "+result);
          //db.close();
          res.render("home",{result:result});
        });
      });
});

app.get("/admin", function(req, res){
        res.render("admin-dashboard");
});

app.get("/:title", function(req, res){
  //  var category=req.params.category;
    var prodtitle=req.params.title;
    prodtitle=prodtitle.replace(/-/g,' ');
    console.log(prodtitle);
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/onlinetamilportal";

    MongoClient.connect(url, function(err, MongoClient) {
      if (err) throw err;
        var db = MongoClient.db("onlinetamilportal");
        console.log(prodtitle);
        db.collection("post").findOne({"title":prodtitle}, function(err, result) {
          if (err) throw err;
            console.log("Result1: "+result);
        //  db.close();
          res.render("post",{result:result});
        });
      });
});

app.get("/:admin/listPost", function(req, res){
  //  var category=req.params.category;

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/onlinetamilportal";

    MongoClient.connect(url, function(err, MongoClient) {
      if (err) throw err;
        var db = MongoClient.db("onlinetamilportal");
        //console.log(prodtitle);
        db.collection("post").find({}).toArray( function(err, result){
          if (err) throw err;
            console.log("Result Length: "+result.length);
        //  db.close();
          res.render("listPost",{result:result});
        });
      });
});

app.get("*", function(req, res){
    res.send("404");
});

//app.listen(process.env.port,process.env.ip);

app.listen(process.env.PORT || 8003, process.env.IP || "0.0.0.0", function(){
  //var addr = app.address();
  //console.log("server listening at", addr.port);
});
