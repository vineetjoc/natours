class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const reqObj = { ...this.queryString };
    // console.log(reqQuery);
    //FILTETRING
    const excludeFields = ['sort', 'page', 'limit', 'fields'];
    excludeFields.forEach((el) => delete reqObj[el]);
    let reqQuery = JSON.stringify(reqObj);
    //ADVANCE FILTERING
    reqQuery = reqQuery.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(reqQuery));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;
      sortBy = sortBy.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    //pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    // if (skip >= (await Tour.countDocuments())) throw new Error();
    return this;
  }
}
module.exports = ApiFeatures;
