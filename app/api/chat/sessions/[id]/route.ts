// app/api/chat/sessions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// 特定セッションのメッセージ取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // 自分のセッションのみアクセス可能
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(chatSession)
  } catch (error) {
    console.error('チャットセッション詳細取得エラー:', error)
    return NextResponse.json(
      { error: 'セッションの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// セッション削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // セッション削除（cascadeでメッセージも削除される）
    await prisma.chatSession.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'セッションが削除されました' })
  } catch (error) {
    console.error('チャットセッション削除エラー:', error)
    return NextResponse.json(
      { error: 'セッションの削除に失敗しました' },
      { status: 500 }
    )
  }
}