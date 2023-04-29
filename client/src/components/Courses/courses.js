import axios from "axios";
import cheerio from "cheerio";
import Db from "../db";
import Course from "../Types/Course";

const db = new Db();
const handler = async (req, res) => {
  //   console.log(req.query);

  if (req.method === "GET") {
    try {
      let resp = await axios.get(`${process.env.URL}/api/v1/zip?zip=${req.query.zip}`);
      if (resp.data.error) {
        // db.close();

        return res.json({ error: resp.data });
      }
      // console.log(resp.data);
      let locationData = resp.data.locationData[0];
      // console.log(locationData);

      db.getByZip(locationData.zip_code, async (err, rows) => {
        if (err) {
          console.error(err.message);
          // db.close();

          return res.json({ error: err });
        }

        let courses: Course[] = [];
        // console.log(rows.rows);

        if (rows.rowCount > 0) {
          console.log("No need to hit golflink");
          //   console.log(rows);
          // db.close();

          return res.json({
            message: "Got courses from DB",
            courses: rows.rows,
            locationData,
          });
        } else {
          console.log("Need to hit golflink");
          let { data } = await axios({
            method: "GET",
            url: "https://www.golflink.com/golf-courses/course-directory.aspx",
            params: {
              t: `${locationData.city}, ${locationData.state}`,
              lat: locationData.lat,
              lon: locationData.lng,
              within: "50",
            },
          });

          const $ = cheerio.load(data);
          let elements = $("#search_result_container");
          elements
            .find("#search_result > div > div.course-heading > div > span.courseTitleKey > span:nth-child(1) > a")
            .each((i, element) => {
              const $element = $(element);
              let ele = $element.attr("href");
              let urlName = ele !== undefined ? ele.trim() : "";
              let courseName = $element.text().trim();
              let course: Course = {
                name: courseName,
                slug: urlName,
              };
              axios.post(`${process.env.URL}/api/v1/courses`, {
                slug: urlName,
                zip: locationData.zip_code,
              });
              courses.push(course);
            });
          // console.log(courses);
          // db.close();

          return res.json({
            message: "Got courses from GolfLink",
            courses: courses,
            locationData,
          });
        }
      });
    } catch (err) {
      console.log(err);
      db.close();

      return res.json({ error: err });
    }
  } else {
    console.log(req.body.slug);
    try {
      db.getByCourse(req.body.slug, async (err, data) => {
        if (err) {
          console.error(err.message);
          // db.close();

          return res.json({ error: err });
        }

        // console.log(data.rows);
        if (data.rowCount > 0) {
          // db.close();

          return res.json({ message: "Get course info from db", course: data.rows });
        } else {
          let { data } = await axios.get(`https://www.golflink.com${req.body.slug}`);
          //   console.log(data);

          const $ = cheerio.load(data);
          let og = $("head > meta[property='og:url']").attr("content");
          let dbID = og !== undefined ? Number(og.split("=")[1]) : NaN;
          //   console.log(dbID);
          let name = $(".courseDetailH1").text().trim();
          let url = $(".popup.web-url").text().trim();

          let scorecardUrl = `https://www.golflink.com/golf-courses/popups/scorecard.aspx?c=${dbID}`;
          let scorecard = await (await axios.get(scorecardUrl)).data;
          //   console.log(scorecard);
          const $$ = cheerio.load(scorecard);
          let table: string = "";
          if ($$("#body").children().length > 0) {
            let html = $$(".scorecardtable").html();
            table = html !== null ? html.trim() : "";

            // console.log(table);
          } else {
            table = "Error reading scorecard";
          }

          let info = {
            name: name,
            slug: req.body.slug,
            url: url,
            zip: Number(req.body.zip),
            dbID: dbID,
            scorecardUrl: scorecardUrl,
            scorecardHtml: table,
          };
          // console.log(info);
          db.insertCourse(info, (err) => {
            if (err) {
              console.error(err.message);
              // db.close();

              return err;
            }
            // console.log(rows.rows);
          });
          // db.close();

          return res.json({
            message: "Get course info from golflink",
            course: info,
          });
        }
      });
    } catch (error) {
      db.close();
      res.json({ error: error });
    }
  }
};

export default handler;
