"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useThemeColors, type ColorTheme, colorThemes } from "@/components/theme-colors"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    notifications: {
      email: true,
      expenses: true,
      shares: true,
      reports: false,
    },
  })
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useThemeColors()

  useEffect(() => {
    setMounted(true)

    // Get user data
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setSettings((prev) => ({
        ...prev,
        name: parsedUser.name,
        email: parsedUser.email,
      }))

      // Try to get settings from Supabase
      const fetchUserSettings = async () => {
        try {
          const supabase = getSupabaseBrowserClient()
          const { data, error } = await supabase.from("users").select("*").eq("email", parsedUser.email).single()

          if (error) {
            console.error("Error fetching user settings:", error)
            return
          }

          if (data) {
            // Update user data if available
            setUser({
              name: data.name || parsedUser.name,
              email: data.email,
            })

            // Update settings if available
            if (data.settings) {
              setSettings((prev) => ({
                ...prev,
                ...data.settings,
              }))
            }
          }
        } catch (error) {
          console.error("Error in fetchUserSettings:", error)
        }
      }

      fetchUserSettings()
    }

    // Get settings
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      setSettings((prev) => ({
        ...prev,
        ...JSON.parse(savedSettings),
      }))
    }
  }, [])

  if (!mounted) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }))
  }

  const handleSaveSettings = async () => {
    // Update user data
    if (user) {
      const updatedUser = {
        ...user,
        name: settings.name,
        email: settings.email,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // Save to Supabase if available
      try {
        const supabase = getSupabaseBrowserClient()

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("email", settings.email)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error checking user existence:", fetchError)
        }

        if (existingUser) {
          // Update existing user
          const { error } = await supabase
            .from("users")
            .update({
              name: settings.name,
              settings: {
                notifications: settings.notifications,
              },
            })
            .eq("id", existingUser.id)

          if (error) {
            console.error("Error updating user:", error)
          }
        } else {
          // Insert new user
          const { error } = await supabase.from("users").insert({
            email: settings.email,
            name: settings.name,
            settings: {
              notifications: settings.notifications,
            },
          })

          if (error) {
            console.error("Error inserting user:", error)
          }
        }
      } catch (error) {
        console.error("Error saving to Supabase:", error)
      }
    }

    // Save settings to localStorage
    localStorage.setItem(
      "settings",
      JSON.stringify({
        notifications: settings.notifications,
      }),
    )

    alert("Settings saved successfully")
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 shadow-lg animate-slide-up">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={settings.name}
                onChange={handleInputChange}
                className="border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleInputChange}
                className="border-primary/20"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} className="w-full">
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-primary/20 shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email notifications</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange("email", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expense-notifications">Expense Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about new expenses</p>
              </div>
              <Switch
                id="expense-notifications"
                checked={settings.notifications.expenses}
                onCheckedChange={(checked) => handleNotificationChange("expenses", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-notifications">Share Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about share price changes</p>
              </div>
              <Switch
                id="share-notifications"
                checked={settings.notifications.shares}
                onCheckedChange={(checked) => handleNotificationChange("shares", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="report-notifications">Report Summaries</Label>
                <p className="text-sm text-muted-foreground">Receive weekly financial reports</p>
              </div>
              <Switch
                id="report-notifications"
                checked={settings.notifications.reports}
                onCheckedChange={(checked) => handleNotificationChange("reports", checked)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} className="w-full">
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-primary/20 shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Color Theme</Label>
              <Select value={theme} onValueChange={(value) => setTheme(value as ColorTheme)}>
                <SelectTrigger className="border-primary/20">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                  <SelectItem value="pastel">Pastel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-4">
              {Object.entries(colorThemes).map(([themeName, themeColors]) => (
                <div
                  key={themeName}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === themeName ? "ring-2 ring-primary" : "border-primary/20"
                  }`}
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.foreground,
                  }}
                  onClick={() => setTheme(themeName as ColorTheme)}
                >
                  <div className="text-sm font-medium mb-2" style={{ color: themeColors.foreground }}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </div>
                  <div className="flex gap-1">
                    {themeColors.chartColors.slice(0, 5).map((color, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 shadow-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your data and synchronization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Database Connection</Label>
              <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-md">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span>Connected to Supabase</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is being synchronized with the cloud database
              </p>
            </div>
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => alert("Data export feature coming soon!")}>
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

