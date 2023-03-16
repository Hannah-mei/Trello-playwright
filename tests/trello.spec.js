// @ts-check

const {test} = require('@playwright/test');
const { Trello } = require('../api_objects/api_objects');

test ('create a new board', async({request}) => {
    const trello = new Trello(request);
    await trello.createBoard("fun");
    await trello.createList('TODO', 'fun');
    await trello.createCard('Labz', 'TODO', 'fun');
    await trello.createList('DONE', 'fun');
    await trello.moveCard('Labz', 'TODO', 'DONE', 'fun');
    await trello.deleteAllBoards()
})

