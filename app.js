var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var compression = require('compression')
app.set('view cache', true);
app.use(compression());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
app.set("view engine","ejs");
var sm = require('sitemap');

var redis = require('redis');
var client = redis.createClient();
client.on('error', function(err){
  console.log('Something went wrong ', err)
});



var options = {
  useMongoClient: true
};


app.get("/robots.txt", function(req, res) {


res.type('text/plain');
    res.send("User-agent: *\nDisallow: /newpost\nsitemap: http://www.onlinetamilportal.com/sitemap.xml");

});

app.get("/sitemap.xml", function(req, res) {

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
      //  res.render("home",{result:result});

      var sitemap = sm.createSitemap ({
        hostname: 'http://www.onlinetamilportal.com',
        cacheTime: 600000
      });
      for(var i=0;i<result.length;i++){
        if(result[i].title !== null ){
        var postUrl=result[i].title.replace(/ /g,"-");
        postUrl=postUrl.toLowerCase()
        sitemap.add({url: '/'+postUrl+'/', changefreq: 'monthly', priority: 0.7});
      }else{
        console.log("sitemap: Undefined");
      }
      }
      sitemap.toXML( function (err, xml) {
          if (err) {
            return res.status(500).end();
          }
          res.header('Content-Type', 'application/xml');
          res.send( xml );
      });

      });

    });

});


app.get("/admin", function(req, res){
        res.render("admin-dashboard");
});

app.get("/favicon.ico", function(req, res){
res.end("TST");
});
app.get("/robots.txt", function(req, res){
res.end("robots.txt");
});

app.get("/newpost", function(req, res){
res.render("newpost");
});

app.get("/createpost", function(req, res){
  //  var category=req.params.category;
  console.log("TTIITTLLEE: "+req.query.title);
  /*var title=req.query.title;
  var description=req.query.description;
  var keywords=req.query.keywords;
  var img=req.query.img;
  var content=req.query.content;
  var posttype=req.query.posttype;
  var publishedby=req.query.publishedby;
  var publishedon=req.query.publishedon;
  var category=req.query.category;
    var prodtitle=req.params.title;
    prodtitle=prodtitle.replace(/-/g,' ');
    console.log(prodtitle);*/

    var postobject={};
    postobject.title=req.query.title;
    postobject.description=req.query.description;
    postobject.keywords=req.query.keywords;
    postobject.img=req.query.img;
    postobject.content=req.query.content;
    postobject.posttype=req.query.posttype;
    postobject.publishedby=req.query.publishedby;
    postobject.publishedon=req.query.publishedon;
    postobject.category=req.query.category;
    console.log("Object: "+postobject);

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/onlinetamilportal";

    MongoClient.connect(url, function(err, MongoClient) {
      if (err) throw err;
        var db = MongoClient.db("onlinetamilportal");


        db.collection("post").insert(postobject,function(err, result) {
          if (err) throw err;
            //console.log("Result1: "+result);
        //  db.close();
        res.render("postsuccess");
        });
      });
      //res.render("postsuccess");
});
app.get("/:title", function(req, res){
  //  var category=req.params.category;
  console.log("REQ: "+req.url)
    var prodtitle=req.params.title;
    prodtitle=prodtitle.replace(/-/g,' ');
    console.log(prodtitle);


    client.get("otp_"+prodtitle, function(error, result) {
      if (error) throw error;
      if(result){
        var resultobj={};
        resultobj=JSON.parse(result);
        //console.log("Redis-Result: "+resultobj);
        //console.log("redis-title:"+resultobj.title);
        res.render("post",{result:resultobj});
      }else{
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/onlinetamilportal";

        MongoClient.connect(url, function(err, MongoClient) {
          if (err) throw err;
            var db = MongoClient.db("onlinetamilportal");
            console.log(prodtitle);
            var regex = new RegExp(["^", prodtitle, "$"].join(""), "i");

            db.collection("post").findOne({"title":regex}, function(err, result) {
              if (err) throw err;
                console.log("Result1: "+result);
            //  db.close();
            console.log('GET result ->', result)
              client.set("otp_"+prodtitle, JSON.stringify(result), redis.print);
                res.render("post",{result:result});

          //    });


              });

            });


        }
        //console.log('GET result ->', result)
      });

  });

app.get("/category/:title", function(req, res){
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
        var regex = new RegExp(["^", prodtitle, "$"].join(""), "i");

        db.collection("post").find({"category":regex}).sort({publishedon:-1}).limit(18).toArray(function(err, result) {
          if (err) throw err;
            console.log("Result1: "+result);
        //  db.close();
          res.render("home",{result:result});
        });
      });
});

app.get("/serial/:serialname", function(req, res){
  //  var category=req.params.category;
    var prodtitle=req.params.serialname;
    prodtitle=prodtitle.replace(/-/g,' ');
    console.log(prodtitle);
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/onlinetamilportal";

    MongoClient.connect(url, function(err, MongoClient) {
      if (err) throw err;
        var db = MongoClient.db("onlinetamilportal");
        console.log(prodtitle);
        var regex = new RegExp(["^", prodtitle, "$"].join(""), "i");

        db.collection("post").find({"serialname":regex}).sort({publishedon:-1}).limit(21).toArray(function(err, result) {
          if (err) throw err;
            console.log("Result1: "+result);
        //  db.close();
          res.render("home",{result:result});
        });
      });
});

app.get("/", function(req, res){
  //  var category=req.params.category;

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/onlinetamilportal";

    MongoClient.connect(url, function(err, MongoClient) {
      if (err) throw err;
        var db = MongoClient.db("onlinetamilportal");
        //console.log(prodtitle);
        db.collection("post").find({}).sort({publishedon:-1}).limit(9).toArray( function(err, result){
          if (err) throw err;
            console.log("Result Length: "+result.length);
        //  db.close();
          res.render("home",{result:result});
        });
      });
});

app.get("/page/:count", function(req, res){
  //  var category=req.params.category;
    var cnt=req.params.count;
    cnt=cnt-1;
    cnt=cnt*15;
    console.log("cnt: "+cnt);
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/onlinetamilportal";

    MongoClient.connect(url, function(err, MongoClient) {
      if (err) throw err;
        var db = MongoClient.db("onlinetamilportal");
        //console.log(prodtitle);
        db.collection("post").find({}).sort({publishedon:-1}).skip(cnt).limit(15).toArray( function(err, result){
          if (err) throw err;
            console.log("Result Length: "+result.length);
        //  db.close();
          res.render("home",{result:result});
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
