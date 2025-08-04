import { createClient } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const notes = await prisma.note.findMany({
            where: { authorId: user.id },
            select: { id: true, title: true, content: true, createdAt: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(notes);
    } catch (error) {
        return new NextResponse("ERROR FETCHING NOTES", { status: 500 });
    }
}

export async function POST(request: Request) {
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

        const note = await prisma.note.create({
            data: {
                title,
                content,
                authorId: user.id,
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        return new NextResponse("ERROR CREATING NEW NOTE", { status: 500 });
    }
}