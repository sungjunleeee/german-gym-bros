-- SQLite Schema for German Gym Bros

CREATE TABLE IF NOT EXISTS training_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER,
    day_number INTEGER,
    name TEXT,
    focus TEXT,
    FOREIGN KEY (program_id) REFERENCES training_programs(id)
);

CREATE TABLE IF NOT EXISTS workout_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER,
    component_type TEXT, -- 'warmup', 'circuit', 'cardio'
    order_index INTEGER,
    data TEXT, -- JSON blob for flexibility (warmup list, circuit details, cardio stats)
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
);
