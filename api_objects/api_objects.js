const { expect} = require('@playwright/test')

// const KEY = 'cbfbe9459c74b47e7ff36154e638b4eb';
// const TOKEN = 'ATTA2919baf315a330c56d2b9248baf29bf5570f458d974ff0ea06f4974c532cb128FF5714F7';
const AUTH = `?key=${process.env.KEY}&token=${process.env.TOKEN}`;


let boardNamesAndIds = {};
let listNamesAndIds = {};
let cardsNamesAndIds = {};

exports.Trello = class Trello {
    constructor (request) {
        this.request = request;
    }

    async getAllBoards() {
        const allBoards = await this.request.get(`/1/members/${process.env.MEMBER}/boards${AUTH}`);
        const response = await allBoards.json();
        for (let i=0; i<response.length; i++) {
            boardNamesAndIds[response[i].name] = response[i].id
        }
    }

    async getListsOnABoard(board) {
        await this.getAllBoards();
        const idBoard = boardNamesAndIds[board];
        const allLists = await this.request.get(`/1/boards/${idBoard}/lists${AUTH}`);
        const response = await allLists.json();
        for (let i=0; i<response.length; i++) {
            listNamesAndIds[response[i].name] = response[i].id
        }
    }

    async getAllCardsOnAList(listName) {
        const idList = listNamesAndIds[listName];
        const allCards = await this.request.get(`/1/lists/${idList}/cards${AUTH}`);
        const response = await allCards.json();
        for (let i=0; i<response.length; i++) {
            cardsNamesAndIds[response[i].name] = response[i].id
        }
    }

    async createBoard(name) {
        const newBoard = await this.request.post(`/1/boards/${AUTH}`, {
            data: {
                name: name,
            }
        });
        expect (newBoard.status()).toBe(200);
   }

    async createList(name, boardName) {
        await this.getAllBoards();
        const idBoard = boardNamesAndIds[boardName];
        const newList = await this.request.post(`/1/lists${AUTH}`, {
            data: {
                name: name,
                idBoard: idBoard
            }
        });
        const response = await newList.json();
        let listName = await response.name;
        let isClosed = await response.closed;
        let board = await response.idBoard;
        expect(newList.status()).toBe(200);
        expect(listName).toBe(name);
        expect(isClosed).toBe(false);
        expect(board).toBe(idBoard)
    }

    async createCard(name, listName, boardName) {
        await this.getListsOnABoard(boardName);
        const idList = listNamesAndIds[listName];
        const newCard = await this.request.post(`/1/cards${AUTH}`, {
            data: {
                name: name,
                idList: idList
            }
        })
        const response = await newCard.json();
        let cardName = await response.name;
        let isClosed = await response.closed;
        let list = await response.idList;
        let votes = await response.badges.votes;
        let attachments = await response.badges.attachments;
        expect(newCard.status()).toBe(200);
        expect(cardName).toBe(name);
        expect(isClosed).toBe(false);
        expect(list).toBe(idList);
        expect(votes).toBe(0);
        expect(attachments).toBe(0)
    }

    async moveCard(cardName, currentList, newList, boardName) {
        await this.getListsOnABoard(boardName);
        await this.getAllCardsOnAList(currentList);
        const idCard = cardsNamesAndIds[cardName];
        const idList = listNamesAndIds[newList];
        const movedCard = await this.request.put(`/1/cards/${idCard}${AUTH}`, {
            data: {
                idList: idList
            }
        });
        const response = await movedCard.json();
        const list = await response.idList;
        const name = await response.name;
        expect (movedCard.status()).toBe(200);
        expect(name).toBe(cardName);
        expect (list).toBe(idList)

    }

    async deleteAllBoards() {
        await this.getAllBoards();
        let boardIds = Object.values(boardNamesAndIds);
        for (let i=0; i<boardIds.length; i++) {
            let idBoard = boardIds[i];
            const deletedBoard = await this.request.delete(`/1/boards/${idBoard}${AUTH}`);
            expect(deletedBoard.status()).toBe(200)
        } 
    }
}