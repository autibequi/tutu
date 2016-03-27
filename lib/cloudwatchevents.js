var aux = require('./aux.js')
var lambda = require('./lambda.js')
var dataProcess = require('./dataProcess.js')
var deployer = require('./deploy.js')
var cloudwatchevents = require('./AWS/cloudwatchevents.js')

// Delete all rules with a specific prefix
exports.purgeRules = (prefix) => {
  console.log('Purging Rules with prefix', prefix)
  return cloudwatchevents.listRules(prefix)
    .then((rulesList) =>
      Promise.all(rulesList.Rules.map(deleteRule))
    )
}

// Deploys a Rule Proxy
exports.deployRule = (rule) =>
  cloudwatchevents.putRule(rule)

// Delete a Rule
// It first list all targets of a rule and then removes all targets
// Before deleting the rule itself.
deleteRule = (rule) =>
  cloudwatchevents.listTargetsByRule(ruleName)
    .then((targets) => {
      var removeTargets = {}
      removeTargets.Ids = targets.Targets.map((target) => target.Id)
      removeTargets.Rule = ruleName
      return cloudwatchevents.removeTargets(removeTargets)
    })
    .then(cloudwatchevents.deleteRule(rule.Name))
