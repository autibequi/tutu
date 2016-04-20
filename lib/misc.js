'use strict'

// Merge two objects, if obj2 have a key that obj1
// dont have, overwrite it, else, create it with the
// value of obj2.
// Now accepts any number of objects! :D
exports.mergeObjects = function() {
  var mergedObject = {}
  for (var i = 0; i < arguments.length; i++) {
    for (key in arguments[i])
      mergedObject[key] = arguments[i][key]
  }
  return mergedObject
}

// this functions map an array and run a function of it
exports.mapPromises = (object, key, callback) => {
  return new Promise((resolve, reject) => {
    var promiseValues = []
    let promise = Promise.resolve()

    // loop and create a chain of promises
    object[key].forEach((item) => {
      promise = promise.then(() => callback(item, object))
      .then((data) => promiseValues.push(data))
    })

    // return an promise to an array of results
    promise.then(() => {
      object[key] = promiseValues
      resolve(object)
    })
    .catch((err) => reject(err))
  })
}
