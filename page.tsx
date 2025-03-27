import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Expense Tracker</h1>
          <div className="ml-auto flex gap-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Track Your Finances</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Keep track of your expenses and investments in one place.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted-foreground/10 px-3 py-1 text-sm">Expense Tracking</div>
                <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">Record and Categorize Your Expenses</h3>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Keep track of where your money goes. Categorize expenses, add dates, and notes to better understand
                  your spending habits.
                </p>
              </div>
              <div className="flex justify-center">
                <Card className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>Example of expense tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Grocery Shopping</p>
                          <p className="text-sm text-muted-foreground">Supermarket</p>
                        </div>
                        <p className="font-semibold">$85.42</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Dinner</p>
                          <p className="text-sm text-muted-foreground">Restaurant</p>
                        </div>
                        <p className="font-semibold">$45.00</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Gas</p>
                          <p className="text-sm text-muted-foreground">Transportation</p>
                        </div>
                        <p className="font-semibold">$38.75</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex justify-center order-last lg:order-first">
                <Card className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle>Share Transactions</CardTitle>
                    <CardDescription>Example of share tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">AAPL</p>
                          <p className="text-sm text-muted-foreground">Buy - 10 shares</p>
                        </div>
                        <p className="font-semibold text-green-600">$1,850.00</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">MSFT</p>
                          <p className="text-sm text-muted-foreground">Buy - 5 shares</p>
                        </div>
                        <p className="font-semibold text-green-600">$1,750.00</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">GOOGL</p>
                          <p className="text-sm text-muted-foreground">Sell - 3 shares</p>
                        </div>
                        <p className="font-semibold text-red-600">$4,200.00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted-foreground/10 px-3 py-1 text-sm">
                  Share Transactions
                </div>
                <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">Manage Your Investment Portfolio</h3>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Track your share purchases and sales. Record transaction details, prices, and monitor your investment
                  performance over time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Expense Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

