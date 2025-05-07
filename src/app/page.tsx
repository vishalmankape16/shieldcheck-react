'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Lock, Eye, AlertTriangle, Camera, Webhook, FileWarning, CheckCircle2, XCircle, AlertOctagon } from 'lucide-react'
import { UrlScanner } from '@/components/url-scanner'
import { env } from '@/config/env'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface SecurityIssue {
  message: string;
  severity: 'high' | 'medium' | 'low' | 'info';
}

interface AnalysisResult {
  ssl: {
    score: number;
    issues: SecurityIssue[];
  };
  contentSecurity: {
    score: number;
    issues: SecurityIssue[];
  };
  vulnerabilities: {
    score: number;
    issues: SecurityIssue[];
  };
  phishing: {
    score: number;
    issues: SecurityIssue[];
  };
  malware: {
    score: number;
    issues: SecurityIssue[];
  };
  webAttacks: {
    score: number;
    issues: SecurityIssue[];
  };
  certificateTransparency: {
    score: number;
    issues: SecurityIssue[];
  };
  libraries: {
    score: number;
    issues: SecurityIssue[];
  };
}

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setAnalysisResult(null)

    const loadingToast = toast.loading('Analyzing website security...', {
      description: 'Please wait while we check various security parameters.',
    })

    try {
      const response = await fetch(`${env.apiHost}/check-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404 ? 'Website not found'
          : response.status === 429 ? 'Too many requests, please try again later'
          : response.status === 400 ? 'Invalid URL format'
          : 'Failed to analyze website'
        );
      }

      const data = await response.json();
      
      // Transform the API response to match our interface
      setAnalysisResult({
        ssl: {
          score: data.overall_score,
          issues: Object.entries(data.security_headers).map(([header, value]) => ({
            message: `${header}: ${String(value)}`,
            severity: String(value) === 'Missing' ? 'high' : String(value).includes('Invalid') ? 'medium' : 'info'
          })),
        },
        contentSecurity: {
          score: data.overall_score,
          issues: data.recommendations
            .filter((rec: string) => rec.includes('CSP') || rec.includes('security'))
            .map((rec: string) => ({
              message: rec,
              severity: rec.toLowerCase().includes('critical') ? 'high' : 
                       rec.toLowerCase().includes('implement') ? 'medium' : 'low'
            })),
        },
        vulnerabilities: {
          score: data.overall_score,
          issues: data.xss_check.issues.map((issue: string) => ({
            message: issue,
            severity: 'high'
          })),
        },
        phishing: {
          score: data.overall_score,
          issues: data.phishing_check.suspicious_patterns.map((pattern: string) => ({
            message: pattern,
            severity: data.phishing_check.risk_level === 'high' ? 'high' : 
                     data.phishing_check.risk_level === 'medium' ? 'medium' : 'low'
          })),
        },
        malware: {
          score: data.overall_score,
          issues: data.malware_check.suspicious_patterns.map((pattern: string) => ({
            message: pattern,
            severity: data.malware_check.risk_level === 'high' ? 'high' : 
                     data.malware_check.risk_level === 'medium' ? 'medium' : 'low'
          })),
        },
        webAttacks: {
          score: data.overall_score,
          issues: data.csrf_check.issues.map((issue: string) => ({
            message: issue,
            severity: issue.includes('No CSRF protection') ? 'high' : 'medium'
          })),
        },
        certificateTransparency: {
          score: data.overall_score,
          issues: [{
            message: data.ct_check.ct_status,
            severity: data.ct_check.ct_status.includes('Not found') ? 'high' : 'info'
          }],
        },
        libraries: {
          score: data.overall_score,
          issues: data.recommendations
            .filter((rec: string) => rec.includes('upgrade') || rec.includes('implement'))
            .map((rec: string) => ({
              message: rec,
              severity: rec.toLowerCase().includes('critical') ? 'high' : 'medium'
            })),
        }
      });

      toast.success('Analysis completed', {
        description: 'Security check completed successfully.',
        id: loadingToast,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast.error('Analysis failed', {
        description: errorMessage,
        id: loadingToast,
        action: {
          label: 'Try Again',
          onClick: () => handleSubmit(e),
        },
        duration: 5000,
      });

      console.error('Error analyzing website:', error);
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlDetected = (detectedUrl: string) => {
    setUrl(detectedUrl)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          className: 'text-sm font-medium',
        }}
        closeButton
      />
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
                  Analyze your websites security in seconds. Get a comprehensive report on vulnerabilities and best practices.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form onSubmit={handleSubmit}>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        className="pr-12"
                        placeholder="Enter website URL"
                        type="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <UrlScanner onUrlDetected={handleUrlDetected} />
                    </div>
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
              <div className="grid gap-6 lg:grid-cols-4">
                {Object.entries(analysisResult).map(([key, data]) => (
                  <Card key={key} className="overflow-hidden">
                    <CardHeader className={`border-b ${getScoreColorClass(data.score)}`}>
                      <CardTitle className="flex items-center gap-2">
                        {getSecurityIcon(key)}
                        {formatTitle(key)}
                      </CardTitle>
                      <CardDescription className="font-semibold">
                        Score: {data.score}/100
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {data.issues.length === 0 ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>No issues found</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {data.issues.map((issue: SecurityIssue, index: number) => (
                              <div key={index} className={`flex items-start gap-2 ${getSeverityColorClass(issue.severity)}`}>
                                {getSeverityIcon(issue.severity)}
                                <span className="text-sm">{issue.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
            <div className="grid gap-6 lg:grid-cols-4">
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
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Camera className="w-4 h-4 inline-block mr-2" />
                    Phishing Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Advanced scanning for phishing attempts and suspicious patterns.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Shield className="w-4 h-4 inline-block mr-2" />
                    Malware Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Comprehensive malware scanning and blacklist checking.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Webhook className="w-4 h-4 inline-block mr-2" />
                    Web Attack Prevention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Detection of CSRF, XSS, and other common web attacks.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <FileWarning className="w-4 h-4 inline-block mr-2" />
                    Library Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Check for outdated and vulnerable dependencies in your codebase.</p>
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

const getScoreColorClass = (score: number) => {
  if (score >= 90) return 'bg-green-50';
  if (score >= 70) return 'bg-yellow-50';
  return 'bg-red-50';
};

const getSeverityColorClass = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-orange-600';
    default:
      return 'text-blue-600';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <XCircle className="h-5 w-5 shrink-0" />;
    case 'medium':
      return <AlertTriangle className="h-5 w-5 shrink-0" />;
    case 'low':
      return <AlertOctagon className="h-5 w-5 shrink-0" />;
    default:
      return <CheckCircle2 className="h-5 w-5 shrink-0" />;
  }
};

const getSecurityIcon = (key: string) => {
  switch (key) {
    case 'ssl':
      return <Lock className="h-5 w-5" />;
    case 'contentSecurity':
      return <Shield className="h-5 w-5" />;
    case 'vulnerabilities':
      return <AlertTriangle className="h-5 w-5" />;
    case 'phishing':
      return <Eye className="h-5 w-5" />;
    case 'malware':
      return <FileWarning className="h-5 w-5" />;
    case 'webAttacks':
      return <Webhook className="h-5 w-5" />;
    case 'certificateTransparency':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'libraries':
      return <FileWarning className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
  }
};

const formatTitle = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
