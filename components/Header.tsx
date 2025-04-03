// components/Sidebar.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface MenuSection {
  name: string;
  subItems: { name: string; link: string; active: boolean }[];
}

const Sidebar: React.FC = () => {
  const [xvaExpanded, setXvaExpanded] = useState<boolean>(true);
  const [danoneExpanded, setDanoneExpanded] = useState<boolean>(true);
  const router = useRouter();

  const menuSections: MenuSection[] = [
    {
      name: 'XVA',
      subItems: [
        { name: 'DEVELOPMENT', link: '', active: false },
        { name: 'UI LOG', link: '/ui-log?env=dev&platform=XVA', active: true },
        { name: 'API LOG', link: '/api-log?env=dev&platform=XVA', active: true },
        { name: 'DATABASE BACKUP', link: '/database-backup?env=dev&platform=XVA', active: true },
        { name: 'PRODUCTION', link: '', active: false },
        { name: 'UI LOG', link: '/ui-log?env=prod&platform=XVA', active: true },
        { name: 'API LOG', link: '/api-log?env=prod&platform=XVA', active: true },
        { name: 'DATABASE BACKUP', link: '/database-backup?env=prod&platform=XVA', active: true },
        { name: 'GO DADDY EMAIL', link: '', active: false },
      ],
    },
    {
      name: 'DANONE',
      subItems: [
        { name: 'STAGING', link: '', active: false },
        { name: 'UI LOG', link: '', active: false },
        { name: 'API LOG', link: '', active: false },
        { name: 'DATABASE BACKUP', link: '', active: false },
        { name: 'PRODUCTION', link: '', active: false },
        { name: 'UI LOG', link: '', active: false },
        { name: 'API LOG', link: '', active: false },
        { name: 'DATABASE BACKUP', link: '', active: false },
      ],
    },
    { name: 'MANDRILL EMAIL', subItems: [{ name: '', link: '/mandrill-email', active: true }] },
  ];

  return (
    <div className="w-64 h-screen bg-gray-200 p-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">XVA LOGO</h1>
      </div>
      <nav>
        <ul>
          {menuSections.map((section, index) => (
            <li key={index}>
              <div
                className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-300 ${
                  section.subItems.some((subItem) => subItem.link === router.asPath)
                    ? 'bg-gray-300 font-bold'
                    : ''
                }`}
                onClick={() =>
                  section.name === 'XVA'
                    ? setXvaExpanded(!xvaExpanded)
                    : section.name === 'DANONE'
                    ? setDanoneExpanded(!danoneExpanded)
                    : null
                }
              >
                <span className="flex items-center">
                  {section.name === 'XVA' && <span className="mr-2">🏠</span>}
                  {section.name === 'DANONE' && <span className="mr-2">🏭</span>}
                  {section.name}
                </span>
                {section.subItems.length > 1 && (
                  <span>
                    {section.name === 'XVA' ? (xvaExpanded ? '▼' : '▶') : (danoneExpanded ? '▼' : '▶')}
                  </span>
                )}
              </div>
              {(section.name === 'XVA' ? xvaExpanded : section.name === 'DANONE' ? danoneExpanded : true) && (
                <ul className="ml-4">
                  {section.subItems.map((subItem, subIndex) => (
                    <li key={subIndex} className="p-2">
                      {subItem.active ? (
                        <Link href={subItem.link}>
                          <a
                            className={`flex items-center hover:bg-gray-300 ${
                              router.asPath === subItem.link ? 'bg-gray-300 font-bold' : ''
                            }`}
                          >
                            <span className="mr-2">{router.asPath === subItem.link ? '●' : '○'}</span>
                            {subItem.name}
                          </a>
                        </Link>
                      ) : (
                        <span className="text-gray-500">{subItem.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;