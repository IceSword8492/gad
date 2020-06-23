import sqlite from 'sqlite-async'

export default class Database {
    static db;

    static async init() {
        db = await sqlite.open('./database/main.db');
    }
};
