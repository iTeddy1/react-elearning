import { Route, Routes } from 'react-router-dom';
import Articles from '@/features/articles/pages/articles';
import Home from '@/features/home/pages/home';
import Learning from '@/features/learning/pages/learning';
import LessonDetail from '@/features/learning/pages/lesson-detail';
import Practice from '@/features/practice/pages/practice';
import QuizTaking from '@/features/practice/pages/quiz-taking';
import { InterviewSetupPage } from '@/features/interview/pages/InterviewSetupPage';
import { InterviewPage } from '@/features/interview/pages/InterviewPage';

const Router = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/learning" element={<Learning />} />
    <Route path="/learning/:topicId" element={<LessonDetail />} />
    <Route path="/practice" element={<Practice />} />
    <Route path="/practice/:quizId" element={<QuizTaking />} />
    <Route path="/articles" element={<Articles />} />
    <Route path="/interview/setup" element={<InterviewSetupPage />} />
    <Route path="/interview" element={<InterviewPage />} />
  </Routes>
);

export default Router;
