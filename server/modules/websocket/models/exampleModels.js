const ModelBase = require('./modelBase');

class ExampleModels extends ModelBase{
    data(){     
        return _temporaryData.example.data      
    }
}
module.exports = ExampleModels;