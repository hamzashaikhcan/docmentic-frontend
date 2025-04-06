"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  Palette,
  User,
  Bell,
  Lock,
  Shield,
  Moon,
  Sun,
  Upload,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accentColor, setAccentColor] = useState("#1a3c56");
  const [name, setName] = useState("Jane Cooper");
  const [email, setEmail] = useState("jane@example.com");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [fontPreference, setFontPreference] = useState("inter");

  const handleSaveChanges = () => {
    toast.success("Your settings have been saved successfully!");
  };

  const handleProfilePictureUpload = () => {
    // This would normally open a file input
    toast.info("Profile picture upload functionality would open here");
  };

  const colors = [
    { value: "#1a3c56", label: "Blue (Default)" },
    { value: "#1e3a8a", label: "Navy Blue" },
    { value: "#18181b", label: "Dark" },
    { value: "#0c4a6e", label: "Cyan" },
    { value: "#5b21b6", label: "Purple" },
    { value: "#7f1d1d", label: "Red" },
    { value: "#065f46", label: "Green" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#111111] text-white">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">User Settings</h1>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="bg-[#1a1a1a] p-1 w-full h-full flex overflow-x-auto">
              <TabsTrigger
                value="profile"
                className="flex-1 py-2 data-[state=active]:bg-[#1a3c56] data-[state=active]:text-white"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex-1 py-2 data-[state=active]:bg-[#1a3c56] data-[state=active]:text-white"
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex-1 py-2 data-[state=active]:bg-[#1a3c56] data-[state=active]:text-white"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex-1 py-2 data-[state=active]:bg-[#1a3c56] data-[state=active]:text-white"
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal details and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src="https://ext.same-assets.com/3201005138/1703428997.jpeg"
                        alt="Profile picture"
                      />
                      <AvatarFallback className="bg-[#1a3c56]">
                        JC
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="border-[#333333] bg-[#111111] hover:bg-[#222]"
                        onClick={handleProfilePictureUpload}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change picture
                      </Button>
                      <p className="text-xs text-gray-400">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#111111] border-[#333333] focus-visible:ring-[#1a3c56]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#111111] border-[#333333] focus-visible:ring-[#1a3c56]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      placeholder="Tell us about yourself"
                      className="w-full p-2 bg-[#111111] border border-[#333333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a3c56]"
                    />
                    <p className="text-xs text-gray-400">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveChanges}
                  >
                    Save changes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en-US">
                      <SelectTrigger className="bg-[#111111] border-[#333333] text-white">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                        <SelectItem
                          value="en-US"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          English (US)
                        </SelectItem>
                        <SelectItem
                          value="en-UK"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          English (UK)
                        </SelectItem>
                        <SelectItem
                          value="fr"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          French
                        </SelectItem>
                        <SelectItem
                          value="de"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          German
                        </SelectItem>
                        <SelectItem
                          value="es"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          Spanish
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc-7">
                      <SelectTrigger className="bg-[#111111] border-[#333333] text-white">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                        <SelectItem
                          value="utc-12"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          (UTC-12:00) International Date Line West
                        </SelectItem>
                        <SelectItem
                          value="utc-7"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          (UTC-07:00) Pacific Time (US & Canada)
                        </SelectItem>
                        <SelectItem
                          value="utc-6"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          (UTC-06:00) Central Time (US & Canada)
                        </SelectItem>
                        <SelectItem
                          value="utc-5"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          (UTC-05:00) Eastern Time (US & Canada)
                        </SelectItem>
                        <SelectItem
                          value="utc+0"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          (UTC+00:00) London, Dublin
                        </SelectItem>
                        <SelectItem
                          value="utc+1"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          (UTC+01:00) Berlin, Paris, Rome
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Document Count</Label>
                      <p className="text-xs text-gray-400">
                        Display document count in folders and categories
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <Separator className="bg-[#333333]" />

                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      className="bg-red-900 hover:bg-red-800 text-white"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4">
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize how Docmentic looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme Mode</Label>
                    <RadioGroup
                      value={theme}
                      onValueChange={(value) =>
                        setTheme(value as "dark" | "light" | "system")
                      }
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="dark"
                          id="theme-dark"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="theme-dark"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-[#333333] bg-[#111111] p-4 hover:bg-[#222] hover:border-[#444] cursor-pointer peer-data-[state=checked]:border-blue-600"
                        >
                          <Moon className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Dark</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="light"
                          id="theme-light"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="theme-light"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-[#333333] bg-[#111111] p-4 hover:bg-[#222] hover:border-[#444] cursor-pointer peer-data-[state=checked]:border-blue-600"
                        >
                          <Sun className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Light</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="system"
                          id="theme-system"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="theme-system"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-[#333333] bg-[#111111] p-4 hover:bg-[#222] hover:border-[#444] cursor-pointer peer-data-[state=checked]:border-blue-600"
                        >
                          <Palette className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">System</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Accent Color</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          className={`h-12 rounded-md border-2 ${
                            accentColor === color.value
                              ? "border-white"
                              : "border-transparent"
                          } transition-all`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setAccentColor(color.value)}
                          aria-label={color.label}
                        >
                          {accentColor === color.value && (
                            <Check className="h-4 w-4 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      This color will be used for buttons, links, and highlights
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="font-preference">Font Preference</Label>
                    <Select
                      value={fontPreference}
                      onValueChange={setFontPreference}
                    >
                      <SelectTrigger className="bg-[#111111] border-[#333333] text-white">
                        <SelectValue placeholder="Select Font" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                        <SelectItem
                          value="inter"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          Inter (Default)
                        </SelectItem>
                        <SelectItem
                          value="roboto"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          Roboto
                        </SelectItem>
                        <SelectItem
                          value="montserrat"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          Montserrat
                        </SelectItem>
                        <SelectItem
                          value="opensans"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          Open Sans
                        </SelectItem>
                        <SelectItem
                          value="sourcecodepro"
                          className="focus:bg-[#333] focus:text-white"
                        >
                          Source Code Pro (Monospace)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduce Animations</Label>
                      <p className="text-xs text-gray-400">
                        Reduce motion for accessibility
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveChanges}
                  >
                    Save preferences
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardHeader>
                  <CardTitle>Editor Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize the document editor behavior and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Line Numbers</Label>
                      <p className="text-xs text-gray-400">
                        Display line numbers in code blocks
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Spell Check</Label>
                      <p className="text-xs text-gray-400">
                        Highlight spelling errors while typing
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Save</Label>
                      <p className="text-xs text-gray-400">
                        Automatically save changes as you type
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autosave-interval">
                      Auto Save Interval (seconds)
                    </Label>
                    <Input
                      id="autosave-interval"
                      type="number"
                      defaultValue="30"
                      min="5"
                      max="300"
                      className="bg-[#111111] border-[#333333] focus-visible:ring-[#1a3c56] w-full md:w-40"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-xs text-gray-400">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-xs text-gray-400">
                          Receive browser notifications
                        </p>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>

                    <Separator className="bg-[#333333]" />

                    <h3 className="text-lg font-medium">Notification Types</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Document Comments</Label>
                        <Switch checked={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Document Shares</Label>
                        <Switch checked={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Mentions</Label>
                        <Switch checked={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Team Updates</Label>
                        <Switch checked={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Product Updates</Label>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Marketing Communications</Label>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveChanges}
                  >
                    Save preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Change Password</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-[#111111] border-[#333333] focus-visible:ring-[#1a3c56]"
                        />
                      </div>
                      <div></div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-[#111111] border-[#333333] focus-visible:ring-[#1a3c56]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-[#111111] border-[#333333] focus-visible:ring-[#1a3c56]"
                        />
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 mt-2">
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>

                    <Separator className="bg-[#333333] my-6" />

                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Add an extra layer of security to your account by enabling
                      two-factor authentication.
                    </p>

                    <Button
                      variant="outline"
                      className="border-[#333333] bg-[#111111] hover:bg-[#222]"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Set Up Two-Factor Authentication
                    </Button>

                    <Separator className="bg-[#333333] my-6" />

                    <h3 className="font-medium text-red-500">Danger Zone</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>

                    <Button
                      variant="destructive"
                      className="bg-red-900 hover:bg-red-800"
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
