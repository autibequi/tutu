var Aws = require('aws-sdk')
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
    })
    reject('NoRuleFoundException')
  })
}

exports.deployRule => (Rule) {
  return exports.getRuleByName(Rule.Name)
          .then(exports.deleteRule(Rule.Name))
          .then(exports.putRule(Rule))
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

exports.listRules => (NamePrefix){
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

exports.deleteRule => (ruleName){
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

