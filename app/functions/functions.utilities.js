/*
* Teste si la valeur est vide
*/
exports.empty = function (data) {
    if (typeof(data) == 'number' || typeof(data) == 'boolean') {
        return false;
    }
    if (typeof(data) == 'undefined' || data === null) {
        return true;
    }
    if (typeof(data.length) != 'undefined') {
        return data.length == 0;
    }
    var count = 0;
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            count++;
        }
    }
    return count == 0;
}

exports.updateOrCreate = async function (model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({where});
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
        return {item, created: true};
    }
    // Found an item, update it
    const item = await model.update(newItem, {where});
    return {item, created: false};
}

