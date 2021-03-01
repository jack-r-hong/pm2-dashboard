const ControllerBase = require('./controllerBase');
const ExampleModels = require('../models/exampleModels');
const exampleModels = new ExampleModels;
class ExampleController extends ControllerBase {

    example(){
        this.send(exampleModels.data);
    }

}

module.exports = ExampleController;