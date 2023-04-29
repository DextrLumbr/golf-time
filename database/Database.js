import MongoClient from "mongodb";

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
  async connect(collection) {
    this.connection = await MongoClient.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
    });
    // Select golf-app database
    this.database = this.connection.db("golf-app");
    // Select the collection
    this.collection = this.database.collection(collection);
  }

  // Collection: "players"

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
  async updateOne(pin, playerData) {
    if (this.collection != null) {
      let updateGame = await this.collection.updateOne(
        { pin: pin },
        { $push: { players: playerData } }
      );
      // If the update was successful, return the data
      if (updateGame.modifiedCount > 0) {
        return playerData;
      }
    }
  }

  close() {
    if (this.connection != null) {
      this.connection.close();
    }
  }
}
