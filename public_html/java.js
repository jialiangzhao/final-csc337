/*
Author: jialiangzhao
Classroom: csc337
Content: This is where the connection is obtained. 
It needs to get the server connection. Then get the 
value and transfer the value to the right.
*/



//go post.html
function goPost(){
    let url='/post.html';
    window.location=url;
}

//Find the message in the input box and enter it into mongodb.


//login you user if exsit
function loginName(){
    let name=$('#name').val();
    if(name==""){return;}
    let password=$('#password').val();
    if(password==""){return;}
   
    $.ajax({
        url:'/login/'+name+'/'+password,
        method:'GET',
        success: function(result){
           if(result.length==1){
            
            let url='/home.html';
            window.location=url;
            
           }else{
            $('#errLogin').text(result);
           }
        }
    })
}

//get current name
function getName(){
    
    let u = decodeURIComponent(document.cookie.split('=')[1]);

    u=u.substring(2);
    u=JSON.parse(u);
    $('#wellcome').text(u.username);
    $('#wellname').text(u.username);
    let content=$('#head').html();
    content+= "<img src='images/"+u.image+"' class='topclass' id='img2' alt='head' height='50' width='50'/>";
    $('#head').html(content);

}

//search you list
function searchList(value){
    let word=$('#search').val();
   if(word==""){word="1";}
    $.ajax({
        url:'/search/'+word+'/'+value,
        method:'GET',
        success: function(result){
           
            result=JSON.parse(result);
            let content = "";
            for(i in result){
                content+= "<div class='itemDisplay1'>";
                content+="<h1 class='itemName'>"+result[i].title+"</h1>";

                content+="<img src='./images/"+result[i].image+"' alt='file' width='200' height='150'></img>"

                content+="<p class='itemName'>"+result[i].description+"</h1>";
                content+="<p class='itemName'>Current price:"+result[i].price+"</p>";

                if(result[i].stat.toLowerCase()=="sale"){
                    content+="<button  class='itemName' type='button' onclick=\"buy('"+result[i]._id+"');\" >Spend higher prices!</button>";
                }else if(result[i].stat.toLowerCase()=="sold"){
                    content+="<h1 class='itemName'>Item has been purchased</p>";
                }
                content+="</div>";
            }
            $('#displaySet1').html(content);
        }
    })
}

// to buy a item 
function buy(id){
    let titleId=id;
    let u = decodeURIComponent(document.cookie.split('=')[1]);
    u=u.substring(2);
    u=JSON.parse(u);
    console.log(u);
    $.ajax({
        url:'/buy/'+titleId+'/'+u.username,
        method:'POST',
        success: function(result){    
        }
    })
}

//view you listings
function getList(value){
    let u = decodeURIComponent(document.cookie.split('=')[1]);
    u=u.substring(2);
    u=JSON.parse(u);
    let name=u.username;
    

    let thing=value;
    $.ajax({
        url:'/view/'+thing+'/'+name+'/',
        method:'GET',
        success: function(result){
            result=JSON.parse(result);
            let content = "";
            for(i in result){
                content+= "<div class='itemDisplay1'>";
                content+="<h1 class='itemName'>"+result[i].title+"</h1>";

                content+="<img src='./images/"+result[i].image+"' alt='file' width='200' height='150'></img>"

                content+="<p class='itemName'>"+result[i].description+"</h1>";
                content+="<p class='itemName'Current price:>"+result[i].price+"</p>";
                if(result[i].stat.toLowerCase()=="sale"){
                    content+="<button  class='itemName' type='button' onclick=\"buy('"+result[i]._id+"');\" >Spend higher prices!</button>";
                }else if(result[i].stat.toLowerCase()=="sold"){
                    content+="<h1 class='itemName'>SOLD</p>";
                }
                content+="</div>";
            }
           

            $('#displaySet1').html(content);
        }
    })
}

function incomeUp(){
   
    let u = decodeURIComponent(document.cookie.split('=')[1]);
    u=u.substring(2);
    u=JSON.parse(u);
    let user=u.username;

    let name=$('#rName').val();
    if(name==""){return;}

    let money=$('#money').val();
    if(money==""){return;}

    let kind=$('#kind').val();
    if(kind==""){return;}

    let inOr=$('#inOrOut').val();
    if(inOr==""){return;}

    let bio=$('#bio').val();
    let a= new Date();

    let income={ 
        incomename:name,
        incomedes:bio,
        kind:kind,
        money:money,
        inOrOut:inOr,
        date:a,
        time:a.getTime()
    };

    let income_str=JSON.stringify(income);
   
    $.ajax({
        url:'/add/'+user,
        data:{income:income_str},
        method:'POST',
        success: function(result){
           if(result.length>0){
            $('#rName').val("");
            $('#money').val("");
            $('#kind').val("");
            $('#inOrOut').val("");
            $('#bio').val("");

            
           }else{
            $('#errLogin').text(result);
           }
        }
    })
}
