/*
Author: jialiangzhao
Classroom: csc337
Content: Users can log in their information, 
and will establish a connection with the product.
 Each user can check their own products.
*/

//Create the connection format and set the connection data.
const express = require('express');
const mongoose=require('mongoose');
const cookieParser=require('cookie-parser');
const { nextTick } = require('process');
const parser= require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const upload = multer({dest: __dirname + '/public_html/images'});
const app = express();
const iterations=1000;
app.use(parser.json());
app.use(parser.urlencoded({extended:true}));




app.use(cookieParser());

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/auto';
const port = 3000;


//Create categories of items.
var Schema = mongoose.Schema;
var itemsSchema = new Schema({
  title:String,
  description:String,
  image:String,
  price:Number,
  stat:String,
  deadLine:String,
  current:Number
});
var items= mongoose.model('items',itemsSchema);

//Create categories of users.
var userSchema = new Schema({
  username:String,
  head:String,
  salt:String,
  hash:String,
  listings: [String],
  incomeList:[String]
});
var user= mongoose.model('user',userSchema);

var incomeSchema = new Schema({
  incomename:String,
  incomedes:String,
  kind:String,
  money:Number,
  inOrOut:String,
});
var income= mongoose.model('income',incomeSchema);

var sessionKeys ={};
function updateSessions(){
  var now=Date.now();
  for(e in sessionKeys){
    if(sessionKeys[e][1]<(now-200000)){
      delete sessionKeys[e];
    }
  }
  items.find({}).exec(function(error,results){
    for(i in results){
      if(results[i].deadLine<=now){
        results[i].stat="SOLD";
        results[i].save(
          function(err){if(err) console.log("a save errorr");}
          );
        }
      }
  });
}

setInterval(updateSessions,2000);




//set up default mongoose connection
mongoose.connect(mongoDBURL,{useNewUrlParser:true});
db.on('error',console.error.bind(console,'MongoDb connection error:'));

function home(req,res,next){
  
  if(Object.keys(req.cookies).length>0){
  let u = req.cookies.login.username;
  let key= req.cookies.login.key;
  if(Object.keys(sessionKeys[u]).length>0 && sessionKeys[u][0]==key){
    next();
  }else{
    res.send('Not Allowed');
  }
  }else{
    res.send('Not Allowed');}
    
}

app.use('/home.html',home);
app.use('/post.html',home);

app.use('/',express.static('public_html'));


////////////////////////////////////
app.get('/login/:u/:p',function(req,res) {
  let u=req.params.u;
  let p=req.params.p;

  user.find({username:u}).exec(function(error,results){
    if(results.length==1){

      var salt = results[0].salt;
      crypto.pbkdf2(p, salt, iterations, 64, 'sha512',
      (err,hash) =>{
        if(err) throw err;
        let hStr = hash.toString('base64');
        if(results[0].hash==hStr){
          let sessionKey=Math.floor(Math.random()*1000);
          sessionKeys[u]=[sessionKey,Date.now()];
          res.cookie('login',{username:u,key:sessionKey},{maxAge:200000});
          res.send(results);
        }
        });

    }else{
      res.send('Incorrect login, please try again...');
    }
  });
});




//post user information to html
app.post('/new',upload.single('photo'),function(req,res,next) {
 
  let u=req.body.name;
  let p=req.body.password;
  if(u=="" || p=="" || req.file.filename==undefined){
    res.send('no name or password or avatar, do again');
  }

  user.find({username:u}).exec(function(error,results){
    if(results.length==0){
    
      var salt = crypto.randomBytes(64).toString('base64');
      crypto.pbkdf2(p, salt, iterations, 64, 'sha512',
      (err,hash) =>{
        if(err) throw err;
        let hStr = hash.toString('base64');
        var account= new user({'username':u,'salt':salt,
       "head":req.file.filename,'hash':hStr});
        account.save(function(err){if(err) console.log('an error')});
        res.redirect("index.html");
        });

    }else{
      res.send('Username already taken, do again');
    }
  });
});




//Make a network connection by get.
app.get('/get/:thing',function(req,res) {
  let thing=req.params.thing;
  
  if(thing=="users"){
  user.find({}).exec(function(error,results){
    res.end(JSON.stringify(results,null,2));
  });
}else if(thing=="items"){
  items.find({}).exec(function(error,results){
    res.end(JSON.stringify(results,null,2));
  });
  }
});

app.get('/view/:thing/:name',function(req,res) {
  let thing=req.params.thing;
  let name=req.params.name;
  var array=[];
  user.find({}).exec(function(error,results){
    
    for(i in results){
      if(results[i].username==name){
        if(thing=="listings"){
          array=results[i].listings;
        }else if(thing=="purchases"){
          array=results[i].purchases;
        }
      }
    }
    items.find({}).exec(function(error1,results1){
      let word="[";
     
      for(i in array){
        for(j in results1){
          if(results1[j]._id==array[i]){
            word+=JSON.stringify(results1[j],null,2)+",";
          }
        }
     }
     if(word=="["){
       word+="]";
     }else{
     word=word.substring(0, word.length - 1) +"]";}
      res.send(word);
    });
  });
});


    
app.post('/buy/:id/:name',function(req,res) {
  let tid=req.params.id;
  let name=req.params.name;
  items.find({_id:tid})
  .exec(function(error,results){
    results[0].stat="SOLD";
    results[0].save(function(err){if(err) console.log("a save errorr");});
    user.find({username:name})
    .exec(function(error,result){
      result[0].purchases.push(results[0]._id);
      result[0].save(function(err){if(err) console.log("a save errorr");});
    });
  });
});


//post items information to html
app.post('/upload', upload.single('photo'),
 function(req, res, next){
  let u1={
    title:req.body.title,
    description:req.body.desce,
    image:req.file.filename,
    price:req.body.price,
    stat:req.body.status};
  
  let name = req.cookies.login.username;
  user.find({username:name})
  .exec(function(error,results){
    var i2=new items(u1);
    i2.save(function(err){if(err) console.log("a save errorr");});
    results[0].listings.push(i2._id);
    results[0].save(function(err){if(err) console.log("a save errorr");});
    res.redirect("home.html");
  });

});
//You can look for the string
app.get('/search/:word',function(req,res) {

    let word=req.params.word;
    items.find({description:{$regex: word} }).exec(function(error,results){
      res.send(JSON.stringify(results,null,2));
    });
   

});

//I don't know what this is for
app.listen(port, function() {
  console.log(`Server running at http://localhost:${port}/`);
});