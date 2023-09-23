import { Sequelize } from 'sequelize-typescript';
import 'dotenv/config';

class PostgresSQL {
  private sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize({
      database: process.env['DB_NAME'] || 'postgres',
      dialect: 'postgres',
      username: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'] || 'postgres',
      storage: ':memory:',
      models: [__dirname + '/models'],
    });
  }

  get connection() {
    return this.sequelize;
  }
}

export default PostgresSQL;
