var cloudwatchevents = require('./AWS/cloudwatchevents.js')
var logger = require('./logger.js')

// Delete all rules with a specific prefix
exports.purgeRules = (prefix) => {
  console.log('Purging Rules with prefix', prefix)
  return cloudwatchevents.listRules(prefix)
    .then((rulesList) => {
      logger.status(rulesList.Rules.length + ' Rules Found');
      Promise.all(rulesList.Rules.map(deleteRule))
    })
}

// Deploys a Rule Proxy
exports.deployRule = (rule) =>
  cloudwatchevents.putRule(rule)
      logger.status("Rule Deployed");
  logger.status('Puting Target')

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
