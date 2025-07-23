"use client"

import { useState } from "react"
import { Home, MessageCircle, Settings, History, User, Menu, X, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger 
} from "@/components/ui/sheet"
import Link from "next/link"

const navigationItems = [
  { name: "ホーム", href: "/", icon: Home },
  { name: "チャット", href: "/chat", icon: MessageCircle },
  { name: "設定", href: "/settings", icon: Settings },
  { name: "履歴", href: "/history", icon: History },
  { name: "分析", href: "/analytics", icon: BarChart3 },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-teal-600 transition-colors">
                RestConcierge
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}

            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="ml-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </nav>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">メニューを開く</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <SheetHeader className="p-4 border-b border-gray-200">
                  <SheetTitle className="text-lg font-semibold text-gray-900 text-left">
                    RestConcierge
                  </SheetTitle>
                  <SheetDescription className="text-sm text-gray-600 text-left">
                    ナビゲーションメニュー
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col h-full">
                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {navigationItems.map((item) => {
                        const IconComponent = item.icon
                        return (
                          <Link key={item.name} href={item.href}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              <IconComponent className="w-5 h-5" />
                              <span className="text-base">{item.name}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <Link href="/profile">
                        <Button
                          variant="ghost"
                          className="w-full justify-start flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          <span className="text-base">プロフィール</span>
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}