/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('materials', {
        'id': { type: 'serial', primaryKey: true },
        'title': { type: 'text', notNull: true },
        'slug': { type: 'text', notNull: true, unique: true },
        'content': { type: 'text' },
        'author_id': { type: 'integer', references: 'users', onDelete: 'SET NULL' },
        'field_id': { type: 'integer', references: 'fields', onDelete: 'SET NULL' },
        'difficulty': { type: 'text', default: 'beginner' },
        'published': { type: 'boolean', default: true },
        'view_count': { type: 'integer', default: 0 },
        'created_at': { type: 'timestamptz', default: pgm.func('now()') },
        'updated_at': { type: 'timestamptz', default: pgm.func('now()') }
    }, { ifNotExists: true })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('materials')
};
