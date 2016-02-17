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
