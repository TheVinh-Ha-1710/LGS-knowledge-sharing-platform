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
    pgm.createTable('material_tags', {
        material_id: { type: 'integer', references: '"materials"', onDelete: 'CASCADE' },
        tag_id: { type: 'integer', references: '"tags"', onDelete: 'CASCADE' }
    }, { ifNotExists: true })

    pgm.addConstraint('material_tags', 'material_tags_pkey', 'PRIMARY KEY (material_id, tag_id)')
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('material_tags')
};
