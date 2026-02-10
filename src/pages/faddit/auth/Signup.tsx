import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ModalFooterBasic from '../../../components/ModalFooterBasic';
import ModalAction from '../../../components/ModalAction';
import { AGREEMENT_OPTIONS } from '../../../constants/agreements';

const Signup: React.FC = () => {
  const [agreements, setAgreements] = useState<{ [key: string]: boolean }>({});
  const [allAgreed, setAllAgreed] = useState(false);
  const [termModalOpen, setTermModalOpen] = useState(false);
  const [currentTermContent, setCurrentTermContent] = useState({ title: '', content: '' });
  const [currentTermId, setCurrentTermId] = useState<string>('');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Email Verification State
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const allRequiredAgreed = AGREEMENT_OPTIONS.every((option) =>
      option.required ? agreements[option.id] : true,
    );
    const allChecked = AGREEMENT_OPTIONS.every((option) => agreements[option.id]);
    setAllAgreed(allChecked);
  }, [agreements]);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handleAgreementChange = (id: string) => {
    setAgreements((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAllAgreementChange = () => {
    const newAgreements: { [key: string]: boolean } = {};
    const newState = !allAgreed;
    AGREEMENT_OPTIONS.forEach((option) => {
      newAgreements[option.id] = newState;
    });
    setAgreements(newAgreements);
    setAllAgreed(newState);
  };

  const openTermModal = (id: string, title: string, content: string) => {
    setCurrentTermId(id);
    setCurrentTermContent({ title, content });
    setTermModalOpen(true);
  };

  const handleTermModalConfirm = () => {
    if (currentTermId) {
      setAgreements((prev) => ({ ...prev, [currentTermId]: true }));
    }
    setTermModalOpen(false);
  };

  const isSignupDisabled = !AGREEMENT_OPTIONS.every((option) =>
    option.required ? agreements[option.id] : true,
  );

  // Email Verification Handlers
  const handleRequestVerification = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!email) return;
    setIsVerificationVisible(true);
    setTimeLeft(180);
    setIsTimerActive(true);
    setModalOpen(true);
  };

  const handleResend = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimeLeft(180);
    setIsTimerActive(true);
    setModalOpen(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <>
      <h1 className='text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6'>회원가입</h1>
      {/* Form */}
      <form>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1' htmlFor='name'>
              이름
            </label>
            <input id='name' className='form-input w-full' type='text' />
          </div>

          {/* Email Input with Verification */}
          <div>
            <label className='block text-sm font-medium mb-1' htmlFor='email'>
              이메일
            </label>
            <div className='relative'>
              <input
                id='email'
                className='form-input w-full pr-20'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type='button'
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium transition-colors ${
                  email
                    ? 'text-faddit hover:opacity-80 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleRequestVerification}
                disabled={!email}
              >
                인증하기
              </button>
            </div>

            {/* Verification Code Section */}
            {isVerificationVisible && (
              <div className='mt-2 flex items-center space-x-2'>
                <div className='relative w-full'>
                  <input
                    id='verificationCode'
                    className='form-input w-full'
                    type='text'
                    placeholder='인증번호 입력'
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-red-500'>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  type='button'
                  className='btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 whitespace-nowrap'
                  onClick={handleResend}
                >
                  재전송
                </button>
              </div>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium mb-1' htmlFor='password'>
              비밀번호
            </label>
            <input id='password' className='form-input w-full' type='password' autoComplete='on' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1' htmlFor='passwordConfirm'>
              비밀번호 확인
            </label>
            <input
              id='passwordConfirm'
              className='form-input w-full'
              type='password'
              autoComplete='on'
            />
          </div>
        </div>

        {/* Terms Agreement */}
        <div className='mt-6 border border-gray-200 dark:border-gray-700/60 rounded-lg p-4 bg-white dark:bg-gray-800 translate-y-0'>
          <div
            className='flex items-center justify-between cursor-pointer'
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          >
            <label
              className='flex items-center cursor-pointer'
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type='checkbox'
                className='form-checkbox'
                checked={allAgreed}
                onChange={handleAllAgreementChange}
              />
              <div
                className='text-sm font-medium ml-2 text-gray-800 dark:text-gray-100 select-none'
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              >
                전체 동의하기
              </div>
            </label>
            <button
              type='button'
              className={`ml-2 text-gray-400 hover:text-gray-500 transform transition-transform duration-200 ${
                isAccordionOpen ? 'rotate-180' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsAccordionOpen(!isAccordionOpen);
              }}
            >
              <svg className='w-4 h-4 fill-current' viewBox='0 0 16 16'>
                <path d='M8 12L2 6h12l-6 6z' />
              </svg>
            </button>
          </div>

          <div
            className={`space-y-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 ${
              !isAccordionOpen ? 'hidden' : ''
            }`}
          >
            {AGREEMENT_OPTIONS.map((option) => (
              <div key={option.id} className='flex flex-col ml-1'>
                <div className='flex items-center justify-between'>
                  <label className='flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      className='form-checkbox'
                      checked={!!agreements[option.id]}
                      onChange={() => handleAgreementChange(option.id)}
                    />
                    <span className='text-sm ml-2 text-gray-600 dark:text-gray-400'>
                      {option.required ? (
                        <span className='text-faddit font-medium mr-1'>[필수]</span>
                      ) : (
                        <span className='text-gray-400 font-medium mr-1'>[선택]</span>
                      )}
                      {option.label}
                    </span>
                  </label>
                </div>
                {option.links && (
                  <div className='ml-6 mt-1 flex flex-wrap gap-2'>
                    {option.links.map((link, idx) => (
                      <button
                        key={idx}
                        type='button'
                        className='text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline text-left'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openTermModal(option.id, link.text, link.contents);
                        }}
                      >
                        {link.text} &gt;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-center justify-between mt-6'>
          <button
            className={`btn w-full ${
              isSignupDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white'
            }`}
            type='submit'
            disabled={isSignupDisabled}
          >
            회원가입
          </button>
        </div>
      </form>
      {/* Footer */}
      <div className='pt-5 mt-6 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-sm'>
        <div>이미 계정이 있으신가요?</div>
        <Link
          className='font-medium text-faddit hover:opacity-80 transition-opacity'
          to='/faddit/sign/in'
        >
          로그인 바로가기
        </Link>
      </div>

      {/* Term Modal */}
      <ModalFooterBasic
        id='scrollbar-modal'
        modalOpen={termModalOpen}
        setModalOpen={setTermModalOpen}
        title={currentTermContent.title}
        footer={
          <div className='px-5 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700/60'>
            <div className='flex flex-wrap justify-end space-x-2'>
              <button
                className='btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  setTermModalOpen(false);
                }}
              >
                취소
              </button>
              <button
                className='btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  handleTermModalConfirm();
                }}
              >
                확인
              </button>
            </div>
          </div>
        }
      >
        <div className='px-5 py-4'>
          <div className='text-sm'>
            <div className='space-y-2'>
              <p className='whitespace-pre-line text-gray-600 dark:text-gray-400'>
                {currentTermContent.content}
              </p>
            </div>
          </div>
        </div>
      </ModalFooterBasic>

      {/* Email Verification Modal */}
      <ModalAction id='verification-modal' modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <div className='p-4 text-center'>
          <div className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2'>
            이메일 인증 번호를 발송하였습니다.
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
            입력하신 메일로 수신하신 번호를 확인 후
            <br />
            인증번호를 입력하여 인증을 완료하세요.
          </p>
          <button
            className='btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white w-full'
            onClick={() => setModalOpen(false)}
          >
            확인
          </button>
        </div>
      </ModalAction>
    </>
  );
};
export default Signup;
