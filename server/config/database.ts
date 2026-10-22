import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
export const db = new DatabaseSync(dbPath);

export async function initDatabase() {
  // Create tables if they do not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rollNumber TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      avatar TEXT,
      targetExam TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS passages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      titleHindi TEXT NOT NULL,
      language TEXT NOT NULL,
      script TEXT,
      difficulty TEXT,
      content TEXT NOT NULL,
      wordCount INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS typing_practices (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      passageId TEXT,
      passageTitle TEXT NOT NULL,
      language TEXT NOT NULL,
      script TEXT,
      durationMinutes INTEGER NOT NULL,
      timeSpentSeconds INTEGER NOT NULL,
      grossWpm INTEGER NOT NULL,
      netWpm INTEGER NOT NULL,
      cpm INTEGER NOT NULL,
      accuracy REAL NOT NULL,
      correctWords INTEGER NOT NULL,
      incorrectWords INTEGER NOT NULL,
      correctCharacters INTEGER NOT NULL,
      incorrectCharacters INTEGER NOT NULL,
      backspaceCount INTEGER DEFAULT 0,
      totalKeystrokes INTEGER NOT NULL,
      errorDetails TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS mock_tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      titleHindi TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      topic TEXT,
      totalQuestions INTEGER NOT NULL,
      durationMinutes INTEGER NOT NULL,
      passingMarks INTEGER NOT NULL,
      totalMarks INTEGER NOT NULL,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      mockTestId TEXT,
      questionTextEnglish TEXT NOT NULL,
      questionTextHindi TEXT NOT NULL,
      optionsEnglish TEXT NOT NULL,
      optionsHindi TEXT NOT NULL,
      correctAnswerIndex INTEGER NOT NULL,
      explanationEnglish TEXT NOT NULL,
      explanationHindi TEXT NOT NULL,
      topic TEXT NOT NULL,
      subtopic TEXT,
      difficulty TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS test_submissions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      mockTestId TEXT NOT NULL,
      testTitle TEXT NOT NULL,
      score INTEGER NOT NULL,
      totalQuestions INTEGER NOT NULL,
      percentage REAL NOT NULL,
      correctCount INTEGER NOT NULL,
      incorrectCount INTEGER NOT NULL,
      unattemptedCount INTEGER NOT NULL,
      timeSpentSeconds INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      topicWiseBreakdown TEXT NOT NULL,
      userAnswers TEXT NOT NULL,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

  console.log('✅ SQLite database connected and synced with node:sqlite.');
}

// Sequelize-compatible ORM Model wrapper class
export class BaseModel<T extends Record<string, any>> {
  tableName: string;
  jsonFields: string[];

  constructor(tableName: string, jsonFields: string[] = []) {
    this.tableName = tableName;
    this.jsonFields = jsonFields;
  }

  private serialize(item: Partial<T>): Record<string, any> {
    const copy: any = { ...item };
    for (const key of this.jsonFields) {
      if (copy[key] !== undefined && typeof copy[key] !== 'string') {
        copy[key] = JSON.stringify(copy[key]);
      }
    }
    if (copy.passed !== undefined && typeof copy.passed === 'boolean') {
      copy.passed = copy.passed ? 1 : 0;
    }
    if (copy.createdAt instanceof Date) {
      copy.createdAt = copy.createdAt.toISOString();
    }
    if (copy.updatedAt instanceof Date) {
      copy.updatedAt = copy.updatedAt.toISOString();
    }
    return copy;
  }

  private deserialize(row: any): T {
    if (!row) return row;
    const item: any = { ...row };
    for (const key of this.jsonFields) {
      if (item[key] && typeof item[key] === 'string') {
        try {
          item[key] = JSON.parse(item[key]);
        } catch {}
      }
    }
    if (item.passed !== undefined) {
      item.passed = Boolean(item.passed);
    }
    if (item.createdAt) {
      item.createdAt = new Date(item.createdAt);
    }
    if (item.updatedAt) {
      item.updatedAt = new Date(item.updatedAt);
    }
    item.toJSON = () => ({ ...item });
    item.save = async () => {
      const keys = Object.keys(item).filter(
        (k) => k !== 'toJSON' && k !== 'save' && k !== 'id'
      );
      const setClauses = keys.map((k) => `${k} = ?`).join(', ');
      const serialized = this.serialize(item);
      const values = keys.map((k) => serialized[k]);
      values.push(item.id);
      db.prepare(`UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`).run(...values);
      return item;
    };
    return item;
  }

  async count(options?: { where?: Record<string, any> }): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];
    if (options?.where && Object.keys(options.where).length > 0) {
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(options.where)) {
        clauses.push(`${k} = ?`);
        params.push(v);
      }
      query += ` WHERE ${clauses.join(' AND ')}`;
    }
    const stmt = db.prepare(query);
    const result: any = stmt.get(...params);
    return Number(result?.count || 0);
  }

  async findByPk(id: string, options?: any): Promise<T | null> {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    const row = stmt.get(id);
    if (!row) return null;
    const item = this.deserialize(row);
    // Handle include questions if requested
    if (options?.include && Array.isArray(options.include)) {
      for (const inc of options.include) {
        if (inc.as === 'questions' || inc.model?.tableName === 'questions') {
          const qStmt = db.prepare('SELECT * FROM questions WHERE mockTestId = ?');
          const qRows: any = qStmt.all(id);
          (item as any).questions = qRows.map((qr: any) => {
            const d = { ...qr };
            try { d.optionsEnglish = JSON.parse(d.optionsEnglish); } catch {}
            try { d.optionsHindi = JSON.parse(d.optionsHindi); } catch {}
            return d;
          });
        }
      }
    }
    return item;
  }

  async findOne(options?: { where?: Record<string, any> }): Promise<T | null> {
    const list = await this.findAll({ ...options, limit: 1 });
    return list[0] || null;
  }

  async findAll(options?: {
    where?: Record<string, any>;
    order?: [string, 'ASC' | 'DESC'][];
    limit?: number;
    include?: any[];
  }): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (options?.where && Object.keys(options.where).length > 0) {
      const clauses: string[] = [];
      for (const [k, v] of Object.entries(options.where)) {
        clauses.push(`${k} = ?`);
        params.push(v);
      }
      query += ` WHERE ${clauses.join(' AND ')}`;
    }

    if (options?.order && options.order.length > 0) {
      const orderClauses = options.order.map(([col, dir]) => `${col} ${dir}`);
      query += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    const stmt = db.prepare(query);
    const rows: any = stmt.all(...params);
    return rows.map((r: any) => this.deserialize(r));
  }

  async create(data: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const id = data.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const fullData: any = {
      ...data,
      id,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : now,
      updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : now,
    };

    const serialized = this.serialize(fullData);
    const keys = Object.keys(serialized);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((k) => serialized[k]);

    const stmt = db.prepare(`INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`);
    stmt.run(...values);

    return this.deserialize(fullData);
  }

  async bulkCreate(records: Partial<T>[]): Promise<T[]> {
    const results: T[] = [];
    for (const rec of records) {
      const created = await this.create(rec);
      results.push(created);
    }
    return results;
  }
}
