import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/index'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      const tokens = await authApi.login(values.username, values.password)
      setAuth(tokens, values.username)
      navigate('/')
    } catch {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07090F]">
      {/* Left brand panel - hidden on small screens */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #07090F 0%, #0D1220 50%, #1A237E22 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-10"
          style={{ background: '#1A237E' }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full opacity-10"
          style={{ background: '#C9961A' }}
        />
        <div
          className="absolute top-1/3 left-1/3 h-48 w-48 rounded-full opacity-5"
          style={{ background: '#C9961A' }}
        />

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white"
              style={{ background: '#1A237E' }}
            >
              SR
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-black text-white tracking-tight">
            Spin<span style={{ color: '#C9961A' }}>Rewards</span>
          </h1>
          <p className="mb-1 text-lg font-semibold text-white/80">Admin Dashboard</p>
          <p className="text-sm text-white/40">
            Real-time insights. Full control. Zero guesswork.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-col gap-3 text-left">
            {[
              { icon: '📊', text: 'Live analytics & revenue tracking' },
              { icon: '🔒', text: 'KYC verification queue' },
              { icon: '⚙️', text: 'RTP tier configuration' },
              { icon: '💳', text: 'Withdrawal management' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(26, 35, 126, 0.2)' }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-white/70">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white"
              style={{ background: '#1A237E' }}
            >
              SR
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">SpinRewards</span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: '#C9961A22', color: '#C9961A' }}
              >
                Admin
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Sign In</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your admin credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm text-foreground">
                Username
              </Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="admin"
                className="h-11 border-[#1e2a4a] bg-[#0D1220] text-foreground placeholder:text-muted-foreground focus:border-gold focus-visible:ring-gold"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 border-[#1e2a4a] bg-[#0D1220] text-foreground placeholder:text-muted-foreground focus:border-gold focus-visible:ring-gold"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full font-semibold text-white"
              style={{ background: '#C9961A' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {USE_MOCK && (
            <div
              className="mt-6 rounded-lg px-4 py-3"
              style={{ background: 'rgba(201, 150, 26, 0.08)', border: '1px solid rgba(201, 150, 26, 0.2)' }}
            >
              <p className="text-xs font-medium" style={{ color: '#C9961A' }}>
                Mock mode enabled
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Use any username with any password to sign in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
