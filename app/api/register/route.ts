

// app/api/register/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // バリデーション
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "全ての項目を入力してください" }, 
        { status: 400 }
      )
    }

    // 名前の長さチェック
    if (name.length < 2) {
      return NextResponse.json(
        { message: "名前は2文字以上で入力してください" }, 
        { status: 400 }
      )
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "有効なメールアドレスを入力してください" }, 
        { status: 400 }
      )
    }

    // パスワードの長さチェック
    if (password.length < 6) {
      return NextResponse.json(
        { message: "パスワードは6文字以上で入力してください" }, 
        { status: 400 }
      )
    }

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています" }, 
        { status: 400 }
      )
    }

    // パスワードハッシュ化
    const hashedPassword = await hash(password, 12) // セキュリティ向上のため12に変更

    console.log('🆕 新規ユーザー作成開始:', { name, email: email.toLowerCase() })

    // ユーザー作成（デフォルトでフリープラン）
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        // プラン関連のデフォルト値（スキーマで設定済みだが明示的に指定）
        planId: "free",
        planStartDate: new Date(),
        isActive: true,
        monthlyConsultations: 0,
        lastConsultationReset: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        planId: true,
        createdAt: true
      }
    })

    console.log('✅ 新規ユーザー作成成功:', {
      id: newUser.id,
      email: newUser.email,
      planId: newUser.planId
    })

    // パスワードを除外してレスポンス
    return NextResponse.json(
      { 
        success: true,
        message: "アカウントが正常に作成されました",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          planId: newUser.planId,
          createdAt: newUser.createdAt
        }
      }, 
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ ユーザー登録エラー:', error)
    
    // Prismaエラーの詳細処理
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: "このメールアドレスは既に登録されています" },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Required')) {
        return NextResponse.json(
          { message: "必須フィールドが不足しています" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { 
        message: "アカウントの作成中にエラーが発生しました。もう一度お試しください。",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
