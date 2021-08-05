// 
// buttons.js
// Buttons Example for CSC444 Assignment 05
// Joshua A. Levine <josh@email.arizona.edu
//
// This file provides a simple example of using d3 to create buttons in
// an html webpage.  The buttons are created from a list of buttons
// (called buttonList) that specifies the id, display text, and
// event-handler function that should be called for each button click.
//
// All buttons are inserted by d3 within a div whose id is main
//

// Here is a list with objects that specify some buttons.






    
    
    
    function searchIncome(){
        let u = decodeURIComponent(document.cookie.split('=')[1]);
        u=u.substring(2);
        u=JSON.parse(u);
        let user=u.username;
        
        var buttonList = [
            {
                id: "colormap-button-1",
                text: "Button 1",
                click: function() { d3.selectAll("circle")
                .transition().duration(1500)
                .attr("fill",function(d){return option1(Math.floor(Math.random() * 100))}); }
            },
            {
                id: "colormap-button-2",
                text: "Button 2",
                click: function() { d3.selectAll("circle")
                .transition().duration(1500)
                .attr("fill",function(d){return option2(Math.floor(Math.random() * 100))}); }
            },
            {
                id: "SAT-cumulative",
                text: "SAT-cumulative",
                click: function() { d3.selectAll("circle")
                .transition().duration(1500)
                .attr("cx",function(d){return cxAdd(d.time-1628130000000);});
                d3.select("#x-axis").transition().duration(1500).call(d3.axisBottom(xScale2));
                d3.select("#xWord").transition().duration(1500).text("Time Line");
                }
            },
            {
                id: "SATV for X",
                text: "SATV for X",
                click: function() { d3.selectAll("circle")
                .transition().duration(1500)
                .attr("cx",function(d){return cxScale(kindChiose(d.kind));});
                d3.select("#x-axis").transition().duration(1500).call(d3.axisBottom(xScale1));
                d3.select("#xWord").transition().duration(1500).text("Kind");
                }
            }
        
        ];

        d3.select("#controls")
    .selectAll("button")
    .data(buttonList)
    .enter()
    .append("button")
    .attr("id", function(d) { return d.id; })
    .text(function(d) { return d.text; })
    .on("click", function(event, d) {
        // Since the button is bound to the objects from buttonList,
        // the expression below calls the click function from either
        // of the two button specifications in the list.
        return d.click();
    });

        var graph=d3.select("#vis1")
        .append("svg")
        .attr("width",500)
        .attr("height",500)
        .attr("id","scatterplot_1");
        
        
    
        var cxScale = d3.scaleLinear()
        .domain([1,8])
        .range([100,488]);

        var cxAdd = d3.scaleLinear()
        .domain([d3.min(u.incomeList,d => d.time-1628130000000)
            ,d3.max(u.incomeList,d => d.time-1628130000000)])
        .range([100,488]);
    
    
        var cyScale = d3.scaleLinear()
        .domain([-d3.max(u.incomeList,d => d.money)
                ,d3.max(u.incomeList,d => d.money)])
        .range([400,12]);
    
    
     
    
        var option1 = d3.scaleQuantize()
        .domain([1,100])
        .range(["#2c7bb6","#abd9e9","#ffffbf","#fdae61","#d7191c"]);
    
        var option2 = d3.scaleLinear()
        .domain([1, 100])
        .range(["#2c7bb6","#ffffbf","#d7191c"]);
    
      
    
        var circle=graph.selectAll("circle")
        .data(u.incomeList)
        .enter().append("circle")
        .attr("cx",function(d){
          return cxScale(kindChiose(d.kind));
            })
        .attr("cy",function(d){
            if(d.inOrOut=="loss"){
                return cyScale(-d.money);
            }else{
                return cyScale(d.money);
            }
        })
        .attr("r",function(d){return Math.floor((Math.random() * 12)+5);})
        .attr("fill",function(d){return option2(Math.floor(Math.random() * 100));});    
        
        var xScale1 = d3.scaleLinear()
        .domain([0,8])
        .range([50, 487]);
    
        var xScale2 = d3.scaleLinear()
        .domain([d3.min(u.incomeList,d => d.time-1628130000000)
            ,d3.max(u.incomeList,d => d.time)-1628130000000])
        .range([50, 487]);
    
    
        var yScale1 = d3.scaleLinear()
        .domain([-d3.max(u.incomeList,d => d.money),d3.max(u.incomeList,d => d.money)])
        .range([425, 4]);
    
        var xLine=graph.append("g").attr("id","x-axis")
        .attr("transform","translate(0,225)")
        .call(d3.axisBottom(xScale1));
    
        var xWord=graph.append("text").text("Kind")
        .attr("id","xWord")
        .attr("x",250).attr("y",470);
    
        var yWord=graph.append("text").text("Money")
        .attr("id","yWord")
        .attr("x",0).attr("y",0)
        .attr("transform", "translate(10,250)rotate(90)");
    
        var yLine=graph.append("g").attr("id","y-axis")
        .attr("transform","translate(50,0)")
        .call(d3.axisLeft(yScale1));
    
        
    
        
    
        
    
        $.ajax({
            url:'/income/'+user,
            method:'GET',
            success: function(result){
                
                result=JSON.parse(result);
                
                let content = "";
                for(i in result){
                   
                    content+= "<div class='itemDisplay'>";
    
                    content+="<h1 class='incomeName'> name:"+result[i].incomename+"</h1>";
                    content+="<p class='incomeName'> description:"+result[i].incomedes+"</h1>";
                    content+="<p class='incomeName'> kind:"+result[i].kind+"</p>";
                    content+="<p class='incomeName'> money:"+result[i].money+"</p>";
                    content+="<p class='incomeName'> status:"+result[i].inOrOut+"</p>";
                    content+="<p class='incomeName'> date:"+result[i].date.toLocaleString();+"</p>";
                    
                    content+="</div>";
                }
                $('#income_record').html(content);
            }
        })
        
    }


function kindChiose(a){
    let b=0;
    if(a=="diet"){
        b=1;
    }
    else if (a=="transportation"){
        b=2;
    }
    else if (a=="rent"){
        b=3;
    }
    else if (a=="medical"){
        b=4;
    }
    else if (a=="shop"){
        b=5;
    }
    else if (a=="salary"){
        b=6;
    }
    else if (a=="stock"){
        b=7;
    }
    else { b=8;}
    return b;
}