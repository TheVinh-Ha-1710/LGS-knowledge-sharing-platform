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
    pgm.createTable('reads', {
        'id': { type: 'serial', primaryKey: true },
        'user_id': { type: 'integer', references: 'users', onDelete: 'CASCADE' },
        'material_id': { type: 'integer', references: 'materials', onDelete: 'CASCADE' },
        'read_at': { type: 'timestamptz', default: pgm.func('now()') },
        'completed': { type: 'boolean', default: false }
    }, { ifNotExists: true })

    pgm.addConstraint('reads', 'reads_user_material_unique', 'UNIQUE (user_id, material_id)')
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('reads')
};
