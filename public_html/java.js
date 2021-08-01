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
function sendName(){
    let name=$('#nameset').val();
    if(name==""){return;}
    let password=$('#passset').val();
    if(password==""){return;}

    let user={ username:name,password:password};
    let user_str=JSON.stringify(user);
   
    $.ajax({
        url:'/add/user/',
        data:{user:user_str},
        method:'POST',
        success: function(result){
            $('#errCreate').text(result);
        }
    })
}

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
}

//search you list
function searchList(){
    let word=$('#search').val();
   
    $.ajax({
        url:'/search/'+word,
        method:'GET',
        success: function(result){
           
            result=JSON.parse(result);
            let content = "";
            for(i in result){
                content+= "<div class='itemDisplay'>";
                content+="<h1 class='itemName'>"+result[i].title+"</h1>";

                content+="<img src='./images/"+result[i].image+"' alt='file' width='200' height='150'></img>"

                content+="<p class='itemName'>"+result[i].description+"</h1>";
                content+="<p class='itemName'>"+result[i].price+"</p>";

                if(result[i].stat.toLowerCase()=="sale"){
                    content+="<button  class='itemName' type='button' onclick=\"buy('"+result[i]._id+"');\" >Buy Now!</button>";
                }else if(result[i].stat.toLowerCase()=="sold"){
                    content+="<h1 class='itemName'>Item has been purchased</p>";
                }
                content+="</div>";
            }
            $('#displaySet').html(content);
        }
    })
}

// to buy a item 
function buy(id){
    let titleId=id;
    let u = decodeURIComponent(document.cookie.split('=')[1]);
    u=u.substring(2);
    u=JSON.parse(u);
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
        url:'/view/'+thing+'/'+name,
        method:'GET',
        success: function(result){
            result=JSON.parse(result);
            let content = "";
            for(i in result){
                content+= "<div class='itemDisplay'>";
                content+="<h1 class='itemName'>"+result[i].title+"</h1>";

                content+="<img src='./images/"+result[i].image+"' alt='file' width='200' height='150'></img>"

                content+="<p class='itemName'>"+result[i].description+"</h1>";
                content+="<p class='itemName'>"+result[i].price+"</p>";
                if(result[i].stat.toLowerCase()=="sale"){
                    content+="<button  class='itemName' type='button' onclick=\"buy('"+result[i]._id+"');\" >Buy Now!</button>";
                }else if(result[i].stat.toLowerCase()=="sold"){
                    content+="<h1 class='itemName'>SOLD</p>";
                }
                content+="</div>";
            }
           

            $('#displaySet').html(content);
        }
    })
}


