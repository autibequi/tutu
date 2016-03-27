var cloudwatchevents = require('./AWS/cloudwatchevents.js')
var logger = require('./logger.js')

// Delete all rules with a specific prefix
exports.purgeRules = (prefix) => {
  console.log('Purging Rules with prefix', prefix)
  return cloudwatchevents.listRules(prefix)
    .then((rulesList) => {
      logger.status(rulesList.Rules.length + ' Rules Found');
      return Promise.all(rulesList.Rules.map(deleteRule))
    })
}

// Deploys a Rule Proxy
exports.deployRule = (rule) => {
  return cloudwatchevents.putRule(rule)
  logger.status("Rule Deployed")
  logger.status('Puting Target')
}

// Delete a Rule
// It first list all targets of a rule and then removes all targets
// Before deleting the rule itself.
deleteRule = (rule) =>
  cloudwatchevents.listTargetsByRule(rule.Name)
    .then((targets) => {
      var removeTargets = {}
      removeTargets.Ids = targets.Targets.map((target) => target.Id)
      removeTargets.Rule = rule.Name
      return cloudwatchevents.removeTargets(removeTargets)
    })
    .then(cloudwatchevents.deleteRule(rule.Name))
