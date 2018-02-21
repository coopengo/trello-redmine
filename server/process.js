const _ = require('underscore')

const config = require('./config')
const redmine = require('./redmine')
const trello = require('./trello')

const BOARDS = ['Done', 'Review', 'In Progress', 'To Do']

const createCards = async (issues, lists, labels) => {
  const promises = issues.map(issue => {
    const desc = [
      issue.priority.name,
      issue.tracker.name
    ].join(',').concat('\n', issue.description)
    const qs = {
      name: `#${issue.id} ${issue.subject}`,
      desc,
      urlSource: `suptest.coopengo.com/issues/${issue.id}`,
      idList: lists[3],
      idLabels: labels[issue.id]
    }
    if (!qs.idLabels && issue.parent) {
      qs.idLabels = labels[issue.parent.id]
    }
    switch (issue.status.id) {
      case 2:
        qs.idList = lists[2]
        break
      case 7:
        qs.idList = lists[1]
        break
      case 5:
        qs.idList = lists[0]
        break
    }
    return trello.createCard(qs)
  })
  await Promise.all(promises)
}

const createLabels = async (idBoard, issues, color) => {
  const labels = {}
  const len = color.length
  for (var i = 0; i < issues.length; i++) {
    const rq = await trello.createLabel(issues[i].id, idBoard, color[i % len])
    labels[issues[i].id] = rq.body.id
  }
  return labels
}

const createLists = async (idBoard) => {
  const lists = []
  for (const name of BOARDS) {
    const rq = await trello.createList(idBoard, name)
    lists.push(rq.body.id)
  }
  return lists
}

const getIssues = async (boardName, statusId) => {
  let rq = await redmine.getVersions()
  let version = rq.body.versions.find(v => {
    return v.name === boardName
  })
  if (!version) return undefined
  version = version.id
  rq = await redmine.getIssues({
    fixed_version_id: version,
    status_id: statusId
  })
  return rq.body.issues
}

const loadIssue = async (query) => {
  let cards = query.issues.split(',').map(c => c.split(':'))
  cards = _.object(cards)
  const idBoard = query.idBoard
  const lists = {
    1: query['To Do'],
    2: query['In Progress'],
    7: query['Review'],
    5: query['Done']
  }
  const issues = await getIssues(query.boardName, '*')
  const newIssues = []

  const promises = issues.map(i => {
    if (cards[i.id]) {
      return trello.updateCard(cards[i.id], {idList: lists[i.status.id]})
    } else {
      newIssues.push(i)
    }
  })
  await Promise.all(promises)

  const features = newIssues.filter(i => { return i.tracker.id === 2 })
  const bugs = newIssues.filter(i => { return i.tracker.id === 1 })
  const existingLabels = await trello.getLabels(idBoard)
  const labels = await createLabels(idBoard, features, config.labelsFeatureColor)
  Object.assign(labels, await createLabels(idBoard, bugs, config.labelsBugColor))
  existingLabels.body.filter(l => { return l.name in cards }).forEach(l => { labels[l.name] = l.id })

  const listsTab = Object.values(lists).reverse()

  await createCards(newIssues, listsTab, labels)
}

const saveIssue = async (data) => {
  Object.entries(data).forEach(v => {
    v[1].split(',').forEach(issueId => {
      redmine.updateIssue({status_id: config.cardToStatus[v[0]]}, issueId)
    })
  })
}

const setupBoard = async (idBoard, boardName) => {
  if (!idBoard && !boardName) return
  const lists = await createLists(idBoard)
  const issues = await getIssues(boardName, '*')
  const features = issues.filter(i => { return i.tracker.id === 2 })
  const bugs = issues.filter(i => { return i.tracker.id === 1 })
  const labels = await createLabels(idBoard, features, config.labelsFeatureColor)
  Object.assign(labels, await createLabels(idBoard, bugs, config.labelsBugColor))
  console.log(labels)
  if (issues) {
    await createCards(issues, lists, labels)
  }
}

const updateIssue = async (body) => {
  body = JSON.parse(body)
  await trello.updateCard(body.card, body.qs)
}

module.exports = {
  loadIssue,
  saveIssue,
  setupBoard,
  updateIssue
}
