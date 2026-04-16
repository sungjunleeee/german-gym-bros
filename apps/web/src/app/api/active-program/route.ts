import { NextResponse } from 'next/server';
import { getLatestProgram } from '@/lib/store';

export async function GET() {
  try {
    const program = getLatestProgram();
    return NextResponse.json(program);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
