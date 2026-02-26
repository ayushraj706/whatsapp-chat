'use client';

import { createClient } from "@/utils/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { 
  MessageCircle, 
  Users, 
  Zap, 
  Shield, 
  Radio,
  MessageSquare,
  Upload,
  Database,
  Code2,
  CheckCircle2,
  ArrowRight,
  Server,
  Cloud,
  Lock,
  Globe,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Video,
  Headphones,
  Download,
  Rocket,
  Star,
  Github
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-b-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <MessageCircle className="h-8 w-8 text-green-600" />
            <span>BaseKey</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-green-600 transition-colors">Features</a>
            <a href="#tech-stack" className="text-sm font-medium hover:text-green-600 transition-colors">Tech Stack</a>
            <a href="#self-hosting" className="text-sm font-medium hover:text-green-600 transition-colors">Developer Info</a>
            <a href="https://ayus.fun" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-green-600 transition-colors">Success Point Hub</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            {/* Removed Sign In/Sign Up and GitHub buttons from here */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
              <Rocket className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Bihar's Best WhatsApp Business Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              BaseKey WhatsApp
              <span className="block text-green-600">Marketing Integration</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              A fully functional, production-ready WhatsApp Business platform built by Ayush Raj. Real-time messaging, broadcast groups, and template management for Samastipur and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg shadow-green-600/30"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <Link 
                href="https://ayus.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 px-8 py-4 rounded-full font-semibold text-lg transition-colors"
              >
                <Globe className="h-5 w-5" />
                Visit Success Point Hub
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Real-time Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Broadcast Groups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Template Manager</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Media Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">15+</div>
              <div className="text-sm text-muted-foreground mt-1">Core Features</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-muted-foreground mt-1">TypeScript</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">Real-time</div>
              <div className="text-sm text-muted-foreground mt-1">WebSockets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">Production</div>
              <div className="text-sm text-muted-foreground mt-1">Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">About BaseKey</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose BaseKey?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              An enterprise-grade WhatsApp Business integration platform that enables businesses to manage customer conversations through a modern, intuitive web interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-muted-foreground">
                Built for scale with enterprise-grade architecture, security, and performance optimizations out of the box.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Radio className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Everything</h3>
              <p className="text-muted-foreground">
                Instant message delivery using WebSockets with sub-second latency and optimistic UI updates.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure by Default</h3>
              <p className="text-muted-foreground">
                Row-level security, encrypted storage, and authentication built-in with Supabase Auth.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Complete Feature List</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive suite of features for professional WhatsApp messaging
            </p>
          </div>

          <Tabs defaultValue="messaging" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-4 mb-12">
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="messaging" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <MessageSquare className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Real-time Chat</h3>
                  <p className="text-sm text-muted-foreground">Send and receive messages instantly with WebSocket-based real-time sync.</p>
                </Card>
                <Card className="p-6">
                  <CheckCircle2 className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Read Receipts</h3>
                  <p className="text-sm text-muted-foreground">Track message status with read/unread indicators and timestamps.</p>
                </Card>
                <Card className="p-6">
                  <Zap className="h-8 w-8 text-yellow-600 mb-3" />
                  <h3 className="font-semibold mb-2">Optimistic UI</h3>
                  <p className="text-sm text-muted-foreground">Instant message display before server confirmation for better UX.</p>
                </Card>
                <Card className="p-6">
                  <Badge className="h-8 w-8 flex items-center justify-center text-green-600 mb-3">99</Badge>
                  <h3 className="font-semibold mb-2">Unread Indicators</h3>
                  <p className="text-sm text-muted-foreground">Visual badges and separators showing unread messages.</p>
                </Card>
                <Card className="p-6">
                  <ArrowRight className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold mb-2">Auto-scroll</h3>
                  <p className="text-sm text-muted-foreground">Jump to unread messages automatically with smart scrolling.</p>
                </Card>
                <Card className="p-6">
                  <Users className="h-8 w-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold mb-2">Contact Management</h3>
                  <p className="text-sm text-muted-foreground">Custom names, search, and smart sorting by activity.</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="broadcast" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <Users className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Broadcast Groups</h3>
                  <p className="text-sm text-muted-foreground">Create and manage broadcast groups with custom names and descriptions.</p>
                </Card>
                <Card className="p-6">
                  <MessageCircle className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Personal Delivery</h3>
                  <p className="text-sm text-muted-foreground">Each member receives broadcasts as individual personal messages.</p>
                </Card>
                <Card className="p-6">
                  <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold mb-2">Individual Tracking</h3>
                  <p className="text-sm text-muted-foreground">Track read status and engagement per member.</p>
                </Card>
                <Card className="p-6">
                  <Radio className="h-8 w-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold mb-2">Real-time Broadcast</h3>
                  <p className="text-sm text-muted-foreground">Messages appear instantly in broadcast window.</p>
                </Card>
                <Card className="p-6">
                  <FileText className="h-8 w-8 text-red-600 mb-3" />
                  <h3 className="font-semibold mb-2">Template Broadcasts</h3>
                  <p className="text-sm text-muted-foreground">Send template messages to entire groups efficiently.</p>
                </Card>
                <Card className="p-6">
                  <Badge className="h-8 w-8 flex items-center justify-center text-green-600 mb-3">∞</Badge>
                  <h3 className="font-semibold mb-2">Unlimited Members</h3>
                  <p className="text-sm text-muted-foreground">Add unlimited contacts to your broadcast groups.</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <FileText className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Visual Builder</h3>
                  <p className="text-sm text-muted-foreground">Create templates with real-time preview and validation.</p>
                </Card>
                <Card className="p-6">
                  <Globe className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Multi-language</h3>
                  <p className="text-sm text-muted-foreground">Support for 14+ languages including English, Spanish, Arabic, Hindi, and more.</p>
                </Card>
                <Card className="p-6">
                  <Code2 className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold mb-2">Dynamic Variables</h3>
                  <p className="text-sm text-muted-foreground">Use {`{{1}}`}, {`{{2}}`} for personalized content.</p>
                </Card>
                <Card className="p-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Status Tracking</h3>
                  <p className="text-sm text-muted-foreground">Monitor approval status (Pending, Approved, Rejected).</p>
                </Card>
                <Card className="p-6">
                  <MessageSquare className="h-8 w-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold mb-2">Button Types</h3>
                  <p className="text-sm text-muted-foreground">Quick Reply, URL, Phone Number, and Catalog buttons.</p>
                </Card>
                <Card className="p-6">
                  <ImageIcon className="h-8 w-8 text-red-600 mb-3" />
                  <h3 className="font-semibold mb-2">Media Headers</h3>
                  <p className="text-sm text-muted-foreground">Add image, video, or document headers to templates.</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <ImageIcon className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Image Messages</h3>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WebP, GIF support with captions and previews.</p>
                </Card>
                <Card className="p-6">
                  <Video className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Video Messages</h3>
                  <p className="text-sm text-muted-foreground">MP4, MOV, AVI with native HTML5 player.</p>
                </Card>
                <Card className="p-6">
                  <Headphones className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold mb-2">Audio Messages</h3>
                  <p className="text-sm text-muted-foreground">MP3, AAC, voice messages with waveform display.</p>
                </Card>
                <Card className="p-6">
                  <FileText className="h-8 w-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold mb-2">Documents</h3>
                  <p className="text-sm text-muted-foreground">PDF, DOC, XLS, PPT with download support.</p>
                </Card>
                <Card className="p-6">
                  <Upload className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Drag & Drop</h3>
                  <p className="text-sm text-muted-foreground">Intuitive file upload with multi-file selection.</p>
                </Card>
                <Card className="p-6">
                  <Download className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Download Manager</h3>
                  <p className="text-sm text-muted-foreground">Efficient file downloads with progress tracking.</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Technology Stack</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built with Modern Technologies
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powered by the best tools and frameworks for performance, scalability, and developer experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code2 className="h-6 w-6 text-green-600" />
                Frontend
              </h3>
              <div className="space-y-4">
                <div class
// ... (pichla code jahan tak sahi hai wahan se aage)
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-semibold">Next.js 15</div>
                    <div className="text-sm text-muted-foreground">App Router, Server Components</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      {/* Footer Branding aur baaki code band karne ke liye */}
      <footer className="border-t py-12 px-6 text-center">
         <p>© 2026 BaseKey by Ayush Raj</p>
      </footer>
    </main>
  );
}
