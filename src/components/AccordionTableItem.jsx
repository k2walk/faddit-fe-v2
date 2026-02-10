import React, { useState } from 'react';

function AccordionTableItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <tbody className='text-sm'>
      <tr>
        <td className='px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5'>
          <div className='flex items-center text-gray-800'>
            <div className='mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mr-3 dark:bg-gray-700'>
              <img
                className='ml-1 rounded-full'
                src={props.image}
                width='40'
                height='40'
                alt={props.customer}
              />
            </div>
            <div className='font-medium text-gray-800 dark:text-gray-100'>{props.customer}</div>
          </div>
        </td>
        <td className='px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5'>
          <div className='text-left font-medium text-green-600'>{props.total}</div>
        </td>
        <td className='px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5'>
          <div className='inline-flex rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-center font-medium text-yellow-700'>
            {props.status}
          </div>
        </td>
        <td className='px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5'>
          <div className='text-center'>{props.items}</div>
        </td>
        <td className='px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5'>
          <div className='text-left'>{props.location}</div>
        </td>
        <td className='px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5'>
          <div className='flex items-center'>
            <svg
              className='mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500'
              width='16'
              height='16'
              viewBox='0 0 16 16'
            >
              <path d='M4.3 4.5c1.9-1.9 5.1-1.9 7 0 .7.7 1.2 1.7 1.4 2.7l2-.3c-.2-1.5-.9-2.8-1.9-3.8C10.1.4 5.7.4 2.9 3.1L.7.9 0 7.3l6.4-.7-2.1-2.1zM15.6 8.7l-6.4.7 2.1 2.1c-1.9 1.9-5.1 1.9-7 0-.7-.7-1.2-1.7-1.4-2.7l-2 .3c.2 1.5.9 2.8 1.9 3.8 1.4 1.4 3.1 2 4.9 2 1.8 0 3.6-.7 4.9-2l2.2 2.2.8-6.4z' />
            </svg>
            <div>{props.type}</div>
          </div>
        </td>
        <td className='w-px px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5'>
          <div className='flex items-center'>
            <button
              className={`text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 ${open && 'rotate-180'}`}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              aria-controls={`description-${props.id}`}
            >
              <span className='sr-only'>Menu</span>
              <svg className='h-8 w-8 fill-current' viewBox='0 0 32 32'>
                <path d='M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z' />
              </svg>
            </button>
          </div>
        </td>
      </tr>
      {/*
      Example of content revealing when clicking the button on the right side:
      Note that you must set a "colSpan" attribute on the <td> element,
      and it should match the number of columns in your table
      */}
      <tr id={`description-${props.id}`} role='region' className={`${!open && 'hidden'}`}>
        <td colSpan='10' className='px-2 py-3 first:pl-5 last:pr-5'>
          <div className='-mt-3 flex items-center bg-gray-50 p-3 dark:bg-gray-950/[0.15] dark:text-gray-400'>
            <svg
              className='mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500'
              width='16'
              height='16'
            >
              <path d='M1 16h3c.3 0 .5-.1.7-.3l11-11c.4-.4.4-1 0-1.4l-3-3c-.4-.4-1-.4-1.4 0l-11 11c-.2.2-.3.4-.3.7v3c0 .6.4 1 1 1zm1-3.6l10-10L13.6 4l-10 10H2v-1.6z' />
            </svg>
            <div className='italic'>{props.description}</div>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

export default AccordionTableItem;
