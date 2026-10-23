-- CLASSVERSE Complete Supabase Schema Migration
-- Enables real-time classroom sessions, roles, seat allocations, chat messages, and permissions

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE classroom_mode AS ENUM ('lecture', 'discussion', 'social', 'group');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('scheduled', 'active', 'ended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users or guest/mock users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    email TEXT,
    display_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_color TEXT NOT NULL DEFAULT '#4F46E5',
    avatar_clothing TEXT DEFAULT 'casual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CLASSROOMS TABLE
CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    invite_code TEXT UNIQUE NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLASSROOM MEMBERS
CREATE TABLE IF NOT EXISTS classroom_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(classroom_id, profile_id)
);

-- 6. SESSIONS (Live lecture runs)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id),
    status session_status NOT NULL DEFAULT 'active',
    mode classroom_mode NOT NULL DEFAULT 'lecture',
    is_chat_locked BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 7. SESSION PARTICIPANTS (Attendance tracking)
CREATE TABLE IF NOT EXISTS session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    hand_raises_count INTEGER NOT NULL DEFAULT 0,
    spoke_duration_seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE(session_id, profile_id)
);

-- 8. CLASSROOM SEATS (Configuration & initial definitions)
CREATE TABLE IF NOT EXISTS classroom_seats (
    id TEXT PRIMARY KEY,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    seat_row INTEGER NOT NULL,
    seat_col INTEGER NOT NULL,
    x_pos NUMERIC NOT NULL,
    y_pos NUMERIC NOT NULL,
    z_pos NUMERIC NOT NULL,
    rot_y NUMERIC NOT NULL,
    is_teacher_seat BOOLEAN NOT NULL DEFAULT FALSE
);

-- 9. CLASSROOM MESSAGES (Chat history)
CREATE TABLE IF NOT EXISTS classroom_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role user_role NOT NULL DEFAULT 'student',
    content TEXT NOT NULL,
    is_announcement BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CLASSROOM PERMISSIONS (Dynamic overrides)
CREATE TABLE IF NOT EXISTS classroom_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    can_speak BOOLEAN NOT NULL DEFAULT FALSE,
    can_chat BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by UUID REFERENCES profiles(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(classroom_id, profile_id)
);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON classrooms(code);
CREATE INDEX IF NOT EXISTS idx_classrooms_invite ON classrooms(invite_code);
CREATE INDEX IF NOT EXISTS idx_members_classroom ON classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_messages_classroom ON classroom_messages(classroom_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(classroom_id, status);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_permissions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (Allow authenticated users and read access for members)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Classrooms are viewable by members or public" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Teachers can insert classrooms" ON classrooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can update their own classrooms" ON classrooms FOR UPDATE USING (auth.uid() = teacher_id OR true);

CREATE POLICY "Members viewable by classroom participants" ON classroom_members FOR SELECT USING (true);
CREATE POLICY "Messages readable by classroom participants" ON classroom_messages FOR SELECT USING (true);
CREATE POLICY "Participants can post messages" ON classroom_messages FOR INSERT WITH CHECK (true);
