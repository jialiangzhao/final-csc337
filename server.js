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
  deadLine:Object,
  buyer:String
});
var items= mongoose.model('items',itemsSchema);

//Create categories of users.
var userSchema = new Schema({
  username:String,
  head:String,
  salt:String,
  hash:String,
  addMoney:Number,
  listings: [String],
  incomeList:[Object]
});
var user= mongoose.model('user',userSchema);

var incomeSchema = new Schema({
  incomename:String,
  incomedes:String,
  kind:String,
  money:Number,
  inOrOut:String,
  date:Object,
  time:Number
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
app.use('/auction.html',home);
app.use('/money.html',home);


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
          res.cookie('login',{username:u,key:sessionKey,incomeList:results[0].incomeList},{maxAge:200000});
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
  let add=req.body.addMoney;
  if(u=="" || p=="" || req.file.filename==undefined || add==""){
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
       'hash':hStr,"head":req.file.filename,'addMoney':add});
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
  user.find({username:name}).exec(function(error,results){

      if(results.length!=0){
        if(thing=="listings"){
          array=results[0].listings;
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

          
        }else if(thing=="purchases"){

          items.find({stat:"SOLD"}).exec(function(error2,results2){
            let word="[";
              for(j in results2){
                if(results2[j].buyer==name){
                  word+=JSON.stringify(results2[j],null,2)+",";
                }
              }
           if(word=="["){
             word+="]";
           }else{
           word=word.substring(0, word.length - 1) +"]";}
            res.send(word);
          });
        }
      }else{
        res.send("view error");
      }
    
    
  });
});


    
app.post('/buy/:id/:name',function(req,res) {
  let tid=req.params.id;
  let name=req.params.name;
  
  items.find({_id:tid})
  .exec(function(error,results){
    user.find({username:name}).exec(function(error,results1){
      results[0].buyer=name;
      results[0].price+=results1[0].addMoney;
      results[0].save(function(err){if(err) console.log("a save errorr");});

    });
    
    
  });
});


//post items information to html
app.post('/upload', upload.single('photo'),
 function(req, res, next){
  var time= new Date();
  
  var addTime=parseInt(req.body.dead);
   if(req.body.option=='h'){ time.setHours(time.getHours()+addTime);}
   if(req.body.option=='m'){ time.setMinutes(time.getMinutes()+addTime);}
   if(req.body.option=='s'){ time.setSeconds(time.getSeconds()+addTime);}
  let u1={
    title:req.body.title,
    description:req.body.desce,
    image:req.file.filename,
    price:req.body.price,
    deadLine:time,
    stat:"SALE"};
  
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
//post user information to html
app.post('/change',upload.single('photo'),function(req,res,next) {
 
  let u = req.cookies.login.username;
  let add=req.body.addMoney;
  if(req.file.filename==undefined || add==""){
    res.send('no name or password or avatar, do again');
  }

  user.find({username:u}).exec(function(error,results){
    if(results.length!=0){
      results[0].addMoney=add;
      results[0].head=req.file.filename;
      results[0].save(function(err){if(err) console.log("a save errorr");});
      res.redirect("index.html");
      

    }else{
      res.send('Username already taken, do again');
    }
  });
});
//You can look for the string
app.get('/search/:word/:value',function(req,res) {
  let value=req.params.value;
  let word=req.params.word;
  if(value=='all'){
    items.find({stat:"SALE" }).exec(function(error,results){
      res.send(JSON.stringify(results,null,2));
     });}
  if(value=='button'){
  items.find({title:{$regex: word} }).exec(function(error,results){
    res.send(JSON.stringify(results,null,2));
   });}
});

app.get('/income/:name',function(req,res) {

  let name=req.params.name;

  
   user.find({username:name}).exec(function(error,results){
    res.send(JSON.stringify(results[0].incomeList,null,2));
     });
  
});


app.post('/add/:user',function(req,res) {
  let u=req.params.user;
  let in1= JSON.parse(req.body.income);
  
    user.find({username:u}).exec(function(error,results){
      if(results.length>0){
        var in2=new income(in1);
        in2.save(function(err){if(err) console.log("a save errorr");});

        results[0].incomeList.push(in2);
        results[0].save(function(err){if(err) console.log("a save errorr");});
        
        res.send("income add!");
      }else{
        res.send("add error");
      }
     });
});

  app.get('/remove/:username',(req,res)=>{
    let u=req.params.username;
    user.remove({}).exec(function(error,result){
      res.send("remove");
    });
  })
//I don't know what this is for
app.listen(port, function() {
  console.log(`Server running at http://localhost:${port}/`);
});