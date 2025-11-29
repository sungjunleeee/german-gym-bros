import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple

# --- DATA STRUCTURES ---

@dataclass
class Exercise:
    """Represents a single exercise with its properties"""
    name: str
    equipment: List[str]
    category: str
    difficulty: int = 1  # 1-5 scale
    primary_muscles: List[str] = field(default_factory=list)
    activation: Dict[str, float] = field(default_factory=dict)
    instructions: str = ""

@dataclass
class Circuit:
    """Represents a circuit of exercises"""
    exercises: List[Exercise]
    rounds: int = 3
    work_seconds: int = 45
    rest_seconds: int = 15
    rest_between_rounds: int = 60

@dataclass
class CardioWorkout:
    """Represents a cardio session"""
    type: str  # Distance, Intervals, Tempo, HIIT
    duration_minutes: int
    details: Dict[str, any] = field(default_factory=dict)

@dataclass
class WorkoutSession:
    """Represents a complete workout session"""
    day: int
    circuits: List[Circuit] = field(default_factory=list)
    cardio: Optional[CardioWorkout] = None
    warmup: List[str] = field(default_factory=list)
    cooldown: List[str] = field(default_factory=list)

# --- EXERCISE LIBRARY ---

def create_exercise_library():
    """Creates comprehensive exercise library"""
    # Horizontal Push Exercises
    hp_exercises = [
        Exercise('Barbell Bench Press', ['barbell', 'plates', 'bench', 'rack'], 'hp', 3,
                ['chest', 'frontdelt', 'tricep'],
                {'chest': 1.0, 'frontdelt': 0.5, 'tricep': 0.5},
                'Lie on bench, lower bar to chest, press up'),
        Exercise('Dumbbell Bench Press', ['dumbbell', 'bench'], 'hp', 2,
                ['chest', 'frontdelt', 'tricep'],
                {'chest': 0.9, 'frontdelt': 0.5, 'tricep': 0.5}),
        Exercise('Push-Up', [], 'hp', 1,
                ['chest', 'frontdelt', 'tricep'],
                {'chest': 0.7, 'frontdelt': 0.4, 'tricep': 0.4}),
        Exercise('Weighted Push-Up', ['plates', 'weight vest'], 'hp', 2,
                ['chest', 'frontdelt', 'tricep'],
                {'chest': 0.8, 'frontdelt': 0.45, 'tricep': 0.45}),
        Exercise('Dip', ['dip bar'], 'hp', 3,
                ['chest', 'frontdelt', 'tricep'],
                {'chest': 0.8, 'frontdelt': 0.4, 'tricep': 0.6}),
        Exercise('Incline Dumbbell Press', ['dumbbell', 'incline bench'], 'hp', 2,
                ['chest', 'frontdelt', 'tricep'],
                {'chest': 0.8, 'frontdelt': 0.6, 'tricep': 0.4}),
    ]

    # Vertical Push Exercises
    vp_exercises = [
        Exercise('Overhead Press', ['barbell', 'plates', 'rack'], 'vp', 3,
                ['frontdelt', 'tricep'],
                {'frontdelt': 1.0, 'tricep': 0.5, 'middelt': 0.4}),
        Exercise('Dumbbell Shoulder Press', ['dumbbell'], 'vp', 2,
                ['frontdelt', 'tricep'],
                {'frontdelt': 0.9, 'tricep': 0.5, 'middelt': 0.4}),
        Exercise('Pike Push-Up', [], 'vp', 2,
                ['frontdelt', 'tricep'],
                {'frontdelt': 0.7, 'tricep': 0.4, 'middelt': 0.3}),
        Exercise('Handstand Push-Up', ['wall'], 'vp', 5,
                ['frontdelt', 'tricep'],
                {'frontdelt': 0.9, 'tricep': 0.6, 'middelt': 0.4}),
        Exercise('Arnold Press', ['dumbbell'], 'vp', 3,
                ['frontdelt', 'tricep'],
                {'frontdelt': 0.8, 'tricep': 0.4, 'middelt': 0.5}),
    ]

    # Horizontal Pull Exercises
    hpl_exercises = [
        Exercise('Barbell Row', ['barbell', 'plates'], 'hpl', 3,
                ['lat', 'trap_rhomboid', 'bicep'],
                {'lat': 0.5, 'trap_rhomboid': 1.0, 'bicep': 0.5, 'reardelt': 0.4}),
        Exercise('Dumbbell Row', ['dumbbell'], 'hpl', 2,
                ['lat', 'trap_rhomboid', 'bicep'],
                {'lat': 0.5, 'trap_rhomboid': 0.9, 'bicep': 0.5, 'reardelt': 0.4}),
        Exercise('Seated Cable Row', ['cable machine'], 'hpl', 2,
                ['lat', 'trap_rhomboid', 'bicep'],
                {'lat': 0.6, 'trap_rhomboid': 0.9, 'bicep': 0.4, 'reardelt': 0.3}),
        Exercise('Inverted Row', ['bar'], 'hpl', 2,
                ['lat', 'trap_rhomboid', 'bicep'],
                {'lat': 0.5, 'trap_rhomboid': 0.8, 'bicep': 0.4, 'reardelt': 0.3}),
        Exercise('Face Pull', ['cable machine', 'resistance band'], 'hpl', 1,
                ['trap_rhomboid', 'reardelt'],
                {'trap_rhomboid': 0.6, 'reardelt': 0.8, 'middelt': 0.3}),
    ]

    # Vertical Pull Exercises
    vpl_exercises = [
        Exercise('Pull-Up', ['bar'], 'vpl', 4,
                ['lat', 'bicep'],
                {'lat': 1.0, 'bicep': 0.6, 'trap_rhomboid': 0.4}),
        Exercise('Chin-Up', ['bar'], 'vpl', 3,
                ['lat', 'bicep'],
                {'lat': 0.9, 'bicep': 0.8, 'trap_rhomboid': 0.3}),
        Exercise('Lat Pulldown', ['cable machine'], 'vpl', 2,
                ['lat', 'bicep'],
                {'lat': 0.9, 'bicep': 0.5, 'trap_rhomboid': 0.3}),
        Exercise('Assisted Pull-Up', ['assistance machine'], 'vpl', 2,
                ['lat', 'bicep'],
                {'lat': 0.8, 'bicep': 0.5, 'trap_rhomboid': 0.3}),
        Exercise('Weighted Pull-Up', ['bar', 'weight belt', 'plates'], 'vpl', 5,
                ['lat', 'bicep'],
                {'lat': 1.0, 'bicep': 0.7, 'trap_rhomboid': 0.5}),
    ]

    # Tricep Exercises
    tricep_exercises = [
        Exercise('Tricep Dip', ['dip bar'], 'tricep', 3,
                ['tricep'],
                {'tricep': 1.0, 'chest': 0.3}),
        Exercise('Overhead Tricep Extension', ['dumbbell'], 'tricep', 2,
                ['tricep'],
                {'tricep': 0.9}),
        Exercise('Tricep Pushdown', ['cable machine'], 'tricep', 1,
                ['tricep'],
                {'tricep': 0.8}),
        Exercise('Close-Grip Push-Up', [], 'tricep', 2,
                ['tricep'],
                {'tricep': 0.7, 'chest': 0.4}),
    ]

    # Bicep Exercises
    bicep_exercises = [
        Exercise('Barbell Curl', ['barbell', 'plates'], 'bicep', 2,
                ['bicep'],
                {'bicep': 1.0}),
        Exercise('Dumbbell Curl', ['dumbbell'], 'bicep', 1,
                ['bicep'],
                {'bicep': 0.9}),
        Exercise('Hammer Curl', ['dumbbell'], 'bicep', 2,
                ['bicep'],
                {'bicep': 0.8}),
        Exercise('Cable Curl', ['cable machine'], 'bicep', 1,
                ['bicep'],
                {'bicep': 0.8}),
    ]

    # Squat Exercises
    squat_exercises = [
        Exercise('Barbell Back Squat', ['barbell', 'plates', 'rack'], 'squat', 4,
                ['quad', 'glute'],
                {'quad': 1.0, 'glute': 1.0, 'lowback': 0.5}),
        Exercise('Goblet Squat', ['dumbbell', 'kettlebell'], 'squat', 2,
                ['quad', 'glute'],
                {'quad': 0.8, 'glute': 0.8, 'core': 0.4}),
        Exercise('Bodyweight Squat', [], 'squat', 1,
                ['quad', 'glute'],
                {'quad': 0.6, 'glute': 0.6}),
        Exercise('Bulgarian Split Squat', ['dumbbell'], 'squat', 3,
                ['quad', 'glute'],
                {'quad': 0.9, 'glute': 0.8}),
        Exercise('Front Squat', ['barbell', 'plates', 'rack'], 'squat', 4,
                ['quad', 'glute'],
                {'quad': 1.0, 'glute': 0.8, 'core': 0.6}),
    ]

    # Hinge Exercises
    hinge_exercises = [
        Exercise('Barbell Deadlift', ['barbell', 'plates'], 'hinge', 5,
                ['hamstring', 'glute', 'lowback'],
                {'hamstring': 1.0, 'glute': 0.9, 'lowback': 1.0, 'trap_rhomboid': 0.4}),
        Exercise('Romanian Deadlift', ['barbell', 'plates', 'dumbbell'], 'hinge', 3,
                ['hamstring', 'glute'],
                {'hamstring': 1.0, 'glute': 0.7, 'lowback': 0.8}),
        Exercise('Kettlebell Swing', ['kettlebell'], 'hinge', 2,
                ['hamstring', 'glute'],
                {'hamstring': 0.7, 'glute': 0.9, 'lowback': 0.5}),
        Exercise('Good Morning', ['barbell', 'plates'], 'hinge', 3,
                ['hamstring', 'glute', 'lowback'],
                {'hamstring': 0.8, 'glute': 0.6, 'lowback': 0.9}),
    ]

    # Quad Isolation
    quad_exercises = [
        Exercise('Leg Extension', ['leg extension machine'], 'quad', 1,
                ['quad'],
                {'quad': 1.0}),
        Exercise('Walking Lunge', ['dumbbell'], 'quad', 2,
                ['quad', 'glute'],
                {'quad': 0.8, 'glute': 0.6}),
        Exercise('Step-Up', ['box', 'dumbbell'], 'quad', 2,
                ['quad', 'glute'],
                {'quad': 0.7, 'glute': 0.6}),
    ]

    # Hamstring Isolation
    hamstring_exercises = [
        Exercise('Leg Curl', ['leg curl machine'], 'hamstring', 1,
                ['hamstring'],
                {'hamstring': 1.0}),
        Exercise('Nordic Curl', ['partner', 'anchor'], 'hamstring', 4,
                ['hamstring'],
                {'hamstring': 1.0}),
        Exercise('Glute-Ham Raise', ['GHD'], 'hamstring', 3,
                ['hamstring', 'glute'],
                {'hamstring': 0.9, 'glute': 0.6}),
    ]

    # Calf Exercises
    calf_exercises = [
        Exercise('Calf Raise', ['calf machine'], 'calf', 1,
                ['calf'],
                {'calf': 1.0}),
        Exercise('Seated Calf Raise', ['seated calf machine'], 'calf', 1,
                ['calf'],
                {'calf': 0.9}),
        Exercise('Jump Rope', ['jump rope'], 'calf', 2,
                ['calf'],
                {'calf': 0.7}),
    ]

    # Core Exercises
    core_exercises = [
        Exercise('Plank', [], 'core', 1,
                ['core'],
                {'core': 1.0}),
        Exercise('Hanging Leg Raise', ['bar'], 'core', 3,
                ['core'],
                {'core': 1.0}),
        Exercise('Ab Wheel', ['ab wheel'], 'core', 4,
                ['core'],
                {'core': 1.0}),
        Exercise('Russian Twist', ['dumbbell', 'plate'], 'core', 2,
                ['core'],
                {'core': 0.8}),
        Exercise('Dead Bug', [], 'core', 1,
                ['core'],
                {'core': 0.7}),
    ]

    # Medial Delt Exercises
    middelt_exercises = [
        Exercise('Lateral Raise', ['dumbbell', 'cable'], 'middelt', 1,
                ['middelt'],
                {'middelt': 1.0}),
        Exercise('Upright Row', ['barbell', 'dumbbell'], 'middelt', 2,
                ['middelt', 'trap_rhomboid'],
                {'middelt': 0.8, 'trap_rhomboid': 0.6}),
    ]

    # Rear Delt Exercises
    reardelt_exercises = [
        Exercise('Rear Delt Fly', ['dumbbell', 'cable'], 'reardelt', 1,
                ['reardelt'],
                {'reardelt': 1.0}),
        Exercise('Reverse Pec Deck', ['pec deck machine'], 'reardelt', 1,
                ['reardelt'],
                {'reardelt': 0.9}),
    ]

    return {
        'hp': hp_exercises,
        'vp': vp_exercises,
        'hpl': hpl_exercises,
        'vpl': vpl_exercises,
        'tricep': tricep_exercises,
        'bicep': bicep_exercises,
        'squat': squat_exercises,
        'hinge': hinge_exercises,
        'quad': quad_exercises,
        'hamstring': hamstring_exercises,
        'calf': calf_exercises,
        'core': core_exercises,
        'middelt': middelt_exercises,
        'reardelt': reardelt_exercises,
    }

# --- GENERATORS ---

def create_cardio_workout(workout_type: str, duration_minutes: int, focus: str = 'distance') -> CardioWorkout:
    """Creates detailed cardio workout based on type and duration"""

    if workout_type == "Distance":
        # Steady state cardio
        pace = "conversational" if focus == 'distance' else "moderate"
        return CardioWorkout(
            type="Distance Run",
            duration_minutes=duration_minutes,
            details={
                'distance_km': duration_minutes * 0.12 if focus == 'distance' else duration_minutes * 0.15,
                'pace': pace,
                'effort': '60-70% max HR' if focus == 'distance' else '70-80% max HR',
                'instructions': f"Run at {pace} pace for {duration_minutes} minutes"
            }
        )

    elif workout_type == "Intervals":
        # High intensity intervals
        work_time = 400 if duration_minutes > 30 else 200
        rest_time = work_time // 2
        rounds = (duration_minutes * 60) // (work_time + rest_time)

        return CardioWorkout(
            type="Interval Training",
            duration_minutes=duration_minutes,
            details={
                'structure': f"{work_time}m sprint / {rest_time}m recovery",
                'rounds': rounds,
                'effort': '85-95% max HR during work',
                'instructions': f"Sprint {work_time}m, recover {rest_time}m, repeat {rounds} times"
            }
        )

    elif workout_type == "Tempo":
        # Threshold pace work
        return CardioWorkout(
            type="Tempo Run",
            duration_minutes=duration_minutes,
            details={
                'structure': '10min warmup / tempo blocks / cooldown',
                'tempo_duration': duration_minutes - 10,
                'pace': 'comfortably hard',
                'effort': '80-85% max HR',
                'instructions': f"10min easy, then {duration_minutes-10}min at tempo pace"
            }
        )

    elif workout_type == "HIIT":
        # High intensity interval training
        work = 30
        rest = 30
        rounds = duration_minutes

        return CardioWorkout(
            type="HIIT",
            duration_minutes=duration_minutes,
            details={
                'structure': f"{work}s max effort / {rest}s rest",
                'rounds': rounds,
                'effort': '90-100% max HR during work',
                'exercises': ['burpees', 'mountain climbers', 'jump squats', 'high knees'],
                'instructions': f"Rotate through exercises: {work}s on, {rest}s off, {rounds} rounds"
            }
        )

    return CardioWorkout(type=workout_type, duration_minutes=duration_minutes)

def filter_exercises_by_equipment(exercises: List[Exercise], available_equipment: List[str]) -> List[Exercise]:
    """Filter exercises based on available equipment"""

    if not available_equipment or 'all' in available_equipment:
        return exercises

    available_set = set(available_equipment)
    filtered = []

    for exercise in exercises:
        # Check if all required equipment is available
        if not exercise.equipment or all(eq in available_set for eq in exercise.equipment):
            filtered.append(exercise)

    return filtered if filtered else exercises  # Return all if none match

def create_circuits(exercises: List[Exercise], num_soldiers: int = 20,
                   circuit_size: int = 3) -> List[Circuit]:
    """Create efficient circuits from exercises"""

    circuits = []

    # Group exercises into circuits
    for i in range(0, len(exercises), circuit_size):
        circuit_exercises = exercises[i:i+circuit_size]

        # Calculate work/rest based on number of soldiers
        soldiers_per_station = max(2, num_soldiers // len(circuit_exercises))
        work_seconds = 45
        rest_seconds = 15 if soldiers_per_station <= 2 else 30

        circuits.append(Circuit(
            exercises=circuit_exercises,
            rounds=3,
            work_seconds=work_seconds,
            rest_seconds=rest_seconds,
            rest_between_rounds=90 if num_soldiers > 20 else 60
        ))

    return circuits

def get_rep_range(strength_focus: str, exercise_difficulty: int) -> Tuple[int, int]:
    """Get recommended rep range based on training focus"""

    rep_ranges = {
        'endurance': (15, 25),
        'hypertrophy': (8, 12),
        'power': (3, 6),
        'strength': (1, 5)
    }

    base_range = rep_ranges.get(strength_focus, (8, 12))

    # Adjust for exercise difficulty
    if exercise_difficulty >= 4:
        # Harder exercises get lower reps
        return (max(1, base_range[0] - 2), base_range[1] - 2)

    return base_range

def get_intensity_recommendation(strength_focus: str) -> str:
    """Get intensity recommendation based on focus"""

    intensities = {
        'endurance': '50-65% 1RM or RPE 5-6',
        'hypertrophy': '65-80% 1RM or RPE 7-8',
        'power': '75-90% 1RM or RPE 8-9 (explosive)',
        'strength': '85-95% 1RM or RPE 9-10'
    }

    return intensities.get(strength_focus, '65-80% 1RM or RPE 7-8')

def generate_warmup(workout_type: str) -> List[str]:
    """Generate appropriate warmup for workout type"""

    general_warmup = [
        "5 minutes light cardio (jog, jump rope, or bike)",
        "Arm circles - 10 each direction",
        "Leg swings - 10 each leg, each direction",
        "Hip circles - 10 each direction"
    ]

    if 'U' in workout_type or 'F' in workout_type:
        general_warmup.extend([
            "Band pull-aparts - 15 reps",
            "Scapular push-ups - 10 reps",
            "Empty bar shoulder press - 10 reps",
            "Empty bar rows - 10 reps"
        ])

    if 'L' in workout_type or 'F' in workout_type:
        general_warmup.extend([
            "Bodyweight squats - 15 reps",
            "Walking lunges - 10 each leg",
            "Glute bridges - 15 reps",
            "Leg swings - 10 each direction"
        ])

    return general_warmup

def generate_cooldown() -> List[str]:
    """Generate cooldown routine"""

    return [
        "5 minutes easy cardio (walk or light jog)",
        "Chest stretch - 30 seconds each side",
        "Shoulder stretch - 30 seconds each side",
        "Hip flexor stretch - 30 seconds each side",
        "Hamstring stretch - 30 seconds each side",
        "Quad stretch - 30 seconds each side",
        "Child's pose - 1 minute",
        "Deep breathing - 2 minutes"
    ]

# --- PLANNING LOGIC ---

baseline = {
    'lat': 2, 'trap_rhomboid': 2, 'frontdelt': 2, 'chest': 2,
    'middelt': 1, 'reardelt': 1, 'bicep': 1, 'tricep': 1,
    'core': 2, 'quad': 2, 'calf': 1, 'hamstring': 2,
    'lowback': 1, 'glute': 2,
}

schedules = {
    3: {
        'strength': [[('F', 55), ('C', 20)], [('F', 50), ('C', 25)], [('F', 55), ('C', 20)]],
        'cardio': [[('C', 30), ('F', 45)], [('C', 40), ('F', 35)], [('C', 30), ('F', 45)]]
    },
    4: {
        'strength': [[('L', 55), ('C', 20)], [('U', 55), ('C', 20)], [('F', 75)], [('C', 40), ('A', 35)]],
        'cardio': [[('C', 30), ('L', 45)], [('C', 30), ('U', 45)], [('F', 75)], [('C', 40), ('A', 35)]]
    },
    5: {
        'strength': [[('L', 50), ('C', 25)], [('U', 55), ('C', 20)], [('C', 75)], [('L', 55), ('C', 20)], [('U', 50), ('C', 25)]],
        'cardio': [[('F', 55), ('C', 20)], [('C', 75)], [('F', 75)], [('C', 45), ('A', 30)], [('F', 55), ('C', 20)]]
    },
}

def create_muscle_emphasis(muscles: List[str]) -> Dict[str, float]:
    """Create muscle emphasis based on target muscles"""
    emphasis = baseline.copy()
    for muscle in muscles:
        if muscle in emphasis:
            emphasis[muscle] *= 1.5
    return emphasis

def normalize(emph: Dict[str, float]) -> Dict[str, float]:
    """Normalize emphasis dictionary"""
    total = sum(emph.values())
    if not total:
        return emph
    return {k: v / total for k, v in emph.items()}

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between vectors"""
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def select_exercises(categories: List[str], available_equipment: List[str],
                    exercise_library: Dict, num_exercises: int = None) -> List[Exercise]:
    """Select specific exercises from categories based on equipment"""

    selected = []

    for category in categories:
        category_exercises = exercise_library.get(category, [])
        available = filter_exercises_by_equipment(category_exercises, available_equipment)

        if available:
            # Select exercise (can add logic for variety)
            selected.append(available[0])

    if num_exercises and len(selected) > num_exercises:
        selected = selected[:num_exercises]

    return selected

def create_upper_day(current: Dict, goal: Dict, minutes: int,
                    primary_movements: Optional[Dict], exercise_library: Dict,
                    available_equipment: List[str]) -> Dict:
    """Create upper body workout day with specific exercises"""

    day = {'primary': [], 'circuits': []}

    # Handle primary movements
    if primary_movements is not None:
        if 'bench' not in primary_movements:
            primary_movements['bench'] = 1
            day['primary'].append('bench')
            current['frontdelt'] += 0.75
            current['tricep'] += 0.75
            current['chest'] += 1.5
        elif 'row' not in primary_movements:
            primary_movements['row'] = 1
            day['primary'].append('row')
            current['trap_rhomboid'] += 1.5
            current['lat'] += 0.75
            current['bicep'] += 0.75
        minutes -= 15

    # Exercise selection based on needs
    exercises_needed = []

    upper_lifts = {
        'hp': np.array([1, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0]),
        'vp': np.array([0, 0.5, 1, 0, 0, 0, 0, 0, 0, 0, 0]),
        'hpl': np.array([0, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 0, 0]),
        'vpl': np.array([0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]),
        'tricep': np.array([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        'bicep': np.array([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]),
    }

    muscles = ["chest", "tricep", "frontdelt", "lat", "bicep", "trap_rhomboid",
               "quad", "glute", "lowback", "hamstring", "calf"]
    
    # Filter current and goal to match muscles list length if needed, 
    # but here we use all_muscles in create_full_day, let's ensure consistency.
    # In create_upper_day in notebook, it used a smaller list of muscles.
    # To avoid shape mismatch, let's use the full muscle list everywhere or be careful.
    # The notebook had different muscle lists for different functions.
    # Let's standardize on the full list for simplicity or stick to notebook logic.
    # Notebook logic for upper:
    # muscles = ["chest", "tricep", "frontdelt", "lat", "bicep", "trap_rhomboid"]
    # upper_lifts vectors were length 6.
    # BUT in create_full_day, vectors are length 11.
    # Let's stick to the notebook's logic exactly to avoid breaking math.
    
    # Re-reading notebook for create_upper_day:
    # upper_lifts vectors are length 6.
    # muscles list is length 6.
    
    upper_lifts_local = {
        'hp': np.array([1, 0.5, 0.5, 0, 0, 0]),
        'vp': np.array([0, 0.5, 1, 0, 0, 0]),
        'hpl': np.array([0, 0, 0, 0.5, 0.5, 1]),
        'vpl': np.array([0, 0, 0, 1, 1, 0]),
        'tricep': np.array([0, 1, 0, 0, 0, 0]),
        'bicep': np.array([0, 0, 0, 0, 1, 0]),
        'middelt': np.array([0, 0.3, 0.5, 0, 0, 0]),
        'reardelt': np.array([0, 0, 0, 0.3, 0, 0.6]),
    }
    muscles_local = ["chest", "tricep", "frontdelt", "lat", "bicep", "trap_rhomboid"]
    
    want = np.array([goal[m] for m in muscles_local])

    # Select exercises based on needs
    for _ in range(minutes // 7):
        normed_cur = normalize(current)
        cur = np.array([normed_cur[m] for m in muscles_local])
        need = want - cur

        scores = {name: cosine_similarity(need, vec) for name, vec in upper_lifts_local.items()}
        best_lift = max(scores, key=scores.get)

        exercises_needed.append(best_lift)
        for i, m in enumerate(muscles_local):
            current[m] += upper_lifts_local[best_lift][i]

    # Convert categories to actual exercises
    actual_exercises = select_exercises(exercises_needed, available_equipment, exercise_library)
    day['exercises'] = actual_exercises

    return day

def create_lower_day(current: Dict, goal: Dict, minutes: int,
                    primary_movements: Optional[Dict], exercise_library: Dict,
                    available_equipment: List[str]) -> Dict:
    """Create lower body workout day with specific exercises"""

    day = {'primary': [], 'circuits': []}

    if primary_movements is not None:
        if 'squat' not in primary_movements:
            primary_movements['squat'] = 1
            day['primary'].append('squat')
            current['quad'] += 1.5
            current['glute'] += 1.5
            current['lowback'] += 0.75
        elif 'hinge' not in primary_movements:
            primary_movements['hinge'] = 1
            day['primary'].append('hinge')
            current['hamstring'] += 1.5
            current['lowback'] += 1.5
            current['glute'] += 0.75
        minutes -= 15

    exercises_needed = []

    lower_lifts = {
        'squat': np.array([1, 1, 0.5, 0, 0]),
        'hinge': np.array([0, 0.5, 1, 1, 0]),
        'quad': np.array([1, 0, 0, 0, 0]),
        'hamstring': np.array([0, 0, 0, 1, 0]),
        'calf': np.array([0, 0, 0, 0, 1]),
    }

    muscles = ["quad", "glute", "lowback", "hamstring", "calf"]
    want = np.array([goal[m] for m in muscles])

    for _ in range(minutes // 7):
        normed_cur = normalize(current)
        cur = np.array([normed_cur[m] for m in muscles])
        need = want - cur

        scores = {name: cosine_similarity(need, vec) for name, vec in lower_lifts.items()}
        best_lift = max(scores, key=scores.get)

        exercises_needed.append(best_lift)
        for i, m in enumerate(muscles):
            current[m] += lower_lifts[best_lift][i]

    actual_exercises = select_exercises(exercises_needed, available_equipment, exercise_library)
    day['exercises'] = actual_exercises

    return day

def create_full_day(current: Dict, goal: Dict, minutes: int,
                   primary_movements: Optional[Dict], exercise_library: Dict,
                   available_equipment: List[str]) -> Dict:
    """Create full body workout day with specific exercises"""

    day = {'primary': [], 'circuits': []}

    if primary_movements is not None:
        # Lower body primary
        if 'squat' not in primary_movements:
            primary_movements['squat'] = 1
            day['primary'].append('squat')
            current['quad'] += 1.5
            current['glute'] += 1.5
            current['lowback'] += 0.75
        elif 'hinge' not in primary_movements:
            primary_movements['hinge'] = 1
            day['primary'].append('hinge')
            current['hamstring'] += 1.5
            current['lowback'] += 1.5
            current['glute'] += 0.75

        # Upper body primary
        if 'bench' not in primary_movements:
            primary_movements['bench'] = 1
            day['primary'].append('bench')
            current['frontdelt'] += 0.75
            current['tricep'] += 0.75
            current['chest'] += 1.5
        elif 'row' not in primary_movements:
            primary_movements['row'] = 1
            day['primary'].append('row')
            current['trap_rhomboid'] += 1.5
            current['lat'] += 0.75
            current['bicep'] += 0.75

        minutes -= 25

    exercises_needed = []
    all_muscles = [
        "chest", "tricep", "frontdelt", "lat", "bicep", "trap_rhomboid",
        "quad", "glute", "lowback", "hamstring", "calf"
    ]

    upper_lifts = {
        'hp': np.array([1, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0]),
        'vp': np.array([0, 0.5, 1, 0, 0, 0, 0, 0, 0, 0, 0]),
        'hpl': np.array([0, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 0, 0]),
        'vpl': np.array([0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]),
        'tricep': np.array([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        'bicep': np.array([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]),
    }

    lower_lifts = {
        'squat': np.array([0, 0, 0, 0, 0, 0, 1, 1, 0.5, 0, 0]),
        'hinge': np.array([0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1, 0]),
        'quad': np.array([0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]),
        'hamstring': np.array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]),
        'calf': np.array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]),
    }

    all_lifts = {**upper_lifts, **lower_lifts}

    for _ in range(minutes // 7):
        normed_cur = normalize(current)
        cur = np.array([normed_cur[m] for m in all_muscles])
        want = np.array([goal[m] for m in all_muscles])
        need = want - cur

        scores = {name: np.dot(need, vec) for name, vec in all_lifts.items()}
        best_lift = max(scores, key=scores.get)

        exercises_needed.append(best_lift)
        for i, m in enumerate(all_muscles):
            current[m] += all_lifts[best_lift][i]

    actual_exercises = select_exercises(exercises_needed, available_equipment, exercise_library)
    day['exercises'] = actual_exercises

    return day

def create_accessory_day(current: Dict, goal: Dict, minutes: int,
                        primary_movements: Optional[Dict], exercise_library: Dict,
                        available_equipment: List[str]) -> Dict:
    """Create accessory workout day targeting lagging muscles"""

    day = {'circuits': []}
    exercises_needed = []

    for _ in range(minutes // 7):
        normed_cur = normalize(current)

        # Find most lagging muscle group
        lag = (float('inf'), None)
        for k, v in normed_cur.items():
            if k in goal and goal[k] > 0:
                ratio = v / goal[k]
                if ratio < lag[0]:
                    lag = (ratio, k)

        if lag[1]:
            # Map muscle to exercise category
            muscle_to_category = {
                'chest': 'hp', 'frontdelt': 'vp', 'tricep': 'tricep',
                'lat': 'vpl', 'bicep': 'bicep', 'trap_rhomboid': 'hpl',
                'quad': 'quad', 'hamstring': 'hamstring', 'glute': 'squat',
                'calf': 'calf', 'core': 'core', 'middelt': 'middelt',
                'reardelt': 'reardelt', 'lowback': 'hinge'
            }

            category = muscle_to_category.get(lag[1], 'core')
            exercises_needed.append(category)
            current[lag[1]] += 1

    actual_exercises = select_exercises(exercises_needed, available_equipment, exercise_library)
    day['exercises'] = actual_exercises

    return day

def weekly_plan(plan_goals: Dict, exercise_library: Dict) -> List[WorkoutSession]:
    """Generate complete weekly workout plan with all details"""

    # Extract parameters
    days_per_week = plan_goals['days_per_week']
    high_level_focus = plan_goals['high_level_focus']
    muscle_target = plan_goals.get('muscle_target', [])
    available_equipment = plan_goals.get('equipment', ['all'])
    num_soldiers = plan_goals.get('num_soldiers', 20)
    strength_focus = plan_goals.get('strength_focus', 'hypertrophy')
    cardio_focus = plan_goals.get('cardio_focus', 'distance')

    # Get schedule template
    week = schedules[days_per_week][high_level_focus]
    detailed_week = []

    # Initialize tracking
    muscle_emphasis_goal = normalize(create_muscle_emphasis(muscle_target))
    muscle_emphasis_current = {
        'lat': 0, 'trap_rhomboid': 0, 'frontdelt': 0, 'chest': 0,
        'middelt': 0, 'reardelt': 0, 'bicep': 0, 'tricep': 0,
        'core': 0, 'quad': 0, 'calf': 0, 'hamstring': 0,
        'lowback': 0, 'glute': 0,
    }

    primary_movements = {} if (strength_focus in ['power', 'strength']) else None
    run_ct = 0

    # Generate each day
    for day_num, day in enumerate(week):
        workout_session = WorkoutSession(day=day_num + 1)

        for exercise in day:
            if exercise[0] == 'C':
                # Cardio workout
                if exercise[1] > 30:
                    cardio_type = "Distance"
                else:
                    run_ct += 1
                    cardio_type = ["Intervals", "Tempo", "HIIT"][min(run_ct - 1, 2)]

                workout_session.cardio = create_cardio_workout(
                    cardio_type, exercise[1], cardio_focus
                )

            elif exercise[0] == 'U':
                # Upper body strength
                day_plan = create_upper_day(
                    muscle_emphasis_current, muscle_emphasis_goal,
                    exercise[1], primary_movements, exercise_library,
                    available_equipment
                )

                if 'exercises' in day_plan:
                    circuits = create_circuits(day_plan['exercises'], num_soldiers)
                    workout_session.circuits.extend(circuits)

                workout_session.warmup = generate_warmup('U')

            elif exercise[0] == 'L':
                # Lower body strength
                day_plan = create_lower_day(
                    muscle_emphasis_current, muscle_emphasis_goal,
                    exercise[1], primary_movements, exercise_library,
                    available_equipment
                )

                if 'exercises' in day_plan:
                    circuits = create_circuits(day_plan['exercises'], num_soldiers)
                    workout_session.circuits.extend(circuits)

                workout_session.warmup = generate_warmup('L')

            elif exercise[0] == 'F':
                # Full body strength
                day_plan = create_full_day(
                    muscle_emphasis_current, muscle_emphasis_goal,
                    exercise[1], primary_movements, exercise_library,
                    available_equipment
                )

                if 'exercises' in day_plan:
                    circuits = create_circuits(day_plan['exercises'], num_soldiers)
                    workout_session.circuits.extend(circuits)

                workout_session.warmup = generate_warmup('F')

            elif exercise[0] == 'A':
                # Accessory work
                day_plan = create_accessory_day(
                    muscle_emphasis_current, muscle_emphasis_goal,
                    exercise[1], primary_movements, exercise_library,
                    available_equipment
                )

                if 'exercises' in day_plan:
                    circuits = create_circuits(day_plan['exercises'], num_soldiers, 2)
                    workout_session.circuits.extend(circuits)

                workout_session.warmup = generate_warmup('A')

        workout_session.cooldown = generate_cooldown()
        detailed_week.append(workout_session)

    return detailed_week

def format_workout_card(workout: WorkoutSession, strength_focus: str = 'hypertrophy') -> str:
    """Format workout as printable card"""

    output = []
    output.append(f"\\n{'='*60}")
    output.append(f"DAY {workout.day} WORKOUT")
    output.append(f"{'='*60}\\n")

    # Warmup
    if workout.warmup:
        output.append("WARMUP:")
        for item in workout.warmup:
            output.append(f"  • {item}")
        output.append("")

    # Circuits
    for i, circuit in enumerate(workout.circuits, 1):
        output.append(f"CIRCUIT {i} - {circuit.rounds} rounds")
        output.append(f"Work: {circuit.work_seconds}s | Rest: {circuit.rest_seconds}s | Round Rest: {circuit.rest_between_rounds}s")
        output.append("")

        for j, exercise in enumerate(circuit.exercises, 1):
            rep_range = get_rep_range(strength_focus, exercise.difficulty)
            output.append(f"  {j}. {exercise.name}")
            output.append(f"     Reps: {rep_range[0]}-{rep_range[1]} | Equipment: {', '.join(exercise.equipment) if exercise.equipment else 'Bodyweight'}")
            if exercise.instructions:
                output.append(f"     → {exercise.instructions}")
        output.append("")

    # Cardio
    if workout.cardio:
        output.append(f"CARDIO: {workout.cardio.type}")
        output.append(f"Duration: {workout.cardio.duration_minutes} minutes")
        if workout.cardio.details:
            for key, value in workout.cardio.details.items():
                if key != 'instructions':
                    output.append(f"  • {key}: {value}")
            if 'instructions' in workout.cardio.details:
                output.append(f"  → {workout.cardio.details['instructions']}")
        output.append("")

    # Cooldown
    if workout.cooldown:
        output.append("COOLDOWN:")
        for item in workout.cooldown:
            output.append(f"  • {item}")
        output.append("")

    # Intensity recommendation
    output.append(f"INTENSITY: {get_intensity_recommendation(strength_focus)}")
    output.append("")

    return "\\n".join(output)

def export_program_to_text(week_plan: List[WorkoutSession], strength_focus: str = 'hypertrophy') -> str:
    """Export full week program to text"""

    output = []
    output.append("\\n" + "="*60)
    output.append("WEEKLY WORKOUT PROGRAM")
    output.append("="*60 + "\\n")

    for workout in week_plan:
        output.append(format_workout_card(workout, strength_focus))

    return "\\n".join(output)
