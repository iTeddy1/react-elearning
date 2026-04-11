import React from 'react';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuizGeneratorStore } from '../store/quiz-generator-store';
import { useGenerateAndStartQuizMutation } from '../hooks/use-quiz-queries';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

const formSchema = z.object({
  topic: z.string().min(2, {
    message: 'Topic must be at least 2 characters.',
  }),
  focusArea: z.string().max(300).optional(),
  technology: z.string().min(1, {
    message: 'Please select a technology.',
  }),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  numQuestions: z.number().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateQuizForm() {
  const { generatedQuiz, generationError } = useQuizGeneratorStore();
  const generateAndStartMutation = useGenerateAndStartQuizMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      focusArea: '',
      technology: 'React',
      difficulty: 'Advanced',
      numQuestions: 10,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    generateAndStartMutation.mutate({
      topic: data.topic,
      focusArea: data.focusArea?.trim() || '',
      technology: data.technology,
      difficulty: data.difficulty,
      questionCount: data.numQuestions,
      language: 'en',
    });
  };

  const onError: SubmitErrorHandler<FormValues> = (errors) =>
    console.log(errors);
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit, onError)(e);
        }}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input placeholder="Enter quiz topic" {...field} />
              </FormControl>
              <FormDescription>This is the topic of your quiz.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="focusArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Focus Area (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Hooks, State management, Performance"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Specify a narrow area for more targeted quiz questions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="technology"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technology</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <span className="capitalize">
                        {field.value || 'Select technology'}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                    <SelectItem value="Next.js">Next.js</SelectItem>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="TypeScript">TypeScript</SelectItem>
                    <SelectItem value="HTML/CSS">HTML/CSS</SelectItem>
                    <SelectItem value="NodeJS">NodeJS</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Select the technology/framework for your quiz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col"
                >
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="Beginner" />
                    </FormControl>
                    <FormLabel className="font-normal">Beginner</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="Intermediate" />
                    </FormControl>
                    <FormLabel className="font-normal">Intermediate</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="Advanced" />
                    </FormControl>
                    <FormLabel className="font-normal">Advanced</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select the difficulty level of the quiz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Questions</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Specify the number of questions for the quiz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={generateAndStartMutation.isPending}>
          {generateAndStartMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            'Generate & Take Quiz'
          )}
        </Button>

        {generationError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            Error generating quiz: {generationError}
          </div>
        )}

        {generatedQuiz && !generationError && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
            Quiz generated successfully! Starting quiz session...
          </div>
        )}
      </form>
    </Form>
  );
}
