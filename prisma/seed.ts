import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.plan.deleteMany({})

  const plans = [
    {
      id: 'basic',
      name: 'basic',
      displayName: 'ベーシック',
      price: 9800,
      consultationLimit: 50,
      features: [
        'AI相談 月50回まで',
        '基本的な売上分析',
        'レポート出力',
        'メールサポート',
        '1店舗まで登録可能'
      ],
      isActive: true,
      sortOrder: 1
    },
    {
      id: 'pro',
      name: 'pro',
      displayName: 'プロ',
      price: 19800,
      consultationLimit: 200,
      features: [
        'AI相談 月200回まで',
        '高度な売上分析',
        '予測分析機能',
        '優先サポート',
        '5店舗まで登録可能',
        'カスタムレポート'
      ],
      isActive: true,
      sortOrder: 2
    },
    {
      id: 'enterprise',
      name: 'enterprise',
      displayName: 'エンタープライズ',
      price: 39800,
      consultationLimit: 999999, // 実質無制限
      features: [
        'AI相談 無制限',
        '全分析機能',
        'API連携',
        '専用サポート',
        '無制限店舗登録',
        '白ラベル対応'
      ],
      isActive: true,
      sortOrder: 3
    }
  ]

  for (const plan of plans) {
    await prisma.plan.create({
      data: plan
    })
  }

  console.log('プランデータが正常に作成されました')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })