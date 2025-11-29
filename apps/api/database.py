import sqlite3
import json
import os

DB_NAME = "german_gym_bros.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if not os.path.exists(DB_NAME):
        print("Initializing database...")
        conn = get_db_connection()
        with open('sqlite_schema.sql', 'r') as f:
            conn.executescript(f.read())
        conn.commit()
        conn.close()
        print("Database initialized.")
    else:
        print("Database already exists.")

def save_program_to_db(program_name, description, plan_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Create Program
        cursor.execute(
            "INSERT INTO training_programs (name, description) VALUES (?, ?)",
            (program_name, description)
        )
        program_id = cursor.lastrowid
        
        # 2. Iterate through days (plan_data is a list of day objects)
        for day in plan_data:
            # day is a dict with keys: day, focus, warmup, circuits, cardio
            day_num = day.get('day')
            focus = day.get('focus')
            
            cursor.execute(
                "INSERT INTO workouts (program_id, day_number, name, focus) VALUES (?, ?, ?, ?)",
                (program_id, day_num, f"Day {day_num}", focus)
            )
            workout_id = cursor.lastrowid
            
            # 3. Save Components
            
            # Warmup
            if day.get('warmup'):
                cursor.execute(
                    "INSERT INTO workout_components (workout_id, component_type, order_index, data) VALUES (?, ?, ?, ?)",
                    (workout_id, 'warmup', 0, json.dumps(day['warmup']))
                )
            
            # Circuits
            circuits = day.get('circuits', [])
            for i, circuit in enumerate(circuits):
                cursor.execute(
                    "INSERT INTO workout_components (workout_id, component_type, order_index, data) VALUES (?, ?, ?, ?)",
                    (workout_id, 'circuit', i + 1, json.dumps(circuit))
                )
                
            # Cardio
            if day.get('cardio'):
                cursor.execute(
                    "INSERT INTO workout_components (workout_id, component_type, order_index, data) VALUES (?, ?, ?, ?)",
                    (workout_id, 'cardio', 99, json.dumps(day['cardio']))
                )
                
        conn.commit()
        return program_id
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
