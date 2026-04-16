// In-memory store replacing SQLite database
// Data persists within a single server process lifetime (resets on redeploy)

interface WorkoutComponent {
  id: number;
  workout_id: number;
  component_type: string;
  order_index: number;
  data: any;
}

interface Workout {
  id: number;
  program_id: number;
  day_number: number;
  name: string;
  focus: string;
  components: WorkoutComponent[];
}

interface Program {
  id: number;
  name: string;
  description: string;
  created_at: string;
  workouts: Workout[];
}

let programs: Program[] = [];
let nextProgramId = 1;
let nextWorkoutId = 1;
let nextComponentId = 1;

export function saveProgramToDb(programName: string, description: string, planData: any[]): number {
  const programId = nextProgramId++;
  const program: Program = {
    id: programId,
    name: programName,
    description: description,
    created_at: new Date().toISOString(),
    workouts: [],
  };

  for (const day of planData) {
    const dayNum = day.day;
    const focus = day.focus || '';
    const workoutId = nextWorkoutId++;
    const workout: Workout = {
      id: workoutId,
      program_id: programId,
      day_number: dayNum,
      name: `Day ${dayNum}`,
      focus,
      components: [],
    };

    // Warmup
    if (day.warmup) {
      workout.components.push({
        id: nextComponentId++,
        workout_id: workoutId,
        component_type: 'warmup',
        order_index: 0,
        data: day.warmup,
      });
    }

    // Circuits
    const circuits = day.circuits || [];
    for (let i = 0; i < circuits.length; i++) {
      workout.components.push({
        id: nextComponentId++,
        workout_id: workoutId,
        component_type: 'circuit',
        order_index: i + 1,
        data: circuits[i],
      });
    }

    // Cardio
    if (day.cardio) {
      workout.components.push({
        id: nextComponentId++,
        workout_id: workoutId,
        component_type: 'cardio',
        order_index: 99,
        data: day.cardio,
      });
    }

    // Cooldown
    if (day.cooldown) {
      workout.components.push({
        id: nextComponentId++,
        workout_id: workoutId,
        component_type: 'cooldown',
        order_index: 100,
        data: day.cooldown,
      });
    }

    program.workouts.push(workout);
  }

  programs.push(program);
  return programId;
}

export function getLatestProgram(): Program | null {
  if (programs.length === 0) return null;
  return programs[programs.length - 1];
}

export function deleteWorkout(workoutId: number): boolean {
  for (const program of programs) {
    const idx = program.workouts.findIndex((w) => w.id === workoutId);
    if (idx !== -1) {
      program.workouts.splice(idx, 1);
      if (program.workouts.length === 0) {
        programs = programs.filter((p) => p.id !== program.id);
      }
      return true;
    }
  }
  return false;
}

export function deleteProgram(programId: number): boolean {
  const before = programs.length;
  programs = programs.filter((p) => p.id !== programId);
  return programs.length < before;
}

export function updateWorkoutComponents(workoutId: number, components: any[]): boolean {
  for (const program of programs) {
    const workout = program.workouts.find((w) => w.id === workoutId);
    if (workout) {
      workout.components = components.map((comp) => ({
        id: nextComponentId++,
        workout_id: workoutId,
        component_type: comp.component_type,
        order_index: comp.order_index ?? 0,
        data: comp.data,
      }));
      return true;
    }
  }
  return false;
}
