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
    // Add google_id column
    pgm.addColumn('users', {
        google_id: { type: 'text', notNull: false, unique: true }  // nullable — no default needed
    })

    pgm.alterColumn('users', 'password', { type: 'text', notNull: false })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Remove column
    pgm.dropColumn('users', 'google_id')
    pgm.alterColumn('users', 'password', { type: 'text', notNull: true })
};
