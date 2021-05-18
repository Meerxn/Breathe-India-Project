
var Twitter = require('twitter');
var config = require('./config.js');
var T = new Twitter(config);
const fs = require("fs")

let timerId = setInterval(() =>{



temp = []


// Set up your search parameters
var params = {
  q: '#nodejs',
  //cursor: 'MTM5MTA4MzYwODExOTU5OTEwOA'
  screen_name: 'BreatheIndia21',
  count: '200'
  
}

var timeStamp;
var timeF;
fs.readFile("time.json", 'utf8', function(err, data) {
  if (err) throw err;
  //console.log('OK: ' + "time.txt");
  tempV = JSON.parse(data);
  timeF = tempV;

  //console.log(tempV.timestamp)
  timeStamp = tempV.timestamp;
});
var x = 0;
// Initiate your search using the above paramaters
//console.log(timeStamp)
T.get('statuses/mentions_timeline', params, function(err, data) {
  if(parseInt(timeStamp) === 0){
    var len = data.length
  timeStamp = new Date(data[len-1].created_at);
  
  }

 console.log(data);
  
for(i = 0 ; i < data.length ; i++){
  
if(data[i].user.screen_name !== 'BreatheIndia21'){
  console.log("nostuck")
  if(new Date(timeStamp) >= new Date(data[i].created_at)) {
    break;
  }
  console.log("created reps");

    params2 = {
        status:  "@"+data[i].user.screen_name +' Thank you for creating a ticket Please make sure to type your Name, Number, Supplies and the address it needs to be delivered to',
        in_reply_to_status_id: data[i].id_str,
    }
    
    T.post('statuses/update', params2,function(err,data){
      if(err){
        return
      }
      else{
      console.log("tweet reply sent!")
      }
    })
   if (data[i].text.toLowerCase().includes("request")){
    temp.push(data[i].text);

   }

}
else{
  continue;
}
}




processed = []
for(i = 0 ; i < temp.length ; i++){
  tempVal = ""
  console.log("splitting");
  kemp = temp[i].split(" ");

 for(j = 0 ; j < kemp.length; j++){
   if (kemp[j].includes("@") || kemp[j].includes("http")){
     continue
   }
   else{
     if(kemp[j].toLowerCase().includes("request")){
       console.log("here");
      kemp[j] =  kemp[j].replace('request',' ');
     }
     tempVal = tempVal + " " + kemp[j].trim();
   }
 }
 console.log(tempVal);
 processed.push(tempVal);

}
//console.log(data[0]);
if (typeof data[0] !== 'undefined'){
console.log("reached Here");
timeStamp  = new Date(data[0].created_at);
timeF.timestamp = timeStamp;
}
fs.writeFileSync("time.json", JSON.stringify(timeF));


for(i = 0; i < processed.length ; i++){
if(typeof processed[i+1] == "undefined"){
  params = {
    status: "NEW REQUESTS FOR SUPPLIES " + "\n" + '\n' + processed[i] + "\n" + "\n"
  }
}
  else{
    params = {
      status: "NEW REQUESTS FOR SUPPLIES " + "\n" + '\n' + processed[i] + "\n" + "\n" + processed[i+1]
    }  
  }
  i = i + 1;
  T.post('statuses/update',params,function(err,data){
    console.log("Ticket created");
  })
}
//}






//console.log(processed[0]);
});



// params2 = {
//   screen_name: "KnightOfVictory"
// }
// T.get("users/lookup",params2, function(err,data){
//   console.log(data);
// })
}, 60000);
//fix