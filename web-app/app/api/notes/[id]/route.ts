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

    const { title, content } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        authorId: user.id,
      },
    });

    if (!existingNote) {
      return new NextResponse("Note not found", { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    return new NextResponse("ERROR UPDATING NOTE", { status: 500 });
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

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        authorId: user.id,
      },
    });

    if (!existingNote) {
      return new NextResponse("Note not found", { status: 404 });
    }

    await prisma.note.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("ERROR DELETING NOTE", { status: 500 });
  }
} 