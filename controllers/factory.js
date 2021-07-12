const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const model = await Model.findByIdAndDelete(req.params.id);
    if (!model) return next(new AppError('Cannot find doc with that ID', 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('Cannot find Doc with that ID', 404));

    res.status(201).json({
      status: 'success',
      data: {
        Data: doc,
      },
    });
  });
exports.getOne = (Model, populateObj) =>
  catchAsync(async (req, res, next) => {
    // const id = req.params.id * 1;
    let query = Model.findById(req.params.id);
    if (populateObj) query = query.populate(populateObj);

    const doc = await query;
    if (!doc) return next(new AppError('Cannot find Tour with that ID', 404));
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //execution
    //below two lines are for reviews router mounted on Tour
    let filter = {};
    if (req.params.id) filter = { tour: req.params.id };

    const apiFeature = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .limit()
      .sort()
      .pagination();

    const doc = await apiFeature.query;
    res.status(200).json({
      status: 'success',
      length: doc.length,
      data: {
        data: doc,
      },
    });
  });
