import Database from "./database/Database.js";
import Express from "express";
import CORS from "cors";
import Path from "path";
import axios from "axios";
import cheerio from "cheerio";
import MongoClient from "mongodb";
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// import checkAuth from "./middlewares/check-auth.js";
import { extract } from '@extractus/article-extractor'
import googleImage from 'googlethis';


const App = Express();
const port = process.env.PORT || 5000;
// axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://zany-pink-dolphin-veil.cyclic.app'// process.env.API_URL;
const uri = process.env.MONGODB_URI
// const client = new MongoClient(uri);

App.use(Express.json());
App.use(CORS());
App.use(bodyParser.json());

const dbContent = new Database();
dbContent.connect("myContent","content");

App.post("/api/content/add", async (req,res) => {
  console.log(req.body)
  // var article = await extract(req.body.url);
  const response = await dbContent.addContent(req.body);
  console.log(response)
  res.json(response);
  // res.json('yea')
})

App.post("/api/article/create", async (req,res) => {
  console.log(req.body)
  if (req.body.content) {
    var sum = await dbContent.getArticleSummary(req.body)
    res.json(req.body)
  } else {
    res.json({error: 'article must have content'})
  }
})

App.post("/api/content/create", async (req,res) => {
  console.log(req.body)
  console.log(req.body)
  const response = await dbContent.addContent(req.body);
  res.json(response);
})
/*App.post("api/content/create", async (req,res) => {
// App.post("api/content/create", async (req,res) => {
  console.log(req.body)
  const response = await dbContent.addContent(req.body);
  res.json(response);
})*/
App.get("/api/contents/:id", async (req,res) => {
  var entry = await dbContent.getContents(req.params.id)
  res.json(entry)
})

App.get("/api/content/:id", async (req, res) => {
  // console.log(req.params.id)
  var entry = await dbContent.getContent(req.params.id)
  // console.log(entry)
  res.json(entry)
})

App.patch("/api/content/:id", async (req, res) => {
  let id = req.params.id;
  let updateValues = req.body.formValues;
  console.log(id + updateValues)
  const response = await dbContent.updateContent(id, updateValues);
  res.json(response);
});

/*App.get("api/img", async (req,res) => {
  console.log(req.params)
  const images = await googleImage.image(req.params.term, { safe: false });
  console.log(images);
  res.json(image)
})*/

App.post("/api/find/images", async (req, res) => {
  console.log(req.body)
  const images = await googleImage.image(req.body.searchTerm, { safe: false });
  console.log(images);
  res.json(images)
  // var entry = await dbContent.getContent(req.params.id)
  // console.log(entry)
  // res.json(entry)
})

const dbJobs = new Database();
dbJobs.connect("jobs","conditioningInfo");
App.get("/api/job/:id", async (req,res) => {
  console.log(req.params.id)
  var job = await dbJobs.getJob(req.params.id)
  res.json(job[0])
})

App.get("/api/jobs/:id", async (req,res) => {
  var jobs = await dbJobs.getJobs(req.params.id)
  res.json(jobs)
})

App.post("/api/jobs/insert", async (req,res) => {
  var job = await dbJobs.startJob(req.body)
  res.json(job)
})

const dbBrands = new Database();
dbBrands.connect("brandings","conditioningInfo");
App.get("/api/brands/:id", async (req,res) => {
  console.log(req.params.id)
  var brands = await dbBrands.getBrands(req.params.id)
  res.json(brands)
})

App.get("/api/brand/:id", async (req,res) => {
  console.log(req.params.id)
  var brand = await dbBrands.getBrand(req.params.id)
  res.json(brand[0])
})

/*App.get("/api/brands/find/:name", async (req,res) => {

})*/

App.post("/api/brand/create", async(req,res) => {
  req.body.categories = JSON.parse(req.body.categories)
  var insert = await dbBrands.insertToDb(req.body)
  res.json(insert)
})

App.post("/api/article/url", async (req, res) => {
  // console.log(req.body.url)
  try {
    if (!req.body.content) {
      var article = await extract(req.body.url);
      article.creator = req.body.creator
      // console.log(article)
    } else {
      var article = req.body
    }
    // console.log(article)
    var sum = await dbContent.getArticleSummary(article)
    // console.log(article)
    await dbContent.addContent(article)
    // console.log(sum)
    } catch(e) {
      // console.log('Catch an error: ', e)
      var article = null
      console.log({error:'could not scrape'})
    }

  res.json(article)
  // res.status(200).send('some text')
})

// Routes for "users" collection
const dbUsers = new Database();
dbUsers.connect("users");

App.post("/api/user/create", async (req, res) => {
  let userObj = req.body;
  console.log(req.body)
  const response = await dbUsers.createUser(userObj);
  console.log(response)
  res.json(response);
})

App.post("/api/user/signin", async (req, res) => {
  let userObj = req.body;
  console.log(req.header)
  const response = await dbUsers.signIn(userObj);
  console.log(response)
  res.json(response);
})

// Routes for "players" collection
const dbPlayers = new Database();
dbPlayers.connect("players");

// POST ROUTE: Create a new account
App.post("/api/account/create", async (req, res) => {
  let username = req.body.username;
  console.log(req.body)
  const response = await dbPlayers.createAccount(username);
  res.json(response);
});

// GET ROUTE: Find account
App.get("/api/account/:username", async (req, res) => {
  let username = req.params.username;
  const response = await dbPlayers.readAccount(username);
  res.json(response);
});

App.patch("/api/account/:username", async (req, res) => {
  let username = req.params.username;
  let newPin = req.body.newPin;
  const response = await dbPlayers.addGame(username, newPin);
  res.json(response);
});

// Routes for "games" collection
const dbGames = new Database();
dbGames.connect("games");

// POST ROUTE: Create a new game
App.post("/api/games/:pin", async (req, res) => {
  let newGame = {
    pin: req.params.pin,
    course: req.body.course,
    holes: req.body.holes,
    scorecard: req.body.scorecard
  };
  const response = await dbGames.createGame(newGame);
  res.json(response);
});

// GET ROUTE: Search the game database and return the game details
App.get("/api/games/:pin", async (req, res) => {
  let gamePin = req.params.pin;
  const response = await dbGames.readOne(gamePin);
  res.json(response);
});

// GET ROUTE: Search for multiple games with an array of pins
App.get("/api/player/games", async (req, res) => {
  let pinArray = req.query.pinArray;
  const response = await dbGames.readMany(pinArray);
  res.json(response);
});

// PATCH ROUTE: Update player handicap
App.patch("/api/player/:username", async (req, res) => {
  let username = req.params.username
  let handicap = req.body.handicap
  const response = await dbPlayers.updateHandicap(username,handicap)
  res.json(response);
})

// PATCH ROUTE: Add a player to the game
App.patch("/api/games/:pin", async (req, res) => {
  let pin = req.params.pin;
  // Retrieve player data
  let playerData = {
    username: req.body.username,
    handicap: req.body.handicap,
    gameArray: req.body.gameArray,
    // adjustedArray: req.body.adjustedArray,
    playerMatchData: req.body.playerData
  };
  const response = await dbGames.updateOne(pin, playerData,req.body.holes);
  res.json(response);
});

// Routes for "course" collection
const dbCourses = new Database();
dbCourses.connect("courses");

App.get("/api/courses/:name", async(req,res) => {
  console.log(req.params.name)
  let courses = []
  const response = await dbCourses.findMyCourseByName(req.params.name);
  console.log(response[0] ? response[0].name : null)
  if (response.length === 0) {
    console.log('search external db')
    // make sure no repeating cids
    let { data } = await axios({
      method:"GET",
      url:'https://freegolftracker.com/courses/ajaxgetcourse.php',
      params: {
        cnamechk: req.params.name
      },
    })
    var courseEntires = []
    data.map(x=>courseEntires.push({name:x.course_name,cid:x.courseid,address:{cityState:x.city + ', ' + x.state}}))
    // console.log(courseEntires)
    const entries = await dbCourses.insertCourses(courseEntires);
    res.json(courseEntires)
  } else {
    res.json(response)
  }
  /*let { data } = await axios({
    method: "GET",
    // url: "https://www.mscorecard.com/mscorecard/courses.php?CourseName=eagle+creek&Country=USA&SubmitButton=Search",
    url: 'https://www.mscorecard.com/mscorecard/courses.php',
    params: {
      CourseName: req.params.name,
      Country: "USA",
      SubmitButton: "Search",
      // within: "50",
    },
  });

  const $ = cheerio.load(data);
  let elements = $("div.page-content");
  elements
    .find("a > div.row")
    // .find("#search_result > div > div.course-heading > div > span.courseTitleKey > span:nth-child(1) > a")
    .each((i, element) => {
      const $element = $(element);
      var urlName = $element.parent().attr('href')
      // console.log($element.parent().attr('href'))
      if ($element.find('div').first().find('div').length == 4) {
        var courseName = $element.find('div').first().find('div:nth-child(3)').text().trim()
        // console.log($element.find('div').first().find('div:nth-child(3)').text().trim())
      } else {
        var courseName = $element.find('div').first().find('div:nth-child(2)').text().trim()
        // console.log($element.find('div').first().find('div:nth-child(2)').text().trim())
      }
      let courseLocation = $element.find('div.course-location').text().trim()
      let course = {
        name: courseName,
        location: courseLocation,
        slug: urlName,
      }
      courses.push(course);
    });
    console.log(courses)*/
  // res.json(courses)
})

/*async function connectMongo() {
  var client = await MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })// .then(client => {
    .catch(err => { console.log(err); });

    if (!client) {
      return;
  }

  try {

    const db = client.db("golf-app");
    const courseInfo = await db.collection('courses').find().toArray()
    console.log(courseInfo)
    return courseInfo
    // res.json(courseInfo)

  } catch (err) {

         console.log(err);

      } finally {

         client.close();
      }
}*/

let db;

const loadDB = async () => {
    if (db) {
        return db;
    }
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI,{useUnifiedTopology: true});
        db = client.db('golf-app');
        const dbCourses = await db.collection('courses')
    } catch (err) {
        Raven.captureException(err);
    }
    return dbCourses;
};

App.get("/api/courses", async(req,res) => {
  /*var theCourse = await connectMongo()
  console.log(theCourse)
  res.json(theCourse)*/
  // const db = await loadDB();
  const response = await dbCourses.findCourses();
  res.json(response)

  /*const response = await dbCourses.findCourses();
  console.log(response)
  res.json(response)*/

})

// POST ROUTE: Create a new course
App.get("/api/course/:cid", async (req, res) => {

  const response = await dbCourses.findMyCourse(req.params.cid);
  if (response.scorecard) {
    // console.log(response)
    res.json(response);
  } else {
    console.log('search for course')
    console.log(`https://freegolftracker.com/courses/${response.name.replace(/\s/g, '-')}_${req.params.cid}`)
    let { data } = await axios({
      method: "GET",
      // url: "https://www.mscorecard.com/mscorecard/courses.php?CourseName=eagle+creek&Country=USA&SubmitButton=Search",
      // url: 'https://freegolftracker.com/courses/Point-Mallard_31.htm',
      url: `https://freegolftracker.com/courses/${response.name.replace(/\s/g, '-')}_${req.params.cid}.htm`,
    });
    // console.log(data)
    const $ = cheerio.load(data);
    var newInfo = {}
    newInfo.name = response.name
    newInfo.cid = req.params.cid
    newInfo.address = {}
    // console.log($('.container').find('div.col-md-6:nth-child(1)').find('tr:nth-child(1)').text())
    newInfo.address.street = $('.container').find('div.col-md-6:nth-child(1)').find('tr:nth-child(3)').find('td:nth-child(2)').text().trim()
    newInfo.address.zip = $('.container').find('div.col-md-6:nth-child(1)').find('tr:nth-child(6)').find('td:nth-child(2)').text().trim()
    newInfo.address.cityState = $('.container').find('div.col-md-6:nth-child(1)').find('tr:nth-child(4)').find('td:nth-child(2)').text().trim() + ', ' + $('.container').find('div.col-md-6:nth-child(1)').find('tr:nth-child(5)').find('td:nth-child(2)').text().trim()
    newInfo.url = $('.container').find('div.col-md-6:nth-child(1)').find('tr:nth-child(2)').find('td:nth-child(2)').text().trim()

    let table = "";
    // if ($("#body").children().length > 0) {
    let scoreCardTables = $('.container').find("table.table-bordered")
    // console.log($(scoreCardTables.get(1)).html())
    let html = $(scoreCardTables.get(0)).html() + '<br/>' + $(scoreCardTables.get(1)).html()
    table = html !== null ? html.trim() : "";
    newInfo.scorecardHtml = table

    var scorecard = []

    // var $$ = cheerio.load($(".scorecardtable").html());
    // console.log($(".scorecardtable").find('tr.nonfocus'))
    var indexArray = [1,2]
    // console.log([...Array(9).keys()])
    // console.log($('.container').find("div.table-responsive").text())
    let allBtns = $('.container').find("div.table-responsive")
    for (const index of indexArray) {
      var i = 1
      for (const row of $(allBtns.get(index)).find('tr:nth-child(1)').find('td')) {
        if (!isNaN($(row).text())) {
          scorecard.push({holeNumber:Number($(row).text()),par:Number($(allBtns.get(index)).find('tr:nth-child(2)').find('td:nth-child(' + i + ')').text()),slope:Number($(allBtns.get(index)).find('tr:nth-child(7)').find('td:nth-child(' + i + ')').text())})
          // console.log('Hole: ' + $(row).text() + ' Par: ' + $(allBtns.get(index)).find('tr:nth-child(2)').find('td:nth-child(' + i + ')').text())
        }
        i++
      }
    }
    var x = 0
    for (const cap of $('.container').find("td:contains('Handicap')").first()) {
      // console.log($(cap).text())
      // console.log($(cap).nextUntil('tr').text())
      // console.log($(cap).nextUntil('tr').length)
      // console.log($(cap).next('tr:nth-child(' + (x+1) + ')').text())
      for (const capNumb of $(cap).nextUntil('tr')) {
        if ($(capNumb).text().trim()) {
          scorecard[x].slope = Number($(capNumb).text().trim())
          x++
        }
      }
    }
    for (const cap of $('.container').find("td:contains('Handicap')").last()) {
      // console.log($(cap).text())
      // console.log($(cap).nextUntil('tr').text())
      // console.log($(cap).nextUntil('tr').length)
      // console.log($(cap).next('tr:nth-child(' + (x+1) + ')').text())
      for (const capNumb of $(cap).nextUntil('tr')) {
        if ($(capNumb).text().trim()) {
          scorecard[x].slope = Number($(capNumb).text().trim())
          x++
        }
      }
    }
    newInfo.scorecard = scorecard
    // console.log(newInfo)
    var updatedEntry = await dbCourses.updateCourse(newInfo)
    // console.log(updatedEntry)

    res.json(newInfo);
  }

  /*let { data } = await axios({
    method: "GET",
    // url: "https://www.mscorecard.com/mscorecard/courses.php?CourseName=eagle+creek&Country=USA&SubmitButton=Search",
    url: 'https://www.mscorecard.com/mscorecard/showcourse.php',
    params: {
      cid: req.params.cid,
    },
  });
  const $ = cheerio.load(data);
  // let og = $("head > meta[property='og:url']").attr("content");
  // let dbID = og !== undefined ? Number(og.split("=")[1]) : NaN;
  //   console.log(dbID);
  let name = $(".page-content").find('h1').first().text().trim();
  let address = $(".page-content").find('div.col-md-4').text();

let addressObj = {}
var i = 0
for (const element of $(".page-content").find('div.col-md-4').contents()) {
  // console.log(element.type)
  if (element.type === 'text') {
    if (i === 0) {
      var street = $(element).text()
    }
    if (i === 2) {
      console.log($(element).text().split(' ')[0])
      var zip = $(element).text().split(' ')[0]
      var cityState = $(element).text().split(' ').slice(1).join(' ')
    }
  }
  i++
}

  for (const element of $(".page-content").find('div.col-md-8').children()) {
    if ($(element).find('i').text() == 'desktop_windows') {
       //  console.log($(element).find('i').text())
       var url = $(element).find('i').next().text()
    }
  }
  // let url = $(".popup.web-url").text().trim();

  // let scorecardUrl = `https://www.golflink.com/golf-courses/popups/scorecard.aspx?c=${dbID}`;
  // let scorecard = await (await axios.get(scorecardUrl)).data;
  // let score = await fetch(scorecardUrl);

  let table = "";
    let html = $(".scorecardtable").html();
    table = html !== null ? html.trim() : "";

    // console.log(table);

  var info = {
    name: name,
    // address: address,
    address: {
      street: street,
      cityState: cityState,
      zip: Number(zip),
    },
    // slug: req.body.slug,
    url: url,
    // zip: Number(req.body.zip),
    cid: req.params.cid,
    // scorecardUrl: scorecardUrl,
    scorecardHtml: table,
  };
  console.log(info);
  res.json(info)*/
  /*let newCourse = {
    pin: req.params.cid,
    course: req.body.course,
    holes: req.body.holes,
  };
  const response = await dbCourses.createCourse(info);
  res.json(response);*/
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  const __dirname = Path.resolve();
  // Set static folder
  App.use(Express.static("client/build"));
  App.get("*", (req, res) => {
    res.sendFile(Path.resolve(__dirname, "client", "build", "index.html"));
  });
}
(async () => { // async function
  try {
    await mongoose.connect(uri); // wait for connection
      // Listen to port
      App.listen(port, () => console.log(`Server started on port ${port}`));
    } catch (error) {
    console.console.log("Something went wrong!!!");
    console.error(error);
  }
})(); // Immediate invoke
