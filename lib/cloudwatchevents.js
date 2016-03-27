var cloudwatchevents = require('./AWS/cloudwatchevents.js')
var logger = require('./logger.js')

// Delete all rules with a specific prefix
exports.purgeRules = (prefix) => {
  logger.status('Purging Rules with prefix', prefix)
  return cloudwatchevents.listRules(prefix)
    .then((rulesList) => {
      logger.status(rulesList.Rules.length + ' Rules Found');
      return Promise.all(rulesList.Rules.map(deleteRule))
    })
}

// Deploys a Rule Proxy
exports.deployRule = (rule) => {
  logger.status("Deploying Rule")
  return cloudwatchevents.putRule(rule)
}

// Deploys a Rule Proxy
exports.putTarget = (target) => {
  logger.status("Putting Target Rule")
  var rule = {

  }
  return cloudwatchevents.putRule(rule)
}

// Delete a Rule
// It first list all targets of a rule and then removes all targets
// Before deleting the rule itself.
deleteRule = (rule) => {
  logger.status("Deleting a Rule " + rule.Name)
  return cloudwatchevents.listTargetsByRule(rule.Name)
    .then((targets) => {
      if (targets.Targets.length == 0)
        return Promise.resolve()

      var removeTargets = {
        Ids: targets.Targets.map((target) => target.Id),
        Rule: rule.Name
      }
      return cloudwatchevents.removeTargets(removeTargets)
    })
    .then(cloudwatchevents.deleteRule(rule.Name))
}
