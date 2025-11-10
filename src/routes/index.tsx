import { Route, Routes } from 'react-router-dom';
import Home from '@/features/home/pages/home';
import Practice from '@/features/practice/pages/practice';
import QuizTaking from '@/features/practice/pages/quiz-taking';
import { InterviewSetupPage } from '@/features/interview/pages/InterviewSetupPage';
import { InterviewPage } from '@/features/interview/pages/InterviewPage';

const Router = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/practice" element={<Practice />} />
    <Route path="/practice/:quizId" element={<QuizTaking />} />
    <Route path="/interview/setup" element={<InterviewSetupPage />} />
    <Route path="/interview" element={<InterviewPage />} />
  </Routes>
);

export default Router;
