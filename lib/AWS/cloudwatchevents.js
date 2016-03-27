var AWS = require('aws-sdk')
var SETTINGS = require('../settings.js')
var cloudwatchevents = new AWS.CloudWatchEvents({region: SETTINGS.REGION})

// --------------------------------------
//     Promisified CloudWatchEvents
// --------------------------------------
exports.putRule = (Rule) => {
  var params = {
    Name: Rule.Name,
    // Description: Rule.Description,
    // EventPattern: Rule.EventPattern,
    // RoleArn: Rule.RoleArn,
    ScheduleExpression: Rule.ScheduleExpression,
    // State: 'ENABLED'
  }

  return new Promise((resolve, reject) =>
      cloudwatchevents.putRule(params,
        (err, data) => {
          if (err)
            reject(err)
          else
            resolve(data)
        })
      )
}

exports.listRules = (NamePrefix) => {
  var params = {
    NamePrefix: NamePrefix,
  }

  return new Promise((resolve, reject) =>
      cloudwatchevents.listRules(params,
        (err, data) => {
          if (err)
            reject(err)
          else
            resolve(data)
      })
    )
}

exports.listTargetsByRule = (ruleName) => {
  var params = {
    Rule: ruleName,
  }
  return new Promise((resolve, reject) =>
      cloudwatchevents.listTargetsByRule(params,
        (err, data) => {
          if (err)
            reject(err)
          else
            resolve(data)
      })
    )
}

exports.removeTargets = (removeTargets) => {
  var params = {
    Ids: removeTargets.Ids,
    Rule: removeTargets.Rule,
  }
  console.log(params)
  return new Promise((resolve, reject) =>
      cloudwatchevents.removeTargets(params,
        (err, data) => {
          if (err)
            reject(err)
          else
            resolve(data)
      })
    )
}

exports.deleteRule = (ruleName) => {
  var params = {
    Name: ruleName,
  }

  return new Promise((resolve, reject) =>
      cloudwatchevents.deleteRule(params,
        (err, data) => {
          if (err)
            reject(err)
          else
            resolve(data)
      })
    )
}

exports.putTarget = (target) => {
  var params = {
    Rule: target.Rule.name,
    Targets: [
      {
        Arn: target.Arn,
        Id: target.Id,
      }
    ]
  }

  return new Promise((resolve, reject) =>
    cloudwatchevents.putTargets(params,
      (err, data) => {
        if (err)
          reject(err)
        else
          resolve(data)
    })
  )
}
