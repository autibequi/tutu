'use strict'

// Merge two objects, if obj2 have a key that obj1
// dont have, overwrite it, else, create it with the
// value of obj2.
// Now accepts any number of objects! :D
exports.mergeObjects = function(...args) {
  let mergedObject = {}
  args.forEach((item) => {
    for (key in item)
      if (item.hasOwnProperty(key))
        mergedObject[key] = item[key]
  })
  return mergedObject
}

// this functions map an array and run a function of it
exports.mapPromises = (array, callback) => {
  return new Promise((resolve, reject) => {
    var promiseValues = []
    let promise = Promise.resolve()

    // loop and create a chain of promises
    array.forEach((item) => {
      promise = promise.then(() => callback(item))
      .then((data) => promiseValues.push(data))
    })

    // return an promise to an array of results
    promise.then(() => {
      resolve(promiseValues)
    })
    .catch((err) => reject(err))
  })
}
