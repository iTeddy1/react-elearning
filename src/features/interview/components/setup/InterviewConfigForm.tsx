import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TestTube2 } from 'lucide-react';
import { MicrophoneTestResult } from '../../utils/microphone-test';
import { Switch } from '@/components/ui/switch';
import { Difficulty, Language } from '@/shared/types/ai';
import { RoundType } from '../../config';

// Form schema type
export interface FormValues {
  jobRole: string;
  difficulty: Difficulty;
  roundType: RoundType;
  questionCount: number;
  language: Language;
  testMode?: boolean;
}

interface InterviewConfigFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
  error: string | null;
  micTestResult: MicrophoneTestResult | null;
  className?: string;
}

const roundTypeOptions = [
  {
    value: 'technical' as const,
    label: 'Technical',
    description: 'Focus on coding and technical questions',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'behavioral' as const,
    label: 'Behavioral',
    description: 'Focus on soft skills and situational questions',
    badgeClass: 'bg-green-100 text-green-800',
  },
  {
    value: 'system-design' as const,
    label: 'System Design',
    description: 'Focus on architecture and design questions',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
];

const difficultyOptions = [
  {
    value: 'beginner' as const,
    label: 'Beginner',
    description: 'Basic questions, entry-level focus',
    badgeClass: 'bg-green-100 text-green-800',
  },
  {
    value: 'intermediate' as const,
    label: 'Intermediate',
    description: 'Moderate complexity, some experience expected',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'advanced' as const,
    label: 'Advanced',
    description: 'Complex scenarios, senior-level questions',
    badgeClass: 'bg-red-100 text-red-800',
  },
];

export const InterviewConfigForm: React.FC<InterviewConfigFormProps> = ({
  form,
  onSubmit,
  onCancel,
  isProcessing,
  error,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Interview Configuration</CardTitle>
        <CardDescription>
          Customize your interview experience by selecting job role, difficulty,
          and other preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-6"
          >
            {/* Job Role Field */}
            <FormField
              control={form.control}
              name="jobRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Frontend Developer Intern"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the job position you&apos;re practicing for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Round Type Field */}
            <FormField
              control={form.control}
              name="roundType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Round Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select round type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roundTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.badgeClass}>
                              {option.label}
                            </Badge>
                            <span>{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of interview round you want to practice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Field */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.badgeClass}>
                              {option.label}
                            </Badge>
                            <span>{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the appropriate difficulty for your experience level.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Count Field */}
            <FormField
              control={form.control}
              name="questionCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose between 3-10 questions (recommended: 5-7 for best
                    experience).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Mode Switch */}
            <FormField
              control={form.control}
              name="testMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-blue-50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <TestTube2 className="h-4 w-4" />
                      Test Mode (No AI)
                    </FormLabel>
                    <FormDescription>
                      Use pre-generated mock questions and reviews for testing.
                      No AI calls will be made, and no credits will be consumed.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Language Field */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred interview language.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Preparing Interview...
                  </>
                ) : (
                  'Start Interview'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
