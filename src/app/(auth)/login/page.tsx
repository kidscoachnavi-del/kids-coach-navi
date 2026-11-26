'use client'

import { useActionState, useState, useEffect, Suspense } from 'react'
import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

const initialState = {
    error: '',
}

function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, initialState)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirectTo') || ''

    useEffect(() => {
        router.prefetch('/admin/kcn')
        router.prefetch('/coach/dashboard')
    }, [router])

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#FDFBF7] font-sans text-[#2C2B29]">
            {/* Login Card */}
            <div className="bg-white w-full max-w-md p-7 sm:p-8 rounded-3xl border border-[#EADBCC] shadow-sm relative z-10">

                <div className="text-center mb-7 space-y-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-3 group">
                        <div className="relative w-7 h-9 shrink-0">
                            <div className="absolute inset-0 bg-[#F7D668] rounded-md rotate-12 group-hover:rotate-6 transition-transform" />
                            <div className="absolute top-1.5 left-1 w-2 h-2 bg-[#3E8E84] rounded-full" />
                            <div className="absolute top-1.5 right-1 w-2 h-2 bg-[#E3644F] rotate-45" />
                            <div className="absolute bottom-1.5 left-2.5 w-2 h-2 bg-[#88C8D8] rounded-xs" />
                        </div>
                        <div className="text-left">
                            <span className="font-logo font-bold text-xl tracking-tight text-[#2C2B29] block leading-none">
                                Kids Coach Navi
                            </span>
                            <span className="text-[11px] text-[#5E5B54] font-bold tracking-wider block mt-0.5">
                                キッズコーチナビ by SWIM PARTNERS
                            </span>
                        </div>
                    </Link>
                    <h1 className="font-heading text-base font-bold text-[#2C2B29] pt-2">
                        管理者・コーチ ログイン
                    </h1>
                </div>

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-600 text-xs uppercase tracking-wider font-semibold ml-1">メールアドレス</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="coach@example.com"
                                required
                                className="bg-white/50 border-white/40 text-slate-800 placeholder:text-slate-400 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-600 text-xs uppercase tracking-wider font-semibold ml-1">パスワード</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="bg-white/50 border-white/40 text-slate-800 placeholder:text-slate-400 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl pr-10 transition-all"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-primary hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">{showPassword ? 'パスワードを隠す' : 'パスワードを表示'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            value="true"
                            className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500 cursor-pointer"
                        >
                            ログイン状態を維持する
                        </Label>
                    </div>

                    {state?.error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <AlertTitle>エラー</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white font-bold tracking-wide rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                認証中...
                            </>
                        ) : (
                            'ログイン'
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center space-y-2.5">
                    <Link href="/forgot-password" className="block text-xs text-slate-500 hover:text-primary transition-colors">
                        パスワードをお忘れですか？
                    </Link>
                    <Link href="/coach/onboarding" className="block text-xs font-bold text-[#3E8E84] hover:underline">
                        コーチ新規登録・審査申請はこちら →
                    </Link>
                </div>
            </div >
        </div >
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}

