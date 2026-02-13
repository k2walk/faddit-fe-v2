import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import SidebarLinkGroup from './SidebarLinkGroup';

import LogoOnly from '../images/icons/faddit-logo-only.svg?react';

//icons svg from lucide
import { House } from 'lucide-react';
import { Search } from 'lucide-react';
import { MessagesSquare } from 'lucide-react';
import { FolderClosed } from 'lucide-react';
import { FolderOpen } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { ChevronUp } from 'lucide-react';

function Drivebar({ sidebarOpen, setSidebarOpen, variant = 'default' }) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target))
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector('body').classList.add('sidebar-expanded');
    } else {
      document.querySelector('body').classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <div className='min-w-fit'>
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/30 transition-opacity duration-200 lg:z-auto lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden='true'
      ></div>

      {/* Sidebar */}
      <div
        id='sidebar'
        ref={sidebar}
        className={`no-scrollbar lg:sidebar-expanded:!w-64 absolute top-0 left-0 z-40 flex h-[100dvh] w-64 shrink-0 flex-col overflow-y-scroll bg-gray-100 p-4 transition-all duration-200 ease-in-out lg:static lg:top-auto lg:left-auto lg:flex! lg:w-20 lg:translate-x-0 lg:overflow-y-auto 2xl:w-64! dark:bg-gray-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}
      >
        {/* Sidebar header */}
        <div className='mb-10 flex justify-between pr-3 sm:px-2'>
          {/* Close button */}
          <button
            ref={trigger}
            className='text-gray-500 hover:text-gray-400 lg:hidden'
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls='sidebar'
            aria-expanded={sidebarOpen}
          >
            <span className='sr-only'>Close sidebar</span>
            <svg
              className='h-6 w-6 fill-current'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z' />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to='/' className='block'>
            <LogoOnly className='h-[23px] w-[18px] fill-[#2f2f2f] dark:fill-[#fff]' />
          </NavLink>
        </div>

        {/* Links */}
        <div className='space-y-8'>
          {/* Pages group */}
          <div>
            <h3 className='pl-3 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500'>
              <span
                className='lg:sidebar-expanded:hidden hidden w-6 text-center lg:block 2xl:hidden'
                aria-hidden='true'
              >
                •••
              </span>
            </h3>
            <ul className='mt-3'>
              {/* Home */}
              <li
                className={`mb-3 rounded-lg bg-linear-to-r py-2 pr-3 pl-4 last:mb-0 ${
                  pathname === '/faddit/drive'
                    ? 'from-violet-500/[0.12] to-violet-500/[0.04] dark:from-violet-500/[0.24]'
                    : ''
                }`}
              >
                <NavLink
                  end
                  to='/faddit/drive'
                  className={`block truncate text-gray-800 transition duration-150 dark:text-gray-100 ${
                    pathname === '/faddit/drive' ? '' : 'hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className='flex items-center'>
                    <House
                      className={`shrink-0 ${
                        pathname === '/faddit/drive'
                          ? 'text-violet-500'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}
                      width='18'
                      height='18'
                      strokeWidth={3}
                    />
                    <span className='lg:sidebar-expanded:opacity-100 ml-3 text-sm font-bold duration-200 lg:opacity-0 2xl:opacity-100'>
                      홈
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Search */}
              <li
                className={`mb-3 rounded-lg bg-linear-to-r py-2 pr-3 pl-4 last:mb-0 ${
                  pathname === '/faddit/search'
                    ? 'from-violet-500/[0.12] to-violet-500/[0.04] dark:from-violet-500/[0.24]'
                    : ''
                }`}
              >
                <NavLink
                  end
                  to='/faddit/search'
                  className={`block truncate text-gray-800 transition duration-150 dark:text-gray-100 ${
                    pathname === '/faddit/search' ? '' : 'hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className='flex items-center'>
                    <Search
                      className={`shrink-0 ${
                        pathname === '/faddit/search'
                          ? 'text-violet-500'
                          : 'text-gray-400 dark:text-gray-400'
                      }`}
                      width='18'
                      height='18'
                      strokeWidth={3}
                    />
                    <span className='lg:sidebar-expanded:opacity-100 ml-3 text-sm font-bold duration-200 lg:opacity-0 2xl:opacity-100'>
                      검색
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* 수신함 */}
              <li
                className={`mb-3 rounded-lg bg-linear-to-r py-2 pr-3 pl-4 last:mb-0 ${pathname.includes('messages') && 'from-violet-500/[0.12] to-violet-500/[0.04] dark:from-violet-500/[0.24]'}`}
              >
                <NavLink
                  end
                  to='/messages'
                  className={`block truncate text-gray-800 transition duration-150 dark:text-gray-100 ${
                    pathname.includes('messages') ? '' : 'hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex grow items-center'>
                      <MessagesSquare
                        className={`shrink-0 ${
                          pathname === '/faddit/message'
                            ? 'text-violet-500'
                            : 'text-gray-400 dark:text-gray-400'
                        }`}
                        width='18'
                        height='18'
                        strokeWidth={3}
                      />
                      <span className='lg:sidebar-expanded:opacity-100 ml-3 text-sm font-bold duration-200 lg:opacity-0 2xl:opacity-100'>
                        수신함
                      </span>
                    </div>
                    {/* Badge */}
                    <div className='ml-2 flex shrink-0'>
                      <span className='bg-faddit inline-flex h-5 items-center justify-center rounded-sm px-2 text-xs font-medium text-white'>
                        4
                      </span>
                    </div>
                  </div>
                </NavLink>
              </li>

              {/* folder area */}
              <span className='lg:sidebar-expanded:block my-5 font-extrabold text-gray-400 lg:hidden 2xl:block'>
                워크스페이스
              </span>

              {Array.from({ length: 3 }).map((_, index) => (
                <SidebarLinkGroup
                  activecondition={pathname === '/' || pathname.includes('dashboard')}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href='#0'
                          className={`block truncate text-gray-800 transition duration-150 dark:text-gray-100 ${
                            pathname === '/' || pathname.includes('dashboard')
                              ? ''
                              : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              {open ? (
                                <FolderOpen
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-faddit dark:text-faddit'
                                />
                              ) : (
                                <FolderClosed
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-gray-400 dark:text-gray-500'
                                />
                              )}
                              <span className='lg:sidebar-expanded:opacity-100 ml-4 text-sm font-medium duration-200 lg:opacity-0 2xl:opacity-100'>
                                워크 스페이스 폴더 1
                              </span>
                            </div>
                            {/* Icon */}
                            <div className='ml-2 flex shrink-0'>
                              {open ? (
                                <ChevronUp
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-faddit dark:text-faddit'
                                />
                              ) : (
                                <ChevronDown
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-gray-400 dark:text-gray-500'
                                />
                              )}
                            </div>
                          </div>
                        </a>
                        {/**file area */}
                        <div className='lg:sidebar-expanded:block lg:hidden 2xl:block'>
                          <ul className={`mt-1 pl-8 ${!open && 'hidden'}`}>
                            <li className='my-1 last:mb-0'>
                              <NavLink
                                end
                                to='/'
                                className={({ isActive }) =>
                                  'block truncate transition duration-150 ' +
                                  (isActive
                                    ? 'text-violet-500'
                                    : 'text-gray-500/90 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200')
                                }
                              >
                                <span className='lg:sidebar-expanded:opacity-100 text-sm font-medium duration-200 lg:opacity-0 2xl:opacity-100'>
                                  작지 파일 1
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              ))}

              <span className='lg:sidebar-expanded:block my-5 font-extrabold text-gray-400 lg:hidden 2xl:block'>
                즐겨찾기
              </span>

              {Array.from({ length: 3 }).map((_, index) => (
                <SidebarLinkGroup
                  activecondition={pathname === '/' || pathname.includes('dashboard')}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href='#0'
                          className={`block truncate text-gray-800 transition duration-150 dark:text-gray-100 ${
                            pathname === '/' || pathname.includes('dashboard')
                              ? ''
                              : 'hover:text-gray-900 dark:hover:text-white'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              {open ? (
                                <FolderOpen
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-faddit dark:text-faddit'
                                />
                              ) : (
                                <FolderClosed
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-gray-400 dark:text-gray-500'
                                />
                              )}
                              <span className='lg:sidebar-expanded:opacity-100 ml-4 text-sm font-medium duration-200 lg:opacity-0 2xl:opacity-100'>
                                좋아하는 폴더 1
                              </span>
                            </div>
                            {/* Icon */}
                            <div className='ml-2 flex shrink-0'>
                              {open ? (
                                <ChevronUp
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-faddit dark:text-faddit'
                                />
                              ) : (
                                <ChevronDown
                                  width={16}
                                  height={16}
                                  strokeWidth={3}
                                  className='text-gray-400 dark:text-gray-500'
                                />
                              )}
                            </div>
                          </div>
                        </a>
                        {/**file area */}
                        <div className='lg:sidebar-expanded:block lg:hidden 2xl:block'>
                          <ul className={`mt-1 pl-8 ${!open && 'hidden'}`}>
                            <li className='my-1 last:mb-0'>
                              <NavLink
                                end
                                to='/'
                                className={({ isActive }) =>
                                  'block truncate transition duration-150 ' +
                                  (isActive
                                    ? 'text-violet-500'
                                    : 'text-gray-500/90 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200')
                                }
                              >
                                <span className='lg:sidebar-expanded:opacity-100 text-sm font-medium duration-200 lg:opacity-0 2xl:opacity-100'>
                                  작지 파일 1
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              ))}
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className='mt-auto hidden justify-end pt-3 lg:inline-flex 2xl:hidden'>
          <div className='w-12 py-2 pr-3 pl-4'>
            <button
              className='text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className='sr-only'>Expand / collapse sidebar</span>
              <svg
                className='sidebar-expanded:rotate-180 shrink-0 fill-current text-gray-400 dark:text-gray-500'
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 16 16'
              >
                <path d='M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z' />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Drivebar;
