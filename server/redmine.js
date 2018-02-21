const request = require('superagent')

const REDMINE_TOKEN = process.env.REDMINE_TOKEN
const config = require('./config')

const getVersions = () => {
  return request.get(config.RedmineURL + '/projects/root/versions.json')
        .auth(REDMINE_TOKEN, '')
        .type('json')
}

const getIssues = (qs) => {
  return request.get(config.RedmineURL + '/issues.json')
        .auth(process.env.REDMINE_TOKEN, '')
        .query(qs)
}

const updateIssue = async (qs, idIssue) => {
  await request.put(config.RedmineURL + '/issues/' + idIssue + '.json')
            .auth(REDMINE_TOKEN, '')
            .send({issue: qs})
            .type('json')
}

module.exports = {
  getVersions,
  getIssues,
  updateIssue
}
