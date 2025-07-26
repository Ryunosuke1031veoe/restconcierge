

// app/api/register/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "全ての項目を入力してください" }, 
        { status: 400 }
      )
    }

    
    if (name.length < 2) {
      return NextResponse.json(
        { message: "名前は2文字以上で入力してください" }, 
        { status: 400 }
      )
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "有効なメールアドレスを入力してください" }, 
        { status: 400 }
      )
    }

    
    if (password.length < 6) {
      return NextResponse.json(
        { message: "パスワードは6文字以上で入力してください" }, 
        { status: 400 }
      )
    }

    
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています" }, 
        { status: 400 }
      )
    }

    
    const hashedPassword = await hash(password, 12) 

    console.log('🆕 新規ユーザー作成開始:', { name, email: email.toLowerCase() })

    
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        
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
