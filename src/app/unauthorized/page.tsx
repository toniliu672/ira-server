// src/app/unauthorized/page.tsx

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You do not have permission to access this page. Please log in with appropriate credentials.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/">
            <Button>
              Go to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}