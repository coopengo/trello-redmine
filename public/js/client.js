/* globals
    fetch, TrelloPowerUp
*/
var loadIssue = async function (t) {
  const lists = await t.lists('id', 'name').then(l => {
    return l
  })
  if (!lists.length) return setupBoard(t)
  const cards = await t.cards('name', 'id').then(c => {
    return c
  })
  const board = await t.board('name', 'id').then(b => {
    return b
  })
  const body = {
    boardName: board.name,
    idBoard: board.id,
    issues: cards.map(c => {
      return `${c.name.split(' ')[0].split('#')[1]}:${c.id}`
    }).join(',')
  }
  lists.forEach(l => { body[l.name] = l.id })
  fetch('../../loadIssue', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

var saveIssue = async function (t) {
  const lists = await t.lists('id', 'name').then(l => {
    return l
  })
  if (!lists.length) return
  const cards = await t.cards('name', 'idList').then(c => {
    return c
  })
  const list = {}
  lists.forEach(v => {
    list[v.id] = {
      name: v.name,
      issues: []
    }
  })
  cards.forEach(c => {
    list[c.idList].issues.push(c.name.split(' ')[0].split('#')[1])
  })
  let qs = ''
  Object.entries(list).forEach(tab => {
    if (tab[1].issues.length) {
      qs += `&${tab[1].name}=${tab[1].issues}`
    }
  })
  qs = qs.substr(1)
  fetch(`../../saveIssue?${qs}`, {method: 'POST'})
}

var setupBoard = async function (t) {
  t.board('id', 'name').then(async board => {
    await fetch(`../../launchCard?boardId=${board.id}&boardName=${board.name}`, {
      method: 'GET'
    })
  })
}

var cardBadges = async function (t) {
  let priority = await t.get('card', 'shared', 'priority').then(p => {
    return p
  })
  if (!priority) {
    const card = await t.card('desc', 'id').then(d => { return d })
    const id = card.id
    const desc = card.desc.split('\n')
    const line = desc.shift().split(',')
    fetch(`../../updateIssue`, {
      method: 'PUT',
      body: JSON.stringify({card: id, qs: {desc: desc.join('\n')}})
    })
    await t.set('card', 'shared', 'priority', line[0])
    priority = line[0]
  }
  return [{
    title: 'priority',
    text: priority
  }]
}

TrelloPowerUp.initialize({
  'board-buttons': async function (t, options) {
    return [{
      text: 'Load issues',
      callback: loadIssue
    }, {
      text: 'Save issues',
      callback: saveIssue
    }]
  },
  'card-badges': function (t, options) {
    return cardBadges(t)
  }
})
