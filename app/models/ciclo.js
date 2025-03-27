const mysql = require('mysql2/promise');
const connectToDatabase = require('../config/dbconfig');

class Ciclo {
    constructor(ciclo_id, año){
        this.ciclo_id = ciclo_id;
        this.año = año;
    }
}