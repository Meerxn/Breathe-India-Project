var Twitter = require("twitter");
var config = require("./config.js"); // Consists of API credentials
var T = new Twitter(config);
const fs = require("fs");

/**
 * This function is responsible for reading the time.json file to see the last time the mentions were scraped from the API
 * Assigns both the current time stamp and timeJSON
 */
function readTimeStamp() {
  fs.readFile("time.json", "utf8", function (err, data) {
    if (err) {
      throw err;
    }
    timeJson = JSON.parse(data);
    timeStamp = timeJson.timestamp;
  });
}

/**
 * This function collects all the relvant new request for Covid Supplies by checking whether the mention has "request"
 * @param {Object} data : Holds all the data to the tweets that come from the mentions API call
 * @param {Array} tempRequests : Used to process all the valid tweets that have "request"
 * @param {int} timeStamp: Used to check the time stamp of the tweets from data
 */
function collectRequests(data, tempRequests, timeStamp) {
  for (i = 0; i < data.length; i++) {
    if (data[i].user.screen_name !== "BreatheIndia21") {
      if (new Date(timeStamp) >= new Date(data[i].created_at)) {
        break;
      }
      console.log("created reps");
      if (data[i].text.toLowerCase().includes("request")) {
        tempRequests.push(data[i].text);
      }
    }
  }
}
/**
 * This functions takes all valid requests and scrapes the mentions, spaces and extra characters that occur within a Tweet
 * @param {Array} tempRequests : Holds all the current requests which are unprocessed
 * @param {Array} processed : Array to insert all processed requests into
 */
function processRequests(tempRequests, processed) {
  for (i = 0; i < tempRequests.length; i++) {
    currRequest = ""; // processed text
    requestArr = tempRequests[i].split(" ");
    for (j = 0; j < requestArr.length; j++) {
      if (requestArr[j].includes("@") || requestArr[j].includes("http")) {
        continue;
      } else {
        if (requestArr[j].toLowerCase().includes("request")) {
          requestArr[j] = requestArr[j].replace("request", " ");
        }
        currRequest = currRequest + " " + requestArr[j].trim();
      }
    }
    processed.push(currRequest);
  }
}
/**
 * This functions Tweets out the information for all requests of people that need supplies due to Covid using the API to tweet
 * @param {Array} processed : Holds all the processed request data needed
 */
function createTweet(processed) {
  for (i = 0; i < processed.length; i++) {
    params = {
      status: "NEW REQUESTS FOR SUPPLIES " + "\n" + "\n" + processed[i] + " ",
    };
    T.post("statuses/update", params, function (err, data) {
      console.log("Ticket created");
    });
  }
}
var timeStamp;
var timeJson;
/**
 * MAIN METHOD: Processes mentions checks for requests and tweets on bot account
 */
let timerId = setInterval(() => {
  tempRequests = [];
  var params = {
    q: "#nodejs",
    screen_name: "BreatheIndia21",
    count: "200",
  };
  readTimeStamp();
  /**
   * This consists of API to retrive all mentioned tweets and call methods that will process those tweets
   */
  T.get("statuses/mentions_timeline", params, function (err, data) {
    if (parseInt(timeStamp) === 0) {
      var len = data.length;
      timeStamp = new Date(data[len - 1].created_at);
    }
    collectRequests(data, tempRequests, timeStamp);
    processed = [];
    processRequests(tempRequests, processed);
    // Check if API calls have run out (Twitter has a limit to its calls)
    if (typeof data[0] !== "undefined") {
      timeStamp = new Date(data[0].created_at);
      timeJson.timestamp = timeStamp;
    }
    // Update time file and create Tweets
    fs.writeFileSync("time.json", JSON.stringify(timeJson));
    createTweet(processed);
  });
}, 60000);
