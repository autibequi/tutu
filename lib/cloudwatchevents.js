'use strict'
let cloudwatchevents = require('./AWS/cloudwatchevents.js')
let logger = require('./logger.js')

// Delete all rules with a specific prefix
exports.purgeRules = (prefix) => {
  logger.status('Purging Rules with prefix', prefix)
  return cloudwatchevents.listRules(prefix)
    .then((rulesList) => {
      logger.status(rulesList.Rules.length + ' Rules Found');
      console.log(rulesList);
      return Promise.all(rulesList.Rules.map(deleteRule))
    })
}

// Deploys a Rule Proxy
exports.deployRule = (resource) => {
  logger.status("Deploying Rule " + resource.CloudwatchEvents.Name)
  return cloudwatchevents.putRule(resource.CloudwatchEvents)
}

// Deploys a Rule Proxy
exports.deployTarget = (resource) => {
  logger.status("Putting Target Rule")
  let target = {
    Rule: resource.CloudwatchEvents.RuleName,
    Targets: [
      {
        Arn: resource.lambdaURI,
        Id: resource.Path,
      }
    ]
  }
  return cloudwatchevents.putTarget(target)
}

// Delete a Rule
// It first list all targets of a rule and then removes all targets
// Before deleting the rule itself.
let deleteRule = (rule) => {
  logger.status("Deleting a Rule " + rule.Name)
  return cloudwatchevents.listTargetsByRule(rule.Name)
    .then((targets) => {
      logger.status(targets.Targets.length + ' Targets Found');
      if (targets.Targets.length == 0)
        return Promise.resolve()

      let removeTargets = {
        Ids: targets.Targets.map((target) => target.Id),
        Rule: rule.Name
      }

      logger.status("Removing targets from: " + rule.Name)
      return cloudwatchevents.removeTargets(removeTargets)
    })
    .then(cloudwatchevents.deleteRule(rule.Name))
}
