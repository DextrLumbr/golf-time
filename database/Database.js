import MongoClient from "mongodb";
import jwt from 'jsonwebtoken';
import bcrypt from'bcrypt';
import axios from "axios";
// import createJWT from "../utils/auth" "./database/Database.js";
import winkNLP from 'wink-nlp';
// Load english language model — light version.
import its from 'wink-nlp/src/its.js';
import as from 'wink-nlp/src/as.js';
import model from 'wink-eng-lite-model';
const nlp = winkNLP(model);
import BM25Vectorizer from 'wink-nlp/utilities/bm25-vectorizer.js';
import SummaryTool from 'node-summary';
import ObjectId from "mongoose";

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;


import dotenv from "dotenv";
dotenv.config();

export default class Database {
  constructor() {
    // Setup a default value for connection
    this.connection = null;
    // Setup a default value for database
    this.database = null;
    // Setup a default value for collection
    this.collection = null;
  }

  // Connect to the database
  async connect(collection,db) {
    this.connection = await MongoClient.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
    });
    if (db) {
      this.database = this.connection.db(db);
    } else {
      // Select golf-app database
      this.database = this.connection.db("golf-app");
    }
    // Select the collection
    this.collection = this.database.collection(collection);
  }

  // Collection: "players"

  async getContent(id) {
    // console.log(await this.collection.find({ _id: MongoClient.ObjectId(id) }).toArray())
    // let insert = await this.collection.findOne({_id:new ObjectId(id)})
    let insert = await this.collection.find({_id: MongoClient.ObjectId(id)}).toArray()// .toArray()
    // console.log(insert)
    return insert;
  }

  async getContents(id) {
    // console.log(await this.collection.find({ _id: MongoClient.ObjectId(id) }).toArray())
    // let insert = await this.collection.findOne({_id:new ObjectId(id)})
    let insert = await this.collection.find({creator: MongoClient.ObjectId(id)}).toArray()// .toArray()
    // console.log(insert)
    return insert;
  }

  async addContent(obj) {
    // let insert = await this.collection.insertOne({url: obj.url, date:Date()})
    if (obj.creator) {
      // obj.creator = [{id:MongoClient.ObjectId(obj.creator),role:0}]
      obj.creator = MongoClient.ObjectId(obj.creator)
    }
    obj.created = new Date(Date.now()).toString()
    // obj.created = Date()
    let insert = await this.collection.insertOne(obj)
    console.log(insert)
    return insert;
  }

  async getBlogContents(id) {
    return await this.collection.find({
      creator: MongoClient.ObjectId(id), status:'published'
    }).toArray();
  }

  async insertBrandToDb(obj) {
    // obj.created = Date()
    if (obj.creator) {
      obj.created = new Date(Date.now()).toString()
      obj.creator = [{id:MongoClient.ObjectId(obj.creator),role:0}]
      try {
        let insert = await this.collection.insertOne(obj)
        console.log(insert)
        return insert;
      } catch(e) {
        console.log(e)
        return e
      }
    } else {
      return {authErro:"you don't have permission to create a brand"}
    }
  }

  // createUser() Create a user in the users collection
  async createUser(userObj) {
    console.log(userObj)
    let findAccount = await this.collection.findOne({email: userObj.email})
    if(findAccount){
       // return res.status(422).json({ errors: [{ user: "email already exists" }] });
       return { errors: [{ user: "email already exists" }] };
    }else {
      const userSave = {
        name: userObj.name,
        email: userObj.email,
        password: userObj.password,
      };
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(userSave.password, salt)
      console.log(hashedPassword)
      userSave.password = hashedPassword;
      await this.collection.insertOne(userSave);
      return { userSave };
    }
  }

  // createAccount() Create an account in the players collection
  async createAccount(username) {
    if (
      this.collection != null &&
      (await this.collection.findOne({ username: username })) == null
    ) {
      let newAccount = {
        username: username,
        games: [],
      };
      this.collection.insertOne(newAccount);
      return { username: username };
    }
  }

  async signIn(userObj) {
    const user = await this.collection.findOne({ email: userObj.email })
    if (!user) {
          return {errors: [{ user: "not found" }]};
        } else {
          console.log(user)
          // return user
          const isMatch = await bcrypt.compare(userObj.password, user.password)
          if (!isMatch) {
            return {errors: [{ password:"incorrect" }]};
          }

          const access_token = jwt.sign({payload: { email:user.email, id: user._id, duration: 3600}}, process.env.TOKEN_SECRET);
          // return 'yes'
          // console.log(access_token)

          /*let access_token = createJWT(
            user.email,
            user._id,
            3600
          );*/
          var decoded = await jwt.verify(access_token, process.env.TOKEN_SECRET)
          if (decoded) {
            axios.defaults.headers.common["Authorization"] = 'Bearer ' + access_token;
            return {access_token: access_token}
          } else {
            return {error:"something went wrong"}
          }
        }
  }

  // readAccount() Find account in players collection
  async readAccount(username) {
    if (this.collection != null) {
      let findAccount = await this.collection.findOne({ username: username });
      return findAccount;
    }
  }

  async addGame(username, newPin) {
    if (this.collection != null) {
      let addPin = await this.collection.updateOne(
        { username: username },
        { $push: { games: newPin } }
      );
      if (addPin.modifiedCount > 0) {
        return { added: newPin };
      }
    }
  }

  // Collection: "games"

  // createGame() Create a new game
  async createGame(game) {
    if (
      this.collection != null &&
      (await this.collection.findOne({ pin: game.pin })) == null
    ) {
      let newGame = {
        course: game.course,
        pin: game.pin,
        holes: game.holes,
        date: Date(),
        scorecard: game.scorecard,
        players: [],
      };
      await this.collection.insertOne(newGame);
      // Respond with created game
      return newGame;
    }
  }

  // createCourse() Create a new course
  async createCourse(course) {
    if (
      this.collection != null &&
      (await this.collection.findOne({ cid: course.cid })) == null
    ) {
      let newCourse = {
        name: course.name,
        url: course.url,
        cid: course.cid,
        date: Date(),
        scorecardHtml: course.scorecardHtml,
        address: {
          street: course.address.street,
          cityState: course.address.cityState,
          zip: course.address.zip,
        },
      };
      await this.collection.insertOne(newCourse);
      // Respond with created course
      return newCourse;
    }
  }

  // findOne() Retrieve course info
  async findMyCourse(cid) {
    if (this.collection != null) {
      const findCourse = await this.collection.findOne({
        cid: cid,
      });
      return findCourse;
    }
  }

  async findMyCourseByName(name) {
    if (this.collection != null) {
      const findCourse = await this.collection.find({
        name: {'$regex' : '.*' + name + '.*', '$options' : 'i'},
      }).toArray();
      return findCourse;
    }
  }

  async insertCourses(entries) {
    if (this.collection != null) {
      const courses = await this.collection.insertMany(entries, {ordered : false });
      return courses;
    }
  }

  async findCourses() {
    if (this.collection != null) {
      const findCourse = await this.collection.find().toArray();
      return findCourse;
    }
  }

  async updateCourse(courseDetails) {
    console.log(courseDetails.cid)
    if (this.collection != null) {
      /*const addToCourse = await this.collection.updateOne(
        { name: courseDetails.name },
        courseDetails
      );*/
      const addToCourse = await this.collection.updateOne({name:courseDetails.name}, {$set:courseDetails})
      return addToCourse;
    }
  }

  async updateHandicap(username,handicap) {
    if (this.collection != null) {
      const changeHandicap = await this.collection.updateOne({username:username}, {$set:{handicap:Number(Math.round(handicap))}})
      return changeHandicap
    }
  }

  // readOne() Retrieve a game based on the pin number
  async readOne(pin) {
    if (this.collection != null) {
      const findGame = await this.collection.findOne({
        pin: pin,
      });
      return findGame;
    }
  }

  // readMany() Retrieve multiple games based on an array of pins
  async readMany(pinArray) {
    if (this.collection != null) {
      let playerGames = [];
      const searchGames = this.collection.find({
        pin: { $in: pinArray },
      });
      await searchGames.sort({ date: -1 }).forEach((document) => {
        playerGames.push(document);
      });
      return { games: playerGames };
    }
  }

  // updateOne() Add player score within game
  async updateOne(pin, playerData,holeCount) {
    if (this.collection != null) {
      let updateGame = await this.collection.updateOne(
        { pin: pin },
        { $push: { players: playerData }, $set: {holes: Number(holeCount)} }
      );
      // If the update was successful, return the data
      if (updateGame.modifiedCount > 0) {
        return playerData;
      }
    }
  }

  async updateContent(id,content) {
    let updateContent = await this.collection.updateOne(
      {_id:MongoClient.ObjectId(id)},
      {$set:{summary:content}}
    );
    return updateContent;
  }

  /*async addContent(content) {
    content.creator = [{id:MongoClient.ObjectId(obj.creator),role:0}]
    let newContent = await this.collection.insertOne(content);
    return newContent
  }*/

  async getBrands(id) {
    let brands = this.collection.find({ creator: { $elemMatch: {id:MongoClient.ObjectId(id)} }}).toArray()
    // creator: { $elemMatch: {id:MongoClient.ObjectId(id)} }
    return brands
  }

  async getBrand(id) {
    let brands = this.collection.find({ _id:MongoClient.ObjectId(id)}).toArray()
    return brands
  }

  async getJob(id) {
    let job = this.collection.find({ _id:MongoClient.ObjectId(id)}).toArray()
    return job
  }

  async getJobs(id) {
    let job = this.collection.find({ creator:id}).toArray()
    return job
  }

  async startJob(obj) {
    let job = this.collection.insertOne(obj)
    return job
  }

  async getArticleSummary(article) {
    if (article.content) {
      article.content = article.content.replace( /(<([^>]+)>)/ig, '').trim()

      var patterns = [
        {
          name: 'nounPhrase',
          patterns: [ '[PROPN] [|PROPN] [|PROPN] [|PROPN]' ]
        },
        {
          name: 'nounPhrase',
          patterns: [ '[PROPN] [ADJ|PROPN] [|PROPN] [|PROPN]' ]
        },
          {
          name: 'nounPhrase',
          patterns: [ '[PROPN|ADJ] [PROPN]' ]
        },
        {
          name: 'nounPhrase',
          patterns: [ '[PROPN] [CARDINAL]' ]
        },
        /*{
          name: 'simpleADJ',
          patterns: [ '[ADJ]' ]
        },*/
        { name: 'adjectiveNounPair', patterns: [ 'ADJ NOUN' ] }
      ];

      var patternCount = nlp.learnCustomEntities( patterns, { matchValue: false, useEntity: true, usePOS: true } );

      const articleDoc = nlp.readDoc(article.content);
      var tfObj = articleDoc.tokens().out(its.normal, as.bow)
      // console.log(tfObj)
      const bmYo = BM25Vectorizer()
      articleDoc.sentences().out().forEach( (docs) =>  bmYo.learn(
      // corpus.forEach( (docs) =>  bm25.learn(
              nlp.readDoc(docs)
              .tokens()
              .out(its.normal)
              )
          );
      // let terms = bmYo.vectorOf(nlp.readDoc(article.content).tokens().out(its.idf));

      var idfObj = {}
      let terms = bmYo.out(its.idf);
      // console.log(terms)
      for (let term in terms) {
          // console.log(`${terms[term][0]} =>  ${terms[term][1]}`)
          idfObj[terms[term][0]] = terms[term][1]
      }
      // console.log(idfObj)
      // getUniqueTerms()
          // console.log(bm25.out(its.idf))
          const sentenceCount = Math.round(articleDoc.sentences().out().length*.2) > 2 ? Math.round(articleDoc.sentences().out().length*.2) : 3
          // console.log(Math.round(articleDoc.sentences().out().length*.2))
          SummaryTool.getSortedSentences(article.content,sentenceCount,function(err, summary) {
            if(err) {
              console.log("err is ", err)
              resolve('Error')
            }
            else {
              var comps = {}
              // console.log(summary)
              summary = [...new Set(summary)];
              // console.log(summary)
              let content = []
            for (const sentence of summary) {
              // console.log(sentence)
              let contentObj = {}
              contentObj.body = sentence
              let sentenceArray = []
              let phrases = nlp.readDoc(sentence).customEntities().out(its.detail)
              for (const phrase of phrases) {
                // console.log(phrases)
                var words = phrase.value.split(' ')
                var tdIdfObj = {}
                var totalIdf = 0
                let theWord = ''
                let wordObj = {}
                for (var word of words) {
                  // console.log(word)
                  theWord += word + ' '
                  for (const property in tfObj) {
                    if (property == word.toLowerCase()) {
                      var TF = tfObj[property]
                      // console.log(`${property}: ${tfObj[property]}`)
                    }
                  }

                  for (const property in idfObj) {
                    if (property == word.toLowerCase()) {
                      var IDF = idfObj[property]
                      // console.log(`${property}: ${idf[property]}`)
                    }
                  }
                  totalIdf += TF*IDF // .push(TF*IDF)
                  // console.log(totalIdf)
                }
                wordObj.word = theWord.trim()
                wordObj.TDIDF = totalIdf
                // console.log(wordObj)
                // console.log(totalIdf)
                sentenceArray.push(wordObj)
              }
              // console.log(sentenceArray)
              contentObj.tags = sentenceArray
              content.push(contentObj)
            }
            article.summary = content
            console.log(article)
            return article
              // resolve(summary)
            }
          })
      }
  }

  close() {
    if (this.connection != null) {
      this.connection.close();
    }
  }
}
