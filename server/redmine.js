const request = require('superagent')

const REDMINE_TOKEN = process.env.REDMINE_TOKEN
const REDMINE_INTERNAL = process.env.REDMINE_INTERNAL

const getVersions = () => {
  return request.get(REDMINE_INTERNAL + '/projects/root/versions.json')
    .auth(REDMINE_TOKEN, '')
    .type('json')
}

const getIssues = (qs) => {
  return request.get(REDMINE_INTERNAL + '/issues.json')
    .auth(process.env.REDMINE_TOKEN, '')
    .query(qs)
}

const updateIssue = async (qs, idIssue) => {
  await request.put(REDMINE_INTERNAL + '/issues/' + idIssue + '.json')
    .auth(REDMINE_TOKEN, '')
    .send({issue: qs})
    .type('json')
}

module.exports = {
  getVersions,
  getIssues,
  updateIssue
}
