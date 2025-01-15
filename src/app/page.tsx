'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface AnalysisResult {
  ssl: {
    score: number;
    issues: string[];
  };
  contentSecurity: {
    score: number;
    issues: string[];
  };
  vulnerabilities: {
    score: number;
    issues: string[];
  };
}

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call with mock data
    setTimeout(() => {
      setAnalysisResult({
        ssl: {
          score: 85,
          issues: ["Certificate expires in 30 days", "TLS 1.2 supported"]
        },
        contentSecurity: {
          score: 70,
          issues: ["Missing CSP header", "X-Frame-Options not set"]
        },
        vulnerabilities: {
          score: 90,
          issues: ["No critical vulnerabilities found", "Server version exposed"]
        }
      })
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold">SecureCheck</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Check Your Website Security
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Analyze your website's security in seconds. Get a comprehensive report on vulnerabilities and best practices.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form onSubmit={handleSubmit}>
                  <div className="flex space-x-2">
                    <Input
                      className="flex-1"
                      placeholder="Enter website URL"
                      type="url"
                      required
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Results Section */}
        {analysisResult && (
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
                Security Analysis Results
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>SSL/TLS</CardTitle>
                    <CardDescription>Score: {analysisResult.ssl.score}/100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4">
                      {analysisResult.ssl.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Content Security</CardTitle>
                    <CardDescription>Score: {analysisResult.contentSecurity.score}/100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4">
                      {analysisResult.contentSecurity.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Vulnerabilities</CardTitle>
                    <CardDescription>Score: {analysisResult.vulnerabilities.score}/100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4">
                      {analysisResult.vulnerabilities.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Security Parameters We Check
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Lock className="w-4 h-4 inline-block mr-2" />
                    SSL/TLS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We check for proper SSL/TLS implementation and certificate validity.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Eye className="w-4 h-4 inline-block mr-2" />
                    Content Security Policy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We analyze your Content Security Policy headers for best practices.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                    Vulnerabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We scan for known vulnerabilities in your server configuration and software.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 SecureCheck. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
