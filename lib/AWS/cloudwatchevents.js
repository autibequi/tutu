'use strict'
let AWS = require('aws-sdk')
var SETTINGS = require('../settings.js')
let cloudwatchevents = new AWS.CloudWatchEvents({region: SETTINGS.REGION})

// --------------------------------------
//     Promisified CloudWatchEvents
// --------------------------------------
exports.putRule = (Rule) => {
  let params = {
    Name: SETTINGS.PROJECT_PREFIX + Rule.Name,
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
  let params = {
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
  let params = {
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
  let params = {
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
  let params = {
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
  let params = {
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
