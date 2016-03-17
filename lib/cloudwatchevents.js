var Aws = require('aws-sdk')
var SETTINGS = require('./settings.js').constants
var cloudwatchevents = new Aws.CloudWatchEvents({region: SETTINGS.REGION})

// --------------------------------------
//       Event Deploy Aux Funtion
// --------------------------------------
exports.getRuleByName => (ruleName){
  return new Promise((resolve, reject) => {
    exports.listRules('').then((rules) => {
      rules.forEach((rule) => {
        if(rule.Name == ruleName)
          resolve(rule)
      })
exports.purgeRules = () => {
  return exports.listRules(SETTINGS.PROJECT_PREFIX)
    .then((rulesList) => {
      console.log(rulesList.Rules)
      return Promise.all(rulesList.Rules.map((rule) =>
        exports.purgeTargets(rule.Name)
        .then(exports.deleteRule(rule.Name))
      ))
    })
    reject('NoRuleFoundException')
  })
}

exports.deployRule => (Rule) {
  return exports.getRuleByName(Rule.Name)
          .then(exports.deleteRule(Rule.Name))
          .then(exports.putRule(Rule))
exports.purgeTargets = (ruleName) => {
  return exports.listTargetsByRule(ruleName)
    .then((targets) => {
      var removeTargets = {}
      removeTargets.Ids = targets.Targets.map((target) => target.Id)
      removeTargets.Rule = ruleName
      return exports.removeTargets(removeTargets)
    })
}

// --------------------------------------
//     Promisified CloudWatchEvents
// --------------------------------------
exports.putRule => (Rule){
  var params = {
    Name: Rule.Name,
    Description: Rule.Description,
    EventPattern: Rule.EventPattern,
    RoleArn: Rule.RoleArn,
    ScheduleExpression: Rule.ScheduleExpression,
    State: 'ENABLED'
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

