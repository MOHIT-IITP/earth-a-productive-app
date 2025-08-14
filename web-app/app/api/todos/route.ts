import { createClient } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server"


// function to get todos for current user
export async function GET(request: Request){
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const todos = await prisma.todo.findMany({
            where: { authorId: user.id },
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(todos);
    } catch (error) {
        return new NextResponse("Error fetching todos", {status: 500});
    }
}

// function to create todo in db
export async function POST(request: Request){
    const body = await request.json()
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const {title, description, completed, priority, dueDate, status, noteId} = body

    // creating new todo in database
    try {
        const todo = await prisma.todo.create({
            data: {
                title, 
                description,
                completed: Boolean(completed) ?? false,
                priority: priority ? String(priority).toUpperCase() as any : 'MEDIUM',
                status: status ? String(status).toUpperCase() as any : 'TODO',
                dueDate: dueDate ? new Date(dueDate) : undefined,
                authorId: user.id, 
                noteId,
            },
        })

        return NextResponse.json(todo);

    } catch (error) {
        return new NextResponse("Error creating todo", {status: 500});
    }
}

// function to delete todo in db
export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return new NextResponse("Todo ID is required", { status: 400 });
    }
    try {
        // ensure ownership
        const existing = await prisma.todo.findFirst({ where: { id, authorId: user.id } });
        if (!existing) {
            return new NextResponse("Not found", { status: 404 });
        }
        const deletedTodo = await prisma.todo.delete({ where: { id } });
        return NextResponse.json(deletedTodo);
    } catch (error) {
        return new NextResponse("Error deleting todo", { status: 500 });
    }
}

