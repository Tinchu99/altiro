import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    try {
        // 1. Accepted Friends
        const acceptedFriendships = await prisma.friendship.findMany({
            where: {
                status: "ACCEPTED",
                OR: [
                    { userId },
                    { friendId: userId }
                ]
            },
            include: {
                user: { select: { id: true, name: true, code: true } },
                friend: { select: { id: true, name: true, code: true } }
            },
            orderBy: { createdAt: "desc" }
        })

        const friends = acceptedFriendships.map((f) => {
            // Determine who is the other person
            const peer = f.userId === userId ? f.friend : f.user
            return {
                id: peer.id,
                name: peer.name,
                code: peer.code,
                addedAt: f.createdAt.toISOString(),
                friendshipId: f.id
            }
        })

        // 2. Pending Requests Sent by Me
        const sentFriendships = await prisma.friendship.findMany({
            where: {
                userId,
                status: "PENDING"
            },
            include: {
                friend: { select: { id: true, name: true, code: true } }
            },
            orderBy: { createdAt: "desc" }
        })

        const pendingSent = sentFriendships.map(f => ({
            id: f.friend.id,
            name: f.friend.name,
            code: f.friend.code,
            sentAt: f.createdAt.toISOString(),
            friendshipId: f.id
        }))

        // 3. Pending Requests Received by Me
        const receivedFriendships = await prisma.friendship.findMany({
            where: {
                friendId: userId,
                status: "PENDING"
            },
            include: {
                user: { select: { id: true, name: true, code: true } } // I need info of the sender
            },
            orderBy: { createdAt: "desc" }
        })

        const pendingReceived = receivedFriendships.map(f => ({
            id: f.user.id,
            name: f.user.name,
            code: f.user.code,
            receivedAt: f.createdAt.toISOString(),
            friendshipId: f.id
        }))

        return NextResponse.json({ friends, pendingSent, pendingReceived })
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

        // Check if any relationship exists between both
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId: friend.id },
                    { userId: friend.id, friendId: userId }
                ]
            }
        })

        if (existingFriendship) {
            if (existingFriendship.status === "ACCEPTED") {
                return NextResponse.json({ error: "Este usuario ya esta en tu lista de amigos" }, { status: 400 })
            } else {
                return NextResponse.json({ error: "Ya hay una solicitud de amistad pendiente con este usuario" }, { status: 400 })
            }
        }

        await prisma.friendship.create({
            data: {
                userId,
                friendId: friend.id,
                status: "PENDING"
            }
        })

        return NextResponse.json({ success: true, message: "Solicitud de amistad enviada" })
    } catch (error) {
        console.error("Error adding friend:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { friendshipId, action } = await req.json()

        if (!friendshipId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (action === "accept") {
            await prisma.friendship.update({
                where: { id: friendshipId },
                data: { status: "ACCEPTED" }
            })
            return NextResponse.json({ success: true, message: "Solicitud aceptada" })
        } else if (action === "reject") {
            await prisma.friendship.delete({
                where: { id: friendshipId }
            })
            return NextResponse.json({ success: true, message: "Solicitud rechazada" })
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

    } catch (error) {
        console.error("Error updating friend request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { friendshipId } = await req.json()

        if (!friendshipId) {
            // Falback support for old delete method taking userId and friendId
            const { userId, friendId } = await req.json()
            if (userId && friendId) {
                await prisma.friendship.deleteMany({
                    where: {
                        OR: [
                            { userId, friendId },
                            { userId: friendId, friendId: userId }
                        ]
                    }
                })
                return NextResponse.json({ success: true })
            }
            return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 })
        }

        await prisma.friendship.delete({
            where: { id: friendshipId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting friend:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
