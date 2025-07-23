// app/api/chat/sessions/[id]/messages/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// メッセージ保存
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role, content } = await request.json()

    // バリデーション
    if (!role || !content) {
      return NextResponse.json(
        { error: 'role と content は必須です' },
        { status: 400 }
      )
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { error: 'role は user または assistant である必要があります' },
        { status: 400 }
      )
    }

    // セッションの存在確認と権限チェック
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // メッセージを保存
    const newMessage = await prisma.chatMessage.create({
      data: {
        sessionId: params.id,
        role,
        content,
      },
    })

    // セッションの更新日時を更新
    await prisma.chatSession.update({
      where: {
        id: params.id,
      },
      data: {
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('メッセージ保存エラー:', error)
    return NextResponse.json(
      { error: 'メッセージの保存に失敗しました' },
      { status: 500 }
    )
  }
}

// セッションのメッセージ一覧取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // セッションの存在確認と権限チェック
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: params.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('メッセージ取得エラー:', error)
    return NextResponse.json(
      { error: 'メッセージの取得に失敗しました' },
      { status: 500 }
    )
  }
}