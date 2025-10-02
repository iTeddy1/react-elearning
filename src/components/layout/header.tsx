import { cn } from '@/lib/utils';
import { Link, NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Learning', href: '/learning' },
  { name: 'Practice', href: '/practice' },
  { name: 'Articles', href: '/articles' },
];

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">ReactLearn</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'text-gray-500 hover:text-gray-900',
                  'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200'
                )}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Profile/Login */}
          <div className="flex items-center">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
