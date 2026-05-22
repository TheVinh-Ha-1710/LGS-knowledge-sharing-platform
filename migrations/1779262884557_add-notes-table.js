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
    pgm.createTable('notes', {
        id: { type: 'serial', primaryKey: true },
        user_id: {
            type: 'integer',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE'
        },
        material_id: {
            type: 'integer',
            notNull: true,
            references: 'materials(id)',
            onDelete: 'CASCADE'
        },
        content: { type: 'text', notNull: true },
        created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', default: pgm.func('NOW()') }
    })

    // One note per user per material
    pgm.addConstraint('notes', 'notes_user_material_unique',
        'UNIQUE (user_id, material_id)'
    )
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('notes')
};
