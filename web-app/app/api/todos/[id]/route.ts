import { createClient } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existing = await prisma.todo.findFirst({
      where: { id: params.id, authorId: user.id },
    });
    if (!existing) {
      return new NextResponse("Todo not found", { status: 404 });
    }

    const { title, description, completed, priority, status, dueDate, noteId } = body;

    const updated = await prisma.todo.update({
      where: { id: params.id },
      data: {
        title,
        description,
        completed,
        priority: priority ? String(priority).toUpperCase() as any : undefined,
        status: status ? String(status).toUpperCase() as any : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        noteId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("ERROR UPDATING TODO", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existing = await prisma.todo.findFirst({
      where: { id: params.id, authorId: user.id },
    });
    if (!existing) {
      return new NextResponse("Todo not found", { status: 404 });
    }

    await prisma.todo.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("ERROR DELETING TODO", { status: 500 });
  }
}


