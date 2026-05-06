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
    pgm.createTable('fields', {
       'id': { type: 'serial', primaryKey: true },
       'name': { type: 'text', notNull: true, unique: true },
       'slug': { type: 'text', notNull: true, unique: true },
       'icon': { type: 'text' },
       'description': { type: 'text' },
       'created_at': { type: 'timestamptz', default: pgm.func('now()') } 
    }, { ifNotExists: true })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('fields')
};
