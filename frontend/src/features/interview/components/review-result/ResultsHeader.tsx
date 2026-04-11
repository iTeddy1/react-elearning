import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function ResultsHeader() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Award className="h-6 w-6" />
          Interview Complete!
        </CardTitle>
        <CardDescription>
          Here&apos;s your comprehensive interview analysis and feedback
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
