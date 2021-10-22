const companyController = {};

const fs = require("fs");

const crypto = require("crypto"); // return required number of characters

companyController.getAllCompanies = (req, res, next) => {

  const limit = 20;
  const { page, city, sortBy, order } = req.query;
  const requestPage = parseInt(page) || 1;

  try {
    let rawData = fs.readFileSync("data.json", "utf8");
    let data = JSON.parse(rawData); //change rawData into JS object
    let result = data.companies;
    let jobData = data.jobs;
    if (city) {
      let jobInCity = jobData.filter(e => e.city === city);
      let companyJobCity = jobInCity.map(e => { return e.companyId });
      result = result.filter(e => companyJobCity.includes(e.id));
    }
    if (sortBy === "ratings") {
      let ratingList = result.map(e => {
        let companyRatings = data.ratings.filter(item => e.ratings.includes(item.id));
        let avgRatings = 0;
        companyRatings.forEach(criteria => {
          avgRatings += (criteria.workLifeBalanceRatings + criteria.payAndBenefits + criteria.jobsSecurityAndAdvancement + criteria.management + criteria.culture) / 5;
        })
        avgRatings = avgRatings / e.numOfRatings;
        return { ...e, avgRatings };
      })

      let orderedList = ratingList.sort((a, b) => {
        if (order === "desc") {
          return b.avgRatings - a.avgRatings;
        }
        return a.avgRatings - b.avgRatings;
      })
      result = orderedList.slice((requestPage - 1) * limit, requestPage * limit);
      // console.log(result.length); check result of 20 companies
    }
    result = result.slice((requestPage - 1) * limit, requestPage * limit);
    return res.status(200).send({ result });
  } catch (error) {
    next(error);
  }
};

companyController.createCompany = (req, res, next) => {
  console.log("create Company");
  const {
    name,
    benefit,
    description,
    ratings,
    jobs,
    numOfJobs,
    numOfRatings,
  } = req.body;

  const companyStructure = {
    name,
    benefit,
    description,
    ratings,
    jobs,
    numOfJobs,
    numOfRatings,
    id: crypto
      .randomBytes(Math.ceil(10 / 2))
      .toString("hex") // convert to hexadecimal format
      .slice(0, 10)
      .toUpperCase(),
  };
  try {
    const rawData = fs.readFileSync("data.json", "utf8");
    const data = JSON.parse(rawData); //change rawData into JS object
    let result = data.companies;
    result.push(companyStructure);
    data.jobs = result;
    const newData = JSON.stringify(data);
    fs.writeFileSync("data.json", newData);
    return res.status(200).send('success');
  } catch (error) {
    next(error);
  }
};

companyController.deleteCompanyById = (req, res, next) => {
  console.log("delete Company");
  try {
    const { id } = req.params;
    let rawData = fs.readFileSync("data.json", "utf8");
    let data = JSON.parse(rawData); //change rawData into JS object
    let result = data.companies.filter((e) => {
      return e.id !== id;
    });
    data.companies = result;
    const newData = JSON.stringify(data);
    fs.writeFileSync("data.json", newData);
    return res.status(200).send('successfully deleted');
  } catch (error) {
    next(error)
  }
};

companyController.updateCompanyById = (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) throw new Error("No Id received");
    let rawData = fs.readFileSync("data.json", "utf8");
    let data = JSON.parse(rawData);
    let result = data.companies;

    const update = result.map(e => {
      if (e.id === id) {
        e.enterprise = true;
      }
      return e;
    });
    data.companies = update;
    const newUpdate = JSON.stringify(data);

    fs.writeFileSync("data.json", newUpdate);

    return res.status(200).send("successfully updated");
  } catch (error) {
    next(error);
  }
};
module.exports = companyController;