var aux = require('./aux.js')
var lambda = require('./lambda.js')
var dataProcess = require('./dataProcess.js')
var deployer = require('./deploy.js')
var cloudwatchevents = require('./AWS/cloudwatchevents.js')

// --------------------------------------
//       Event Deploy Aux Funtion
// --------------------------------------
    .then((rulesList) => {
      return Promise.all(rulesList.Rules.map((rule) =>
        cloudwatchevents.purgeTargets(rule.Name)
        .then(cloudwatchevents.deleteRule(rule.Name))
      ))
    })
exports.purgeRules = (prefix) => {
  console.log('Purging Rules with prefix', prefix)
  return cloudwatchevents.listRules(prefix)
}

exports.purgeTargets = (ruleName) => {
  return cloudwatchevents.listTargetsByRule(ruleName)
    .then((targets) => {
      var removeTargets = {}
      removeTargets.Ids = targets.Targets.map((target) => target.Id)
      removeTargets.Rule = ruleName
      return cloudwatchevents.removeTargets(removeTargets)
    })
}

exports.deployRule = (rule) =>
  cloudwatchevents.putRule(rule)
