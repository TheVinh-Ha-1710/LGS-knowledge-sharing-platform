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
    // Create login attempts table
    pgm.createTable('login_attempts', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'integer', references: '"users"', onDelete: 'CASCADE' },
        attempted_at: { type: 'timestamptz', default: pgm.func('now()') },
        success: { type: 'boolean', notNull: true },
        ip_address: { type: 'text' }
    }, { ifNotExists: true })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Drop table
    pgm.dropTable('login_attempts')
};
