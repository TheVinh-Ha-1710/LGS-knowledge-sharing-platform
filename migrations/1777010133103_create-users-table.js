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
    // Create a table
    pgm.createTable('users', {
        id: { type: 'serial', primaryKey: true },
        email: { type: 'text', notNull: true, unique: true },
        password: { type: 'text', notNull: true }
    }, { ifNotExists: true })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Drop a table
    pgm.dropTable('users')
};
