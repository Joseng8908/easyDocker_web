// 필요한 DOM 요소 ID
const DOCKERFILE_PREVIEW_ID = 'dockerfile-code';
const STEP_CONTAINER_ID = 'step-container';
const NEXT_BUTTON_ID = 'next-step';
const PREV_BUTTON_ID = 'prev-step';

// 앱의 상태를 저장할 객체 (현재 단계, 설정 데이터 등)
const state = {
    currentStep: 1,
    maxSteps: 4, // Step 4는 결과 확인 및 다운로드
    configData: {} // 사용자가 입력한 모든 설정이 여기에 저장됨
};

// ===========================================
// 임시: 초기화 함수 및 이벤트 리스너 설정
// ===========================================

function initializeApp() {
    console.log("앱 초기화 시작 - Vanilla JS Modules");
    
    // DOM 요소 가져오기
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    const prevButton = document.getElementById(PREV_BUTTON_ID);

    // 이벤트 리스너 등록 (임시 로직)
    nextButton.addEventListener('click', handleNextStep);
    prevButton.addEventListener('click', handlePrevStep);

    // 첫 단계 렌더링 (실제 FormRenderer 모듈로 대체될 예정)
    renderCurrentStep();
}

function renderCurrentStep() {
    const stepContainer = document.getElementById(STEP_CONTAINER_ID);
    // 임시로 현재 단계를 표시
    stepContainer.innerHTML = `<h2>Step ${state.currentStep}</h2><p>이곳에 설정 폼이 들어갑니다.</p>`;

    // 버튼 상태 업데이트
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    const prevButton = document.getElementById(PREV_BUTTON_ID);

    prevButton.disabled = state.currentStep === 1;
    nextButton.disabled = state.currentStep === state.maxSteps;
}

function handleNextStep() {
    if (state.currentStep < state.maxSteps) {
        // 실제 구현에서는 여기서 현재 단계 폼 유효성 검사 로직이 들어갑니다.
        state.currentStep++;
        renderCurrentStep();
    }
}

function handlePrevStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        renderCurrentStep();
    }
}

// 앱 시작
initializeApp();