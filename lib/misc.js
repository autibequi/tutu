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

exports.holderFoo = (holder, callback, item, object) => {
  return callback(item, object)
    .then((result) => {
      holder.push(result)
      return Promise.resolve(holder)
    })
}

// this functions map an array and run a function of it
exports.mapPromises = (object, key, callback) => {
  return new Promise((resolve, reject) => {
    let promiseChain = Promise.resolve([])
    var object_copy = JSON.parse(JSON.stringify(object));

    // loop and create a chain of promises
    object_copy[key].forEach((item) => {
      promiseChain = promiseChain.then((value) => exports.holderFoo(value, callback, item, object_copy))
    })

    // return an promise to an array of results
    resolve(promiseChain.then((holder) => {
      object_copy[key] = holder
      return Promise.resolve(object_copy)
    }))
  })
}
