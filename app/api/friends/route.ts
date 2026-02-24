import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    try {
        const friends = await prisma.friendship.findMany({
            where: { userId },
            include: {
                friend: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        const formattedFriends = friends.map((f) => ({
            id: f.friend.id,
            name: f.friend.name,
            code: f.friend.code,
            addedAt: f.createdAt.toISOString()
        }))

        return NextResponse.json({ friends: formattedFriends })
    } catch (error) {
        console.error("Error fetching friends:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, friendCode } = await req.json()

        if (!userId || !friendCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const friend = await prisma.user.findUnique({
            where: { code: friendCode }
        })

        if (!friend) {
            return NextResponse.json({ error: "No se encontro ningun usuario con ese codigo" }, { status: 404 })
        }

        if (friend.id === userId) {
            return NextResponse.json({ error: "No puedes agregarte a ti mismo" }, { status: 400 })
        }

        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                userId,
                friendId: friend.id
            }
        })

        if (existingFriendship) {
            return NextResponse.json({ error: "Este usuario ya esta en tu lista de amigos" }, { status: 400 })
        }

        // Creating symmetrical friendships if we want two-way right away, 
        // or just one-way (following style). Let's do symmetrical here for simplicity.
        await prisma.$transaction([
            prisma.friendship.create({
                data: {
                    userId,
                    friendId: friend.id
                }
            }),
            prisma.friendship.create({
                data: {
                    userId: friend.id,
                    friendId: userId
                }
            })
        ])

        return NextResponse.json({ success: true, message: "Amigo agregado correctamente" })
    } catch (error) {
        console.error("Error adding friend:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId, friendId } = await req.json()

        if (!userId || !friendId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Delete symmetrical friendship
        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting friend:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
