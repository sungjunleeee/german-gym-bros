import { NextRequest, NextResponse } from 'next/server';
import { deleteProgram } from '@/lib/store';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = deleteProgram(parseInt(id));
    if (success) return NextResponse.json({ status: 'success' });
    return NextResponse.json({ detail: 'Program not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
