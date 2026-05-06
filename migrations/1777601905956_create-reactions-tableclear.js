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
    pgm.createTable('reactions', {
        'id': { type: 'serial', primaryKey: true },
        'user_id': { type: 'integer', references: 'users', onDelete: 'CASCADE' },
        'material_id': { type: 'integer', references: 'materials', onDelete: 'CASCADE' },
        'type': { type: 'text', notNull: true,  },
        'created_at': { type: 'timestamptz', default: pgm.func('now()') },
    }, { ifNotExists: true })

    pgm.addConstraint('reactions', 'reactions_user_material_unique', 'UNIQUE (user_id, material_id)')
    pgm.addConstraint('reactions', 'reactions_type_check',
        `CHECK (type IN ('helpful', 'mindblown', 'needs_work'))`
    )
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('reactions')
};
