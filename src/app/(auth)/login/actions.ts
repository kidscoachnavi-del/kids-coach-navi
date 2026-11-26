'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(prevState: any, formData: FormData) {
    const remember = formData.get('remember') === 'true'
    const redirectTo = formData.get('redirectTo') as string || ''
    const supabase = await createClient(remember)

    // Validate form data
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const validation = loginSchema.safeParse({ email, password })

    if (!validation.success) {
        return { error: 'Invalid inputs' }
    }

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // User is already available from signInWithPassword response

    if (!user) {
        return redirect('/login')
    }

    const [{ data: kcnUser }, { data: profile }] = await Promise.all([
        supabase
            .from('kcn_users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle(),
        supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle(),
    ])

    const role = kcnUser?.role || profile?.role || 'coach'

    // Clear cache specifically for dashboard layouts to ensure fresh profile data
    revalidatePath('/admin/kcn', 'page')
    revalidatePath('/coach/dashboard', 'page')

    let targetUrl = redirectTo
    if (!targetUrl || !targetUrl.startsWith('/')) {
        targetUrl = role === 'admin' ? '/admin/kcn' : '/coach/dashboard'
    }

    redirect(targetUrl)
}
