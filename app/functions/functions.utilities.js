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

exports.getDateTimezone = function (unixTimeStamp) {
    let date = new Date(unixTimeStamp);
    return (date.getFullYear() + '-' + (
        '0' + (
            date.getMonth() + 1
        )
    ).slice(-2) + '-' + (
        '0' + date.getDate()
    ).slice(-2) + 'T' + (
        '0' + date.getHours()
    ).slice(-2) + ':' + (
        '0' + date.getMinutes()
    ).slice(-2) + ':00')
}

exports.getDateTimeTimestamp = function (refrechTimeStamp) {
    let dates = new Date(refrechTimeStamp);
    return ('0' + dates.getDate()).slice(-2) + '/' + (
        '0' + (
            dates.getMonth() + 1
        )
    ).slice(-2) + '/' + dates.getFullYear() + ' ' + (
        '0' + dates.getHours()
    ).slice(-2) + ':' + (
        '0' + dates.getMinutes()
    ).slice(-2);
}

// Séparateur de millier universel
exports.numStr = function (a, b) {
    a = '' + a;
    b = b || ' ';
    var c = '',
        d = 0;
    while (a.match(/^0[0-9]/)) {
        a = a.substr(1);
    }
    for (var i = a.length - 1; i >= 0; i--) {
        c = (d != 0 && d % 3 == 0)
            ? a[i] + b + c
            : a[i] + c;
        d++;
    }
    return c;
}

// Convertie les Timestamp campagne startdate et enddate / date du jour
 exports.getDateTimeFromTimestamp = function (unixTimeStamp) {
    let date = new Date(unixTimeStamp);
    return ('0' + date.getDate()).slice(-2) + '/' + (
        '0' + (
            date.getMonth() + 1
        )
    ).slice(-2) + '/' + date.getFullYear();
}


//Function to get difference between 2 arrays
//For every element of arrayA check if present in arrayB, if not, push in result array

exports.arrayDiff = function (arrayA, arrayB){
    var result = [];
    for (var i=0; i < arrayA.length; i++) {
      if ( arrayB.indexOf(arrayA[i]) <= -1 ) { 
          result.push(arrayA[i]);
        }
    }
    return result;
}