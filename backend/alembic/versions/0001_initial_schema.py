"""Initial schema for users, sessions, mistakes, bookmarks, and revision planner

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-27 15:50:00

"""
from alembic import op
import sqlalchemy as sa

revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Preferences
    op.create_table(
        'user_preferences',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('arabic_font_size', sa.Integer(), nullable=False, default=26),
        sa.Column('show_translation', sa.Boolean(), nullable=False, default=True),
        sa.Column('retain_audio_snippets', sa.Boolean(), nullable=False, default=False),
        sa.Column('theme', sa.String(length=20), nullable=False, default='dark'),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    # Recitation Sessions
    op.create_table(
        'recitation_sessions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('surah_number', sa.Integer(), nullable=False),
        sa.Column('ayah_start', sa.Integer(), nullable=False, default=1),
        sa.Column('ayah_end', sa.Integer(), nullable=False, default=1),
        sa.Column('mode', sa.String(length=30), nullable=False, default='recite'),
        sa.Column('status', sa.String(length=30), nullable=False, default='active'),
        sa.Column('duration_seconds', sa.Integer(), nullable=False, default=0),
        sa.Column('total_words_recited', sa.Integer(), nullable=False, default=0),
        sa.Column('total_mistakes_count', sa.Integer(), nullable=False, default=0),
        sa.Column('fluency_score', sa.Float(), nullable=False, default=100.0),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Potential Mistakes
    op.create_table(
        'potential_mistakes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('session_id', sa.String(length=36), nullable=False),
        sa.Column('surah_number', sa.Integer(), nullable=False),
        sa.Column('ayah_number', sa.Integer(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False, default=1),
        sa.Column('mistake_type', sa.String(length=30), nullable=False),
        sa.Column('expected_word', sa.String(length=100), nullable=True),
        sa.Column('expected_word_uthmani', sa.String(length=100), nullable=True),
        sa.Column('recited_word', sa.String(length=100), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=False, default=0.8),
        sa.Column('is_reviewed', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_dismissed', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['recitation_sessions.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('potential_mistakes')
    op.drop_table('recitation_sessions')
    op.drop_table('user_preferences')
    op.drop_table('users')
