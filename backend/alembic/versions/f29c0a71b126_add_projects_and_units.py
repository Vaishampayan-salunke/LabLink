"""add_projects_and_units

Revision ID: f29c0a71b126
Revises: 2b98defe9be4
Create Date: 2026-11-23 21:04:53.621662

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine import reflection


# revision identifiers, used by Alembic.
revision = 'f29c0a71b126'
down_revision = '2b98defe9be4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Safely create PostgreSQL ENUM types if they do not already exist
    if conn.dialect.name == "postgresql":
        for type_name, values in [
            ('projectstatus', ('Draft', 'Active', 'Completed', 'Archived')),
            ('waitliststatus', ('Waiting', 'Notified', 'Accepted', 'Expired', 'Cancelled')),
            ('faultseverity', ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
            ('faultstatus', ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED')),
            ('qreventtype', ('CHECK_IN', 'CHECK_OUT')),
        ]:
            val_str = ", ".join(f"'{v}'" for v in values)
            conn.execute(sa.text(f"""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{type_name}') THEN
                        CREATE TYPE {type_name} AS ENUM ({val_str});
                    END IF;
                END$$;
            """))

    inspector = reflection.Inspector.from_engine(conn)
    tables = inspector.get_table_names()

    # 1. projects table
    if 'projects' not in tables:
        op.create_table(
            'projects',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('creator_id', sa.String(length=36), nullable=False),
            sa.Column('status', sa.Enum('Draft', 'Active', 'Completed', 'Archived', name='projectstatus', create_type=False), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_projects_creator_id'), 'projects', ['creator_id'], unique=False)

    # 2. project_members table
    if 'project_members' not in tables:
        op.create_table(
            'project_members',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('project_id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('role', sa.String(length=50), nullable=False),
            sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_project_members_project_id'), 'project_members', ['project_id'], unique=False)
        op.create_index(op.f('ix_project_members_user_id'), 'project_members', ['user_id'], unique=False)

    # 3. Add project_id to bookings table if not present
    if 'bookings' in tables:
        cols = [c['name'] for c in inspector.get_columns('bookings')]
        if 'project_id' not in cols:
            op.add_column('bookings', sa.Column('project_id', sa.String(length=36), nullable=True))
            op.create_index(op.f('ix_bookings_project_id'), 'bookings', ['project_id'], unique=False)

    # 4. waitlist_entries table
    if 'waitlist_entries' not in tables:
        op.create_table(
            'waitlist_entries',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('equipment_id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('priority_score', sa.Float(), nullable=False),
            sa.Column('desired_start_time', sa.DateTime(timezone=True), nullable=False),
            sa.Column('desired_end_time', sa.DateTime(timezone=True), nullable=False),
            sa.Column('status', sa.Enum('Waiting', 'Notified', 'Accepted', 'Expired', 'Cancelled', name='waitliststatus', create_type=False), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(['equipment_id'], ['equipment.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_waitlist_entries_equipment_id'), 'waitlist_entries', ['equipment_id'], unique=False)
        op.create_index(op.f('ix_waitlist_entries_user_id'), 'waitlist_entries', ['user_id'], unique=False)

    # 5. fault_reports table
    if 'fault_reports' not in tables:
        op.create_table(
            'fault_reports',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('equipment_id', sa.String(length=36), nullable=False),
            sa.Column('reporter_id', sa.String(length=36), nullable=False),
            sa.Column('severity', sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='faultseverity', create_type=False), nullable=False),
            sa.Column('status', sa.Enum('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', name='faultstatus', create_type=False), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('resolution_notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['equipment_id'], ['equipment.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['reporter_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_fault_reports_equipment_id'), 'fault_reports', ['equipment_id'], unique=False)
        op.create_index(op.f('ix_fault_reports_reporter_id'), 'fault_reports', ['reporter_id'], unique=False)

    # 6. equipment_units table
    if 'equipment_units' not in tables:
        op.create_table(
            'equipment_units',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('equipment_id', sa.String(length=36), nullable=False),
            sa.Column('unit_serial', sa.String(length=100), nullable=False),
            sa.Column('qr_code_token', sa.String(length=64), nullable=False),
            sa.Column('is_functional', sa.Boolean(), nullable=False),
            sa.Column('is_available', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(['equipment_id'], ['equipment.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_equipment_units_equipment_id'), 'equipment_units', ['equipment_id'], unique=False)
        op.create_index(op.f('ix_equipment_units_qr_code_token'), 'equipment_units', ['qr_code_token'], unique=True)
        op.create_index(op.f('ix_equipment_units_unit_serial'), 'equipment_units', ['unit_serial'], unique=True)

    # 7. qr_check_events table
    if 'qr_check_events' not in tables:
        op.create_table(
            'qr_check_events',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('booking_id', sa.String(length=36), nullable=False),
            sa.Column('equipment_unit_id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=True),
            sa.Column('event_type', sa.Enum('CHECK_IN', 'CHECK_OUT', name='qreventtype', create_type=False), nullable=False),
            sa.Column('condition_notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['equipment_unit_id'], ['equipment_units.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_qr_check_events_booking_id'), 'qr_check_events', ['booking_id'], unique=False)
        op.create_index(op.f('ix_qr_check_events_equipment_unit_id'), 'qr_check_events', ['equipment_unit_id'], unique=False)
        op.create_index(op.f('ix_qr_check_events_user_id'), 'qr_check_events', ['user_id'], unique=False)


def downgrade() -> None:
    pass

