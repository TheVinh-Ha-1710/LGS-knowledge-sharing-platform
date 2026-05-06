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
    // Create user profiles table
    pgm.createTable('user_profiles', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'integer', references: '"users"', onDelete: "CASCADE" },
        display_name: { type: 'text' },
        created_at: { type: 'timestamptz', default: pgm.func('now()') }
    }, { ifNotExists: true })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Drop table
    pgm.dropTable('user_profiles')
};
