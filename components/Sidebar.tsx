import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
    activeMenu: string;
    setActiveMenu: (menu: string) => void;
}

// Define the type for the expanded state
type ExpandedState = {
    XVA: boolean;
    DANONE: boolean;
    MANDRILL_EMAIL: boolean;
};

// Define the allowed section keys
type SectionKey = keyof ExpandedState;

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
    const [expanded, setExpanded] = useState<ExpandedState>({
        XVA: true,
        DANONE: false,
        MANDRILL_EMAIL: false,
    });

    const toggleSection = (section: SectionKey) => {
        setExpanded((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <div className="w-64 bg-gray-100 h-screen p-4">
            <div className="text-xl font-bold mb-4">XVA LOGO</div>
            <nav>
                {/* XVA Section */}
                <div>
                    <div
                        className={`flex justify-between items-center p-2 cursor-pointer ${
                            activeMenu.startsWith('XVA') ? 'bg-white' : ''
                        }`}
                        onClick={() => toggleSection('XVA')}
                    >
                        <span className="flex items-center">
                            <span className="mr-2">🏠</span> XVA
                        </span>
                        <span>{expanded.XVA ? '▼' : '▶'}</span>
                    </div>
                    {expanded.XVA && (
                        <div className="ml-4">
                            {/* DEVELOPMENT Sub-menu */}
                            <div>
                                <div className="p-2 text-gray-500">DEVELOPMENT</div>
                                <Link
                                    to="/dashboard/ui-log/development"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_UI_LOG_DEVELOPMENT' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_UI_LOG_DEVELOPMENT')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    UI LOG
                                </Link>
                                <Link
                                    to="/dashboard/api-log/development"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_API_LOG_DEVELOPMENT' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_API_LOG_DEVELOPMENT')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    API LOG
                                </Link>
                                <Link
                                    to="/dashboard/database-backup/development"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_DATABASE_BACKUP_DEVELOPMENT' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_DATABASE_BACKUP_DEVELOPMENT')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    DATABASE BACKUP
                                </Link>
                                <Link
                                    to="/dashboard/godaddy-email/development"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_GODADDY_EMAIL_DEVELOPMENT' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_GODADDY_EMAIL_DEVELOPMENT')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    GO DADDY EMAIL
                                </Link>
                            </div>
                            {/* PRODUCTION Sub-menu */}
                            <div>
                                <div className="p-2 text-gray-500">PRODUCTION</div>
                                <Link
                                    to="/dashboard/ui-log/production"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_UI_LOG_PRODUCTION' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_UI_LOG_PRODUCTION')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    UI LOG
                                </Link>
                                <Link
                                    to="/dashboard/api-log/production"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_API_LOG_PRODUCTION' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_API_LOG_PRODUCTION')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    API LOG
                                </Link>
                                <Link
                                    to="/dashboard/database-backup/production"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_DATABASE_BACKUP_PRODUCTION' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_DATABASE_BACKUP_PRODUCTION')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    DATABASE BACKUP
                                </Link>
                                <Link
                                    to="/dashboard/godaddy-email/production"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'XVA_GODADDY_EMAIL_PRODUCTION' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('XVA_GODADDY_EMAIL_PRODUCTION')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    GO DADDY EMAIL
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* DANONE Section */}
                <div>
                    <div
                        className={`flex justify-between items-center p-2 cursor-pointer ${
                            activeMenu.startsWith('DANONE') ? 'bg-white' : ''
                        }`}
                        onClick={() => toggleSection('DANONE')}
                    >
                        <span className="flex items-center">
                            <span className="mr-2">🏭</span> DANONE
                        </span>
                        <span>{expanded.DANONE ? '▼' : '▶'}</span>
                    </div>
                    {expanded.DANONE && (
                        <div className="ml-4">
                            {/* STAGING Sub-menu */}
                            <div>
                                <div className="p-2 text-gray-500">STAGING</div>
                                <Link
                                    to="/dashboard/ui-log/staging"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'DANONE_UI_LOG_STAGING' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('DANONE_UI_LOG_STAGING')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    UI LOG
                                </Link>
                                <Link
                                    to="/dashboard/api-log/staging"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'DANONE_API_LOG_STAGING' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('DANONE_API_LOG_STAGING')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    API LOG
                                </Link>
                                <Link
                                    to="/dashboard/database-backup/staging"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'DANONE_DATABASE_BACKUP_STAGING' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('DANONE_DATABASE_BACKUP_STAGING')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    DATABASE BACKUP
                                </Link>
                            </div>
                            {/* PRODUCTION Sub-menu */}
                            <div>
                                <div className="p-2 text-gray-500">PRODUCTION</div>
                                <Link
                                    to="/dashboard/ui-log/production-danone"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'DANONE_UI_LOG_PRODUCTION' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('DANONE_UI_LOG_PRODUCTION')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    UI LOG
                                </Link>
                                <Link
                                    to="/dashboard/api-log/production-danone"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'DANONE_API_LOG_PRODUCTION' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('DANONE_API_LOG_PRODUCTION')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    API LOG
                                </Link>
                                <Link
                                    to="/dashboard/database-backup/production-danone"
                                    className={`block p-2 pl-6 ${
                                        activeMenu === 'DANONE_DATABASE_BACKUP_PRODUCTION' ? 'bg-white' : ''
                                    }`}
                                    onClick={() => setActiveMenu('DANONE_DATABASE_BACKUP_PRODUCTION')}
                                >
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    DATABASE BACKUP
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* MANDRILL EMAIL Section */}
                <div>
                    <div
                        className={`flex justify-between items-center p-2 cursor-pointer ${
                            activeMenu.startsWith('MANDRILL_EMAIL') ? 'bg-white' : ''
                        }`}
                        onClick={() => toggleSection('MANDRILL_EMAIL')}
                    >
                        <span className="flex items-center">
                            <span className="mr-2">📧</span> MANDRILL EMAIL
                        </span>
                        <span>{expanded.MANDRILL_EMAIL ? '▼' : '▶'}</span>
                    </div>
                    {expanded.MANDRILL_EMAIL && (
                        <div className="ml-4">
                            <Link
                                to="/dashboard/mandrill-activity"
                                className={`block p-2 pl-6 ${
                                    activeMenu === 'MANDRILL_EMAIL' ? 'bg-white' : ''
                                }`}
                                onClick={() => setActiveMenu('MANDRILL_EMAIL')}
                            >
                                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                MANDRILL ACTIVITY
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;