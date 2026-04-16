import { NextRequest, NextResponse } from 'next/server';
import { deleteWorkout, updateWorkoutComponents } from '@/lib/store';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = deleteWorkout(parseInt(id));
    if (success) return NextResponse.json({ status: 'success' });
    return NextResponse.json({ detail: 'Workout not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { components } = await request.json();
    const success = updateWorkoutComponents(parseInt(id), components);
    if (success) return NextResponse.json({ status: 'success' });
    return NextResponse.json({ detail: 'Workout not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
