import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export function CustomersStats({ totalCustomers, customers = [] }) {
  // Calculate counts for each customer level
  const stats = {
    total: totalCustomers,
    bronze: customers.filter(c => c.customerLevel?.toUpperCase() === 'BRONZE').length,
    silver: customers.filter(c => c.customerLevel?.toUpperCase() === 'SILVER').length,
    gold: customers.filter(c => c.customerLevel?.toUpperCase() === 'GOLD').length,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Customers
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground opacity-50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active members
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gold Members
          </CardTitle>
          <Users className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.gold}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Premium tier customers
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Silver Members
          </CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.silver}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Mid tier customers
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Bronze Members
          </CardTitle>
          <Users className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bronze}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Entry tier customers
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 