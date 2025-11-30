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

            # Cooldown
            if day.get('cooldown'):
                cursor.execute(
                    "INSERT INTO workout_components (workout_id, component_type, order_index, data) VALUES (?, ?, ?, ?)",
                    (workout_id, 'cooldown', 100, json.dumps(day['cooldown']))
                )
                
        conn.commit()
        return program_id
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_latest_program():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get latest program
        cursor.execute("SELECT * FROM training_programs ORDER BY created_at DESC LIMIT 1")
        program = cursor.fetchone()
        
        if not program:
            return None
            
        program_data = dict(program)
        program_id = program['id']
        
        # Get workouts for this program
        cursor.execute("SELECT * FROM workouts WHERE program_id = ? ORDER BY day_number", (program_id,))
        workouts = [dict(w) for w in cursor.fetchall()]
        
        # Get components for each workout
        for workout in workouts:
            cursor.execute("SELECT * FROM workout_components WHERE workout_id = ? ORDER BY order_index", (workout['id'],))
            components = cursor.fetchall()
            
            workout['components'] = []
            for comp in components:
                comp_data = dict(comp)
                # Parse JSON data
                try:
                    comp_data['data'] = json.loads(comp_data['data'])
                except:
                    pass
                workout['components'].append(comp_data)
                
        program_data['workouts'] = workouts
        return program_data
        
    finally:
        conn.close()

def delete_workout(workout_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get program_id before deleting
        cursor.execute("SELECT program_id FROM workouts WHERE id = ?", (workout_id,))
        result = cursor.fetchone()
        if not result:
            return False
            
        program_id = result['program_id']

        # 1. Delete components first
        cursor.execute("DELETE FROM workout_components WHERE workout_id = ?", (workout_id,))
        
        # 2. Delete workout
        cursor.execute("DELETE FROM workouts WHERE id = ?", (workout_id,))
        
        # 3. Check if program has any workouts left
        cursor.execute("SELECT COUNT(*) FROM workouts WHERE program_id = ?", (program_id,))
        count = cursor.fetchone()[0]
        
        if count == 0:
            # Delete the program if no workouts remain
            cursor.execute("DELETE FROM training_programs WHERE id = ?", (program_id,))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def delete_program(program_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Get all workouts for this program
        cursor.execute("SELECT id FROM workouts WHERE program_id = ?", (program_id,))
        workouts = cursor.fetchall()
        workout_ids = [w['id'] for w in workouts]
        
        if workout_ids:
            # 2. Delete components for all workouts
            placeholders = ','.join(['?'] * len(workout_ids))
            cursor.execute(f"DELETE FROM workout_components WHERE workout_id IN ({placeholders})", workout_ids)
            
            # 3. Delete workouts
            cursor.execute("DELETE FROM workouts WHERE program_id = ?", (program_id,))
            
        # 4. Delete program
        cursor.execute("DELETE FROM training_programs WHERE id = ?", (program_id,))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
