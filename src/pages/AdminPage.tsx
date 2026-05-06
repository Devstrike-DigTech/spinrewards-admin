import { Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function AdminPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-sm text-muted-foreground">
          Platform configuration and admin user management
        </p>
      </div>

      <Card className="bg-card border-[#1e2a4a]">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'rgba(26, 35, 126, 0.3)' }}
          >
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Admin Settings</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Manage admin accounts, platform configuration, notification preferences, and
            security settings from here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-lg">
            {[
              { icon: '👤', title: 'Admin Users', desc: 'Manage admin accounts & permissions' },
              { icon: '🔑', title: 'Authentication', desc: 'Two-factor auth, password policy' },
              { icon: '🔔', title: 'Notifications', desc: 'Alert thresholds & channels' },
              { icon: '🛠', title: 'Platform Config', desc: 'Global platform parameters' },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: 'rgba(26, 35, 126, 0.15)', border: '1px solid rgba(26, 35, 126, 0.3)' }}
              >
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Under development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
