// Port of apps/api/engine.py to TypeScript
// Workout plan generation engine

// --- DATA STRUCTURES ---

export interface Exercise {
  name: string;
  equipment: string[];
  category: string;
  difficulty: number;
  primary_muscles: string[];
  activation: Record<string, number>;
  instructions: string;
  reps: string;
}

export interface Circuit {
  exercises: Exercise[];
  rounds: number;
  work_seconds: number;
  rest_seconds: number;
  rest_between_rounds: number;
}

export interface CardioWorkout {
  type: string;
  duration_minutes: number;
  details: Record<string, any>;
}

export interface WorkoutSession {
  day: number;
  circuits: Circuit[];
  cardio: CardioWorkout | null;
  warmup: string[];
  cooldown: string[];
}

// --- HELPERS ---

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function norm(a: number[]): number {
  return Math.sqrt(dotProduct(a, a));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return dotProduct(a, b) / (na * nb);
}

function normalize(emph: Record<string, number>): Record<string, number> {
  const total = Object.values(emph).reduce((s, v) => s + v, 0);
  if (!total) return emph;
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(emph)) {
    result[k] = v / total;
  }
  return result;
}

function cloneExercise(ex: Exercise): Exercise {
  return { ...ex, equipment: [...ex.equipment], primary_muscles: [...ex.primary_muscles], activation: { ...ex.activation } };
}

// --- EXERCISE LIBRARY ---

export function createExerciseLibrary(): Record<string, Exercise[]> {
  const hp: Exercise[] = [
    { name: 'Barbell Bench Press', equipment: ['barbell', 'plates', 'bench', 'rack'], category: 'hp', difficulty: 3, primary_muscles: ['chest', 'frontdelt', 'tricep'], activation: { chest: 1.0, frontdelt: 0.5, tricep: 0.5 }, instructions: 'Lie on bench, lower bar to chest, press up', reps: '' },
    { name: 'Dumbbell Bench Press', equipment: ['dumbbell', 'bench'], category: 'hp', difficulty: 2, primary_muscles: ['chest', 'frontdelt', 'tricep'], activation: { chest: 0.9, frontdelt: 0.5, tricep: 0.5 }, instructions: '', reps: '' },
    { name: 'Push-Up', equipment: [], category: 'hp', difficulty: 1, primary_muscles: ['chest', 'frontdelt', 'tricep'], activation: { chest: 0.7, frontdelt: 0.4, tricep: 0.4 }, instructions: '', reps: '' },
    { name: 'Weighted Push-Up', equipment: ['plates', 'weight vest'], category: 'hp', difficulty: 2, primary_muscles: ['chest', 'frontdelt', 'tricep'], activation: { chest: 0.8, frontdelt: 0.45, tricep: 0.45 }, instructions: '', reps: '' },
    { name: 'Dip', equipment: ['dip bar'], category: 'hp', difficulty: 3, primary_muscles: ['chest', 'frontdelt', 'tricep'], activation: { chest: 0.8, frontdelt: 0.4, tricep: 0.6 }, instructions: '', reps: '' },
    { name: 'Incline Dumbbell Press', equipment: ['dumbbell', 'incline bench'], category: 'hp', difficulty: 2, primary_muscles: ['chest', 'frontdelt', 'tricep'], activation: { chest: 0.8, frontdelt: 0.6, tricep: 0.4 }, instructions: '', reps: '' },
  ];

  const vp: Exercise[] = [
    { name: 'Overhead Press', equipment: ['barbell', 'plates', 'rack'], category: 'vp', difficulty: 3, primary_muscles: ['frontdelt', 'tricep'], activation: { frontdelt: 1.0, tricep: 0.5, middelt: 0.4 }, instructions: '', reps: '' },
    { name: 'Dumbbell Shoulder Press', equipment: ['dumbbell'], category: 'vp', difficulty: 2, primary_muscles: ['frontdelt', 'tricep'], activation: { frontdelt: 0.9, tricep: 0.5, middelt: 0.4 }, instructions: '', reps: '' },
    { name: 'Pike Push-Up', equipment: [], category: 'vp', difficulty: 2, primary_muscles: ['frontdelt', 'tricep'], activation: { frontdelt: 0.7, tricep: 0.4, middelt: 0.3 }, instructions: '', reps: '' },
    { name: 'Handstand Push-Up', equipment: ['wall'], category: 'vp', difficulty: 5, primary_muscles: ['frontdelt', 'tricep'], activation: { frontdelt: 0.9, tricep: 0.6, middelt: 0.4 }, instructions: '', reps: '' },
    { name: 'Arnold Press', equipment: ['dumbbell'], category: 'vp', difficulty: 3, primary_muscles: ['frontdelt', 'tricep'], activation: { frontdelt: 0.8, tricep: 0.4, middelt: 0.5 }, instructions: '', reps: '' },
  ];

  const hpl: Exercise[] = [
    { name: 'Barbell Row', equipment: ['barbell', 'plates'], category: 'hpl', difficulty: 3, primary_muscles: ['lat', 'trap_rhomboid', 'bicep'], activation: { lat: 0.5, trap_rhomboid: 1.0, bicep: 0.5, reardelt: 0.4 }, instructions: '', reps: '' },
    { name: 'Dumbbell Row', equipment: ['dumbbell'], category: 'hpl', difficulty: 2, primary_muscles: ['lat', 'trap_rhomboid', 'bicep'], activation: { lat: 0.5, trap_rhomboid: 0.9, bicep: 0.5, reardelt: 0.4 }, instructions: '', reps: '' },
    { name: 'Seated Cable Row', equipment: ['cable machine'], category: 'hpl', difficulty: 2, primary_muscles: ['lat', 'trap_rhomboid', 'bicep'], activation: { lat: 0.6, trap_rhomboid: 0.9, bicep: 0.4, reardelt: 0.3 }, instructions: '', reps: '' },
    { name: 'Inverted Row', equipment: ['bar'], category: 'hpl', difficulty: 2, primary_muscles: ['lat', 'trap_rhomboid', 'bicep'], activation: { lat: 0.5, trap_rhomboid: 0.8, bicep: 0.4, reardelt: 0.3 }, instructions: '', reps: '' },
    { name: 'Face Pull', equipment: ['cable machine', 'resistance band'], category: 'hpl', difficulty: 1, primary_muscles: ['trap_rhomboid', 'reardelt'], activation: { trap_rhomboid: 0.6, reardelt: 0.8, middelt: 0.3 }, instructions: '', reps: '' },
  ];

  const vpl: Exercise[] = [
    { name: 'Pull-Up', equipment: ['bar'], category: 'vpl', difficulty: 4, primary_muscles: ['lat', 'bicep'], activation: { lat: 1.0, bicep: 0.6, trap_rhomboid: 0.4 }, instructions: '', reps: '' },
    { name: 'Chin-Up', equipment: ['bar'], category: 'vpl', difficulty: 3, primary_muscles: ['lat', 'bicep'], activation: { lat: 0.9, bicep: 0.8, trap_rhomboid: 0.3 }, instructions: '', reps: '' },
    { name: 'Lat Pulldown', equipment: ['cable machine'], category: 'vpl', difficulty: 2, primary_muscles: ['lat', 'bicep'], activation: { lat: 0.9, bicep: 0.5, trap_rhomboid: 0.3 }, instructions: '', reps: '' },
    { name: 'Assisted Pull-Up', equipment: ['assistance machine'], category: 'vpl', difficulty: 2, primary_muscles: ['lat', 'bicep'], activation: { lat: 0.8, bicep: 0.5, trap_rhomboid: 0.3 }, instructions: '', reps: '' },
    { name: 'Weighted Pull-Up', equipment: ['bar', 'weight belt', 'plates'], category: 'vpl', difficulty: 5, primary_muscles: ['lat', 'bicep'], activation: { lat: 1.0, bicep: 0.7, trap_rhomboid: 0.5 }, instructions: '', reps: '' },
  ];

  const tricep: Exercise[] = [
    { name: 'Tricep Dip', equipment: ['dip bar'], category: 'tricep', difficulty: 3, primary_muscles: ['tricep'], activation: { tricep: 1.0, chest: 0.3 }, instructions: '', reps: '' },
    { name: 'Overhead Tricep Extension', equipment: ['dumbbell'], category: 'tricep', difficulty: 2, primary_muscles: ['tricep'], activation: { tricep: 0.9 }, instructions: '', reps: '' },
    { name: 'Tricep Pushdown', equipment: ['cable machine'], category: 'tricep', difficulty: 1, primary_muscles: ['tricep'], activation: { tricep: 0.8 }, instructions: '', reps: '' },
    { name: 'Close-Grip Push-Up', equipment: [], category: 'tricep', difficulty: 2, primary_muscles: ['tricep'], activation: { tricep: 0.7, chest: 0.4 }, instructions: '', reps: '' },
  ];

  const bicep: Exercise[] = [
    { name: 'Barbell Curl', equipment: ['barbell', 'plates'], category: 'bicep', difficulty: 2, primary_muscles: ['bicep'], activation: { bicep: 1.0 }, instructions: '', reps: '' },
    { name: 'Dumbbell Curl', equipment: ['dumbbell'], category: 'bicep', difficulty: 1, primary_muscles: ['bicep'], activation: { bicep: 0.9 }, instructions: '', reps: '' },
    { name: 'Hammer Curl', equipment: ['dumbbell'], category: 'bicep', difficulty: 2, primary_muscles: ['bicep'], activation: { bicep: 0.8 }, instructions: '', reps: '' },
    { name: 'Cable Curl', equipment: ['cable machine'], category: 'bicep', difficulty: 1, primary_muscles: ['bicep'], activation: { bicep: 0.8 }, instructions: '', reps: '' },
  ];

  const squat: Exercise[] = [
    { name: 'Barbell Back Squat', equipment: ['barbell', 'plates', 'rack'], category: 'squat', difficulty: 4, primary_muscles: ['quad', 'glute'], activation: { quad: 1.0, glute: 1.0, lowback: 0.5 }, instructions: '', reps: '' },
    { name: 'Goblet Squat', equipment: ['dumbbell', 'kettlebell'], category: 'squat', difficulty: 2, primary_muscles: ['quad', 'glute'], activation: { quad: 0.8, glute: 0.8, core: 0.4 }, instructions: '', reps: '' },
    { name: 'Bodyweight Squat', equipment: [], category: 'squat', difficulty: 1, primary_muscles: ['quad', 'glute'], activation: { quad: 0.6, glute: 0.6 }, instructions: '', reps: '' },
    { name: 'Bulgarian Split Squat', equipment: ['dumbbell'], category: 'squat', difficulty: 3, primary_muscles: ['quad', 'glute'], activation: { quad: 0.9, glute: 0.8 }, instructions: '', reps: '' },
    { name: 'Front Squat', equipment: ['barbell', 'plates', 'rack'], category: 'squat', difficulty: 4, primary_muscles: ['quad', 'glute'], activation: { quad: 1.0, glute: 0.8, core: 0.6 }, instructions: '', reps: '' },
  ];

  const hinge: Exercise[] = [
    { name: 'Barbell Deadlift', equipment: ['barbell', 'plates'], category: 'hinge', difficulty: 5, primary_muscles: ['hamstring', 'glute', 'lowback'], activation: { hamstring: 1.0, glute: 0.9, lowback: 1.0, trap_rhomboid: 0.4 }, instructions: '', reps: '' },
    { name: 'Romanian Deadlift', equipment: ['barbell', 'plates', 'dumbbell'], category: 'hinge', difficulty: 3, primary_muscles: ['hamstring', 'glute'], activation: { hamstring: 1.0, glute: 0.7, lowback: 0.8 }, instructions: '', reps: '' },
    { name: 'Kettlebell Swing', equipment: ['kettlebell'], category: 'hinge', difficulty: 2, primary_muscles: ['hamstring', 'glute'], activation: { hamstring: 0.7, glute: 0.9, lowback: 0.5 }, instructions: '', reps: '' },
    { name: 'Good Morning', equipment: ['barbell', 'plates'], category: 'hinge', difficulty: 3, primary_muscles: ['hamstring', 'glute', 'lowback'], activation: { hamstring: 0.8, glute: 0.6, lowback: 0.9 }, instructions: '', reps: '' },
  ];

  const quad: Exercise[] = [
    { name: 'Leg Extension', equipment: ['leg extension machine'], category: 'quad', difficulty: 1, primary_muscles: ['quad'], activation: { quad: 1.0 }, instructions: '', reps: '' },
    { name: 'Walking Lunge', equipment: ['dumbbell'], category: 'quad', difficulty: 2, primary_muscles: ['quad', 'glute'], activation: { quad: 0.8, glute: 0.6 }, instructions: '', reps: '' },
    { name: 'Step-Up', equipment: ['box', 'dumbbell'], category: 'quad', difficulty: 2, primary_muscles: ['quad', 'glute'], activation: { quad: 0.7, glute: 0.6 }, instructions: '', reps: '' },
  ];

  const hamstring: Exercise[] = [
    { name: 'Leg Curl', equipment: ['leg curl machine'], category: 'hamstring', difficulty: 1, primary_muscles: ['hamstring'], activation: { hamstring: 1.0 }, instructions: '', reps: '' },
    { name: 'Nordic Curl', equipment: ['partner', 'anchor'], category: 'hamstring', difficulty: 4, primary_muscles: ['hamstring'], activation: { hamstring: 1.0 }, instructions: '', reps: '' },
    { name: 'Glute-Ham Raise', equipment: ['GHD'], category: 'hamstring', difficulty: 3, primary_muscles: ['hamstring', 'glute'], activation: { hamstring: 0.9, glute: 0.6 }, instructions: '', reps: '' },
  ];

  const calf: Exercise[] = [
    { name: 'Calf Raise', equipment: ['calf machine'], category: 'calf', difficulty: 1, primary_muscles: ['calf'], activation: { calf: 1.0 }, instructions: '', reps: '' },
    { name: 'Seated Calf Raise', equipment: ['seated calf machine'], category: 'calf', difficulty: 1, primary_muscles: ['calf'], activation: { calf: 0.9 }, instructions: '', reps: '' },
    { name: 'Jump Rope', equipment: ['jump rope'], category: 'calf', difficulty: 2, primary_muscles: ['calf'], activation: { calf: 0.7 }, instructions: '', reps: '' },
  ];

  const core: Exercise[] = [
    { name: 'Plank', equipment: [], category: 'core', difficulty: 1, primary_muscles: ['core'], activation: { core: 1.0 }, instructions: '', reps: '' },
    { name: 'Hanging Leg Raise', equipment: ['bar'], category: 'core', difficulty: 3, primary_muscles: ['core'], activation: { core: 1.0 }, instructions: '', reps: '' },
    { name: 'Ab Wheel', equipment: ['ab wheel'], category: 'core', difficulty: 4, primary_muscles: ['core'], activation: { core: 1.0 }, instructions: '', reps: '' },
    { name: 'Russian Twist', equipment: ['dumbbell', 'plate'], category: 'core', difficulty: 2, primary_muscles: ['core'], activation: { core: 0.8 }, instructions: '', reps: '' },
    { name: 'Dead Bug', equipment: [], category: 'core', difficulty: 1, primary_muscles: ['core'], activation: { core: 0.7 }, instructions: '', reps: '' },
  ];

  const middelt: Exercise[] = [
    { name: 'Lateral Raise', equipment: ['dumbbell', 'cable'], category: 'middelt', difficulty: 1, primary_muscles: ['middelt'], activation: { middelt: 1.0 }, instructions: '', reps: '' },
    { name: 'Upright Row', equipment: ['barbell', 'dumbbell'], category: 'middelt', difficulty: 2, primary_muscles: ['middelt', 'trap_rhomboid'], activation: { middelt: 0.8, trap_rhomboid: 0.6 }, instructions: '', reps: '' },
  ];

  const reardelt: Exercise[] = [
    { name: 'Rear Delt Fly', equipment: ['dumbbell', 'cable'], category: 'reardelt', difficulty: 1, primary_muscles: ['reardelt'], activation: { reardelt: 1.0 }, instructions: '', reps: '' },
    { name: 'Reverse Pec Deck', equipment: ['pec deck machine'], category: 'reardelt', difficulty: 1, primary_muscles: ['reardelt'], activation: { reardelt: 0.9 }, instructions: '', reps: '' },
  ];

  return { hp, vp, hpl, vpl, tricep, bicep, squat, hinge, quad, hamstring, calf, core, middelt, reardelt };
}

// --- GENERATORS ---

function createCardioWorkout(workoutType: string, durationMinutes: number, focus: string = 'distance'): CardioWorkout {
  if (workoutType === 'Distance') {
    const pace = focus === 'distance' ? 'conversational' : 'moderate';
    return {
      type: 'Distance Run',
      duration_minutes: durationMinutes,
      details: {
        distance_km: durationMinutes * (focus === 'distance' ? 0.12 : 0.15),
        pace,
        effort: focus === 'distance' ? '60-70% max HR' : '70-80% max HR',
        instructions: `Run at ${pace} pace for ${durationMinutes} minutes`,
      },
    };
  } else if (workoutType === 'Intervals') {
    const workTime = durationMinutes > 30 ? 400 : 200;
    const restTime = Math.floor(workTime / 2);
    const rounds = Math.floor((durationMinutes * 60) / (workTime + restTime));
    return {
      type: 'Interval Training',
      duration_minutes: durationMinutes,
      details: {
        structure: `${workTime}m sprint / ${restTime}m recovery`,
        rounds,
        effort: '85-95% max HR during work',
        instructions: `Sprint ${workTime}m, recover ${restTime}m, repeat ${rounds} times`,
      },
    };
  } else if (workoutType === 'Tempo') {
    return {
      type: 'Tempo Run',
      duration_minutes: durationMinutes,
      details: {
        structure: '10min warmup / tempo blocks / cooldown',
        tempo_duration: durationMinutes - 10,
        pace: 'comfortably hard',
        effort: '80-85% max HR',
        instructions: `10min easy, then ${durationMinutes - 10}min at tempo pace`,
      },
    };
  } else if (workoutType === 'HIIT') {
    const work = 30;
    const rest = 30;
    const rounds = durationMinutes;
    return {
      type: 'HIIT',
      duration_minutes: durationMinutes,
      details: {
        structure: `${work}s max effort / ${rest}s rest`,
        rounds,
        effort: '90-100% max HR during work',
        exercises: ['burpees', 'mountain climbers', 'jump squats', 'high knees'],
        instructions: `Rotate through exercises: ${work}s on, ${rest}s off, ${rounds} rounds`,
      },
    };
  }
  return { type: workoutType, duration_minutes: durationMinutes, details: {} };
}

function filterExercisesByEquipment(exercises: Exercise[], availableEquipment: string[]): Exercise[] {
  if (!availableEquipment || availableEquipment.includes('all')) return exercises;
  const available = new Set(availableEquipment);
  const filtered = exercises.filter((ex) => !ex.equipment.length || ex.equipment.every((eq) => available.has(eq)));
  return filtered.length ? filtered : exercises;
}

function createCircuits(exercises: Exercise[], numSoldiers: number = 20, circuitSize: number = 3): Circuit[] {
  const circuits: Circuit[] = [];
  for (let i = 0; i < exercises.length; i += circuitSize) {
    const circuitExercises = exercises.slice(i, i + circuitSize);
    const soldiersPerStation = Math.max(2, Math.floor(numSoldiers / circuitExercises.length));
    const restSeconds = soldiersPerStation <= 2 ? 15 : 30;
    circuits.push({
      exercises: circuitExercises,
      rounds: 3,
      work_seconds: 45,
      rest_seconds: restSeconds,
      rest_between_rounds: numSoldiers > 20 ? 90 : 60,
    });
  }
  return circuits;
}

function getRepRange(strengthFocus: string, exerciseDifficulty: number): [number, number] {
  const repRanges: Record<string, [number, number]> = {
    endurance: [15, 25],
    hypertrophy: [8, 12],
    power: [3, 6],
    strength: [1, 5],
  };
  const base = repRanges[strengthFocus] || [8, 12];
  if (exerciseDifficulty >= 4) {
    return [Math.max(1, base[0] - 2), base[1] - 2];
  }
  return base;
}

function generateWarmup(workoutType: string): string[] {
  const warmup = [
    '5 minutes light cardio (jog, jump rope, or bike)',
    'Arm circles - 10 each direction',
    'Leg swings - 10 each leg, each direction',
    'Hip circles - 10 each direction',
  ];
  if (workoutType.includes('U') || workoutType.includes('F')) {
    warmup.push('Band pull-aparts - 15 reps', 'Scapular push-ups - 10 reps', 'Empty bar shoulder press - 10 reps', 'Empty bar rows - 10 reps');
  }
  if (workoutType.includes('L') || workoutType.includes('F')) {
    warmup.push('Bodyweight squats - 15 reps', 'Walking lunges - 10 each leg', 'Glute bridges - 15 reps', 'Leg swings - 10 each direction');
  }
  return warmup;
}

function generateCooldown(): string[] {
  return [
    '5 minutes easy cardio (walk or light jog)',
    'Chest stretch - 30 seconds each side',
    'Shoulder stretch - 30 seconds each side',
    'Hip flexor stretch - 30 seconds each side',
    'Hamstring stretch - 30 seconds each side',
    'Quad stretch - 30 seconds each side',
    "Child's pose - 1 minute",
    'Deep breathing - 2 minutes',
  ];
}

function selectExercises(categories: string[], availableEquipment: string[], exerciseLibrary: Record<string, Exercise[]>): Exercise[] {
  const selected: Exercise[] = [];
  for (const category of categories) {
    const categoryExercises = exerciseLibrary[category] || [];
    const available = filterExercisesByEquipment(categoryExercises, availableEquipment);
    if (available.length) {
      selected.push(cloneExercise(available[0]));
    }
  }
  return selected;
}

// --- PLANNING LOGIC ---

const baseline: Record<string, number> = {
  lat: 2, trap_rhomboid: 2, frontdelt: 2, chest: 2,
  middelt: 1, reardelt: 1, bicep: 1, tricep: 1,
  core: 2, quad: 2, calf: 1, hamstring: 2,
  lowback: 1, glute: 2,
};

const schedules: Record<number, Record<string, [string, number][][]>> = {
  3: {
    strength: [[['F', 55], ['C', 20]], [['F', 50], ['C', 25]], [['F', 55], ['C', 20]]],
    cardio: [[['C', 30], ['F', 45]], [['C', 40], ['F', 35]], [['C', 30], ['F', 45]]],
  },
  4: {
    strength: [[['L', 55], ['C', 20]], [['U', 55], ['C', 20]], [['F', 75]], [['C', 40], ['A', 35]]],
    cardio: [[['C', 30], ['L', 45]], [['C', 30], ['U', 45]], [['F', 75]], [['C', 40], ['A', 35]]],
  },
  5: {
    strength: [[['L', 50], ['C', 25]], [['U', 55], ['C', 20]], [['C', 75]], [['L', 55], ['C', 20]], [['U', 50], ['C', 25]]],
    cardio: [[['F', 55], ['C', 20]], [['C', 75]], [['F', 75]], [['C', 45], ['A', 30]], [['F', 55], ['C', 20]]],
  },
};

function createMuscleEmphasis(muscles: string[]): Record<string, number> {
  const emphasis = { ...baseline };
  for (const muscle of muscles) {
    if (muscle in emphasis) emphasis[muscle] *= 1.5;
  }
  return emphasis;
}

function createUpperDay(
  current: Record<string, number>, goal: Record<string, number>, minutes: number,
  primaryMovements: Record<string, number> | null, exerciseLibrary: Record<string, Exercise[]>,
  availableEquipment: string[]
): { exercises: Exercise[] } {
  const day: { exercises: Exercise[] } = { exercises: [] };

  if (primaryMovements !== null) {
    if (!('bench' in primaryMovements)) {
      primaryMovements['bench'] = 1;
      current['frontdelt'] += 0.75;
      current['tricep'] += 0.75;
      current['chest'] += 1.5;
    } else if (!('row' in primaryMovements)) {
      primaryMovements['row'] = 1;
      current['trap_rhomboid'] += 1.5;
      current['lat'] += 0.75;
      current['bicep'] += 0.75;
    }
    minutes -= 15;
  }

  const exercisesNeeded: string[] = [];
  const upperLifts: Record<string, number[]> = {
    hp: [1, 0.5, 0.5, 0, 0, 0],
    vp: [0, 0.5, 1, 0, 0, 0],
    hpl: [0, 0, 0, 0.5, 0.5, 1],
    vpl: [0, 0, 0, 1, 1, 0],
    tricep: [0, 1, 0, 0, 0, 0],
    bicep: [0, 0, 0, 0, 1, 0],
    middelt: [0, 0.3, 0.5, 0, 0, 0],
    reardelt: [0, 0, 0, 0.3, 0, 0.6],
  };
  const muscles = ['chest', 'tricep', 'frontdelt', 'lat', 'bicep', 'trap_rhomboid'];
  const want = muscles.map((m) => goal[m] || 0);

  for (let i = 0; i < Math.floor(minutes / 7); i++) {
    const normedCur = normalize(current);
    const cur = muscles.map((m) => normedCur[m] || 0);
    const need = want.map((w, j) => w - cur[j]);
    let bestLift = 'hp';
    let bestScore = -Infinity;
    for (const [name, vec] of Object.entries(upperLifts)) {
      const score = cosineSimilarity(need, vec);
      if (score > bestScore) { bestScore = score; bestLift = name; }
    }
    exercisesNeeded.push(bestLift);
    for (let j = 0; j < muscles.length; j++) {
      current[muscles[j]] += upperLifts[bestLift][j];
    }
  }

  day.exercises = selectExercises(exercisesNeeded, availableEquipment, exerciseLibrary);
  return day;
}

function createLowerDay(
  current: Record<string, number>, goal: Record<string, number>, minutes: number,
  primaryMovements: Record<string, number> | null, exerciseLibrary: Record<string, Exercise[]>,
  availableEquipment: string[]
): { exercises: Exercise[] } {
  const day: { exercises: Exercise[] } = { exercises: [] };

  if (primaryMovements !== null) {
    if (!('squat' in primaryMovements)) {
      primaryMovements['squat'] = 1;
      current['quad'] += 1.5;
      current['glute'] += 1.5;
      current['lowback'] += 0.75;
    } else if (!('hinge' in primaryMovements)) {
      primaryMovements['hinge'] = 1;
      current['hamstring'] += 1.5;
      current['lowback'] += 1.5;
      current['glute'] += 0.75;
    }
    minutes -= 15;
  }

  const exercisesNeeded: string[] = [];
  const lowerLifts: Record<string, number[]> = {
    squat: [1, 1, 0.5, 0, 0],
    hinge: [0, 0.5, 1, 1, 0],
    quad: [1, 0, 0, 0, 0],
    hamstring: [0, 0, 0, 1, 0],
    calf: [0, 0, 0, 0, 1],
  };
  const muscles = ['quad', 'glute', 'lowback', 'hamstring', 'calf'];
  const want = muscles.map((m) => goal[m] || 0);

  for (let i = 0; i < Math.floor(minutes / 7); i++) {
    const normedCur = normalize(current);
    const cur = muscles.map((m) => normedCur[m] || 0);
    const need = want.map((w, j) => w - cur[j]);
    let bestLift = 'squat';
    let bestScore = -Infinity;
    for (const [name, vec] of Object.entries(lowerLifts)) {
      const score = cosineSimilarity(need, vec);
      if (score > bestScore) { bestScore = score; bestLift = name; }
    }
    exercisesNeeded.push(bestLift);
    for (let j = 0; j < muscles.length; j++) {
      current[muscles[j]] += lowerLifts[bestLift][j];
    }
  }

  day.exercises = selectExercises(exercisesNeeded, availableEquipment, exerciseLibrary);
  return day;
}

function createFullDay(
  current: Record<string, number>, goal: Record<string, number>, minutes: number,
  primaryMovements: Record<string, number> | null, exerciseLibrary: Record<string, Exercise[]>,
  availableEquipment: string[]
): { exercises: Exercise[] } {
  const day: { exercises: Exercise[] } = { exercises: [] };

  if (primaryMovements !== null) {
    if (!('squat' in primaryMovements)) {
      primaryMovements['squat'] = 1;
      current['quad'] += 1.5;
      current['glute'] += 1.5;
      current['lowback'] += 0.75;
    } else if (!('hinge' in primaryMovements)) {
      primaryMovements['hinge'] = 1;
      current['hamstring'] += 1.5;
      current['lowback'] += 1.5;
      current['glute'] += 0.75;
    }
    if (!('bench' in primaryMovements)) {
      primaryMovements['bench'] = 1;
      current['frontdelt'] += 0.75;
      current['tricep'] += 0.75;
      current['chest'] += 1.5;
    } else if (!('row' in primaryMovements)) {
      primaryMovements['row'] = 1;
      current['trap_rhomboid'] += 1.5;
      current['lat'] += 0.75;
      current['bicep'] += 0.75;
    }
    minutes -= 25;
  }

  const exercisesNeeded: string[] = [];
  const allMuscles = ['chest', 'tricep', 'frontdelt', 'lat', 'bicep', 'trap_rhomboid', 'quad', 'glute', 'lowback', 'hamstring', 'calf'];

  const allLifts: Record<string, number[]> = {
    hp: [1, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0],
    vp: [0, 0.5, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    hpl: [0, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 0, 0],
    vpl: [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    tricep: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bicep: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    squat: [0, 0, 0, 0, 0, 0, 1, 1, 0.5, 0, 0],
    hinge: [0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1, 0],
    quad: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    hamstring: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    calf: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  };

  for (let i = 0; i < Math.floor(minutes / 7); i++) {
    const normedCur = normalize(current);
    const cur = allMuscles.map((m) => normedCur[m] || 0);
    const want = allMuscles.map((m) => goal[m] || 0);
    const need = want.map((w, j) => w - cur[j]);
    let bestLift = 'hp';
    let bestScore = -Infinity;
    for (const [name, vec] of Object.entries(allLifts)) {
      const score = dotProduct(need, vec);
      if (score > bestScore) { bestScore = score; bestLift = name; }
    }
    exercisesNeeded.push(bestLift);
    for (let j = 0; j < allMuscles.length; j++) {
      current[allMuscles[j]] += allLifts[bestLift][j];
    }
  }

  day.exercises = selectExercises(exercisesNeeded, availableEquipment, exerciseLibrary);
  return day;
}

function createAccessoryDay(
  current: Record<string, number>, goal: Record<string, number>, minutes: number,
  _primaryMovements: Record<string, number> | null, exerciseLibrary: Record<string, Exercise[]>,
  availableEquipment: string[]
): { exercises: Exercise[] } {
  const day: { exercises: Exercise[] } = { exercises: [] };
  const exercisesNeeded: string[] = [];

  const muscleToCategory: Record<string, string> = {
    chest: 'hp', frontdelt: 'vp', tricep: 'tricep',
    lat: 'vpl', bicep: 'bicep', trap_rhomboid: 'hpl',
    quad: 'quad', hamstring: 'hamstring', glute: 'squat',
    calf: 'calf', core: 'core', middelt: 'middelt',
    reardelt: 'reardelt', lowback: 'hinge',
  };

  for (let i = 0; i < Math.floor(minutes / 7); i++) {
    const normedCur = normalize(current);
    let lagRatio = Infinity;
    let lagMuscle: string | null = null;
    for (const [k, v] of Object.entries(normedCur)) {
      if (k in goal && goal[k] > 0) {
        const ratio = v / goal[k];
        if (ratio < lagRatio) { lagRatio = ratio; lagMuscle = k; }
      }
    }
    if (lagMuscle) {
      const category = muscleToCategory[lagMuscle] || 'core';
      exercisesNeeded.push(category);
      current[lagMuscle] += 1;
    }
  }

  day.exercises = selectExercises(exercisesNeeded, availableEquipment, exerciseLibrary);
  return day;
}

// --- MAIN PLAN GENERATOR ---

export function weeklyPlan(planGoals: Record<string, any>, exerciseLibrary: Record<string, Exercise[]>): WorkoutSession[] {
  const daysPerWeek = planGoals.days_per_week;
  const highLevelFocus = planGoals.high_level_focus;
  const muscleTarget = planGoals.muscle_target || [];
  const availableEquipment = planGoals.equipment || ['all'];
  const numSoldiers = planGoals.num_soldiers || 20;
  const strengthFocus = planGoals.strength_focus || 'hypertrophy';
  const cardioFocus = planGoals.cardio_focus || 'distance';

  const week = schedules[daysPerWeek]?.[highLevelFocus];
  if (!week) return [];

  const detailedWeek: WorkoutSession[] = [];
  const muscleEmphasisGoal = normalize(createMuscleEmphasis(muscleTarget));
  const muscleEmphasisCurrent: Record<string, number> = {
    lat: 0, trap_rhomboid: 0, frontdelt: 0, chest: 0,
    middelt: 0, reardelt: 0, bicep: 0, tricep: 0,
    core: 0, quad: 0, calf: 0, hamstring: 0,
    lowback: 0, glute: 0,
  };

  const primaryMovements: Record<string, number> | null =
    (strengthFocus === 'power' || strengthFocus === 'strength') ? {} : null;
  let runCt = 0;

  for (let dayNum = 0; dayNum < week.length; dayNum++) {
    const daySchedule = week[dayNum] as [string, number][];
    const workoutSession: WorkoutSession = { day: dayNum + 1, circuits: [], cardio: null, warmup: [], cooldown: [] };

    for (const [exerciseType, duration] of daySchedule) {
      if (exerciseType === 'C') {
        let cardioType: string;
        if (duration > 30) {
          cardioType = 'Distance';
        } else {
          runCt++;
          cardioType = ['Intervals', 'Tempo', 'HIIT'][Math.min(runCt - 1, 2)];
        }
        workoutSession.cardio = createCardioWorkout(cardioType, duration, cardioFocus);
      } else if (exerciseType === 'U') {
        const dayPlan = createUpperDay(muscleEmphasisCurrent, muscleEmphasisGoal, duration, primaryMovements, exerciseLibrary, availableEquipment);
        if (dayPlan.exercises.length) {
          workoutSession.circuits.push(...createCircuits(dayPlan.exercises, numSoldiers));
        }
        workoutSession.warmup = generateWarmup('U');
      } else if (exerciseType === 'L') {
        const dayPlan = createLowerDay(muscleEmphasisCurrent, muscleEmphasisGoal, duration, primaryMovements, exerciseLibrary, availableEquipment);
        if (dayPlan.exercises.length) {
          workoutSession.circuits.push(...createCircuits(dayPlan.exercises, numSoldiers));
        }
        workoutSession.warmup = generateWarmup('L');
      } else if (exerciseType === 'F') {
        const dayPlan = createFullDay(muscleEmphasisCurrent, muscleEmphasisGoal, duration, primaryMovements, exerciseLibrary, availableEquipment);
        if (dayPlan.exercises.length) {
          workoutSession.circuits.push(...createCircuits(dayPlan.exercises, numSoldiers));
        }
        workoutSession.warmup = generateWarmup('F');
      } else if (exerciseType === 'A') {
        const dayPlan = createAccessoryDay(muscleEmphasisCurrent, muscleEmphasisGoal, duration, primaryMovements, exerciseLibrary, availableEquipment);
        if (dayPlan.exercises.length) {
          workoutSession.circuits.push(...createCircuits(dayPlan.exercises, numSoldiers, 2));
        }
        workoutSession.warmup = generateWarmup('A');
      }
    }

    workoutSession.cooldown = generateCooldown();
    detailedWeek.push(workoutSession);
  }

  // Populate reps
  for (const workout of detailedWeek) {
    for (const circuit of workout.circuits) {
      for (const exercise of circuit.exercises) {
        const repRange = getRepRange(strengthFocus, exercise.difficulty);
        exercise.reps = `${repRange[0]}-${repRange[1]}`;
      }
    }
  }

  return detailedWeek;
}

export function exportProgramToText(weekPlan: WorkoutSession[], strengthFocus: string = 'hypertrophy'): string {
  const lines: string[] = [];
  lines.push('\n' + '='.repeat(60));
  lines.push('WEEKLY WORKOUT PROGRAM');
  lines.push('='.repeat(60) + '\n');

  for (const workout of weekPlan) {
    lines.push('\n' + '='.repeat(60));
    lines.push(`DAY ${workout.day} WORKOUT`);
    lines.push('='.repeat(60) + '\n');

    if (workout.warmup.length) {
      lines.push('WARMUP:');
      for (const item of workout.warmup) lines.push(`  • ${item}`);
      lines.push('');
    }

    for (let i = 0; i < workout.circuits.length; i++) {
      const circuit = workout.circuits[i];
      lines.push(`CIRCUIT ${i + 1} - ${circuit.rounds} rounds`);
      lines.push(`Work: ${circuit.work_seconds}s | Rest: ${circuit.rest_seconds}s | Round Rest: ${circuit.rest_between_rounds}s`);
      lines.push('');
      for (let j = 0; j < circuit.exercises.length; j++) {
        const ex = circuit.exercises[j];
        const repsStr = ex.reps || (() => { const r = getRepRange(strengthFocus, ex.difficulty); return `${r[0]}-${r[1]}`; })();
        lines.push(`  ${j + 1}. ${ex.name}`);
        lines.push(`     Reps: ${repsStr} | Equipment: ${ex.equipment.length ? ex.equipment.join(', ') : 'Bodyweight'}`);
        if (ex.instructions) lines.push(`     → ${ex.instructions}`);
      }
      lines.push('');
    }

    if (workout.cardio) {
      lines.push(`CARDIO: ${workout.cardio.type}`);
      lines.push(`Duration: ${workout.cardio.duration_minutes} minutes`);
      for (const [key, value] of Object.entries(workout.cardio.details)) {
        if (key !== 'instructions') lines.push(`  • ${key}: ${value}`);
      }
      if (workout.cardio.details.instructions) lines.push(`  → ${workout.cardio.details.instructions}`);
      lines.push('');
    }

    if (workout.cooldown.length) {
      lines.push('COOLDOWN:');
      for (const item of workout.cooldown) lines.push(`  • ${item}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
