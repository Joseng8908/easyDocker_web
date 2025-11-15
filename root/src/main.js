// ===========================================
// src/main.js
// ===========================================
import { FormRenderer } from './components/FormRenderer.js'; // 모듈 import
import { TemplateGenerator } from './services/TemplateGenerator.js'; // 모듈 import
// 필요한 DOM 요소 ID (기존과 동일)
const DOCKERFILE_PREVIEW_ID = 'dockerfile-code';
const STEP_CONTAINER_ID = 'step-container';
const NEXT_BUTTON_ID = 'next-step';
const PREV_BUTTON_ID = 'prev-step';

// 앱의 상태를 저장할 객체
const state = {
    currentStep: 1,
    maxSteps: 4, 
    configData: {} // 모든 설정 데이터가 저장될 곳
};

// 모듈 인스턴스 변수
let formRenderer; 

// ===========================================
// 초기화 함수 및 이벤트 리스너 설정
// ===========================================
/**
 * 현재 configData를 기반으로 코드를 생성하고 프리뷰 영역을 업데이트합니다.
 */
function updateCodePreview(configData) {
    const safeConfig = configData || {};

    const generator = new TemplateGenerator();
    let dockerfileContent = '';
    let makefileContent = ''; // 💡 Makefile 변수 추가

    // Step 1과 2가 완료되었을 때 Dockerfile 생성 가능
    if (safeConfig.step1 && safeConfig.step2) { 
        dockerfileContent = generator.generateDockerfile(safeConfig);
    }
    
    // Step 3이 완료되었을 때 Makefile 생성 가능 (Step 1, 2가 필수)
    if (safeConfig.step1 && safeConfig.step2 && safeConfig.step3) {
        makefileContent = generator.generateMakefile(safeConfig);
    }

    // Dockerfile 프리뷰 업데이트 (이전 로직 유지)
    const dockerfileElement = document.getElementById('dockerfile-preview');
    if (dockerfileElement) {
        dockerfileElement.textContent = dockerfileContent || 'Dockerfile 코드가 여기에 표시됩니다.';
    }

    // 💡 Makefile 프리뷰 업데이트
    const makefileElement = document.getElementById('makefile-preview');
    if (makefileElement) {
        makefileElement.textContent = makefileContent || 'Makefile 코드가 여기에 표시됩니다.';
    }

    // ... (이후의 기타 업데이트 로직)
}

function setNextButtonDisabledState(isValid) {
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    if (state.currentStep < state.maxSteps) {
        nextButton.disabled = !isValid; //유효하지 않으면 disables를 true로 설정
    } else {
        nextButton.disabled = true; //마지막 단계에서는 항상 비활성화
    }
}

function initializeApp() {
    console.log("앱 초기화 시작 - Vanilla JS Modules");
    
    // FormRenderer 인스턴스 생성 시, 프리뷰 업데이트 함수를 콜백으로 전달
    formRenderer = new FormRenderer(
        STEP_CONTAINER_ID, 
        state.configData, 
        updateCodePreview,
        setNextButtonDisabledState
    ); 
    
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    const prevButton = document.getElementById(PREV_BUTTON_ID);

    nextButton.addEventListener('click', handleNextStep);
    prevButton.addEventListener('click', handlePrevStep);

    // 첫 단계 렌더링 및 초기 프리뷰 업데이트
    renderCurrentStep();
    updateCodePreview(state.configData);
}

function renderCurrentStep() {
    // FormRenderer 모듈을 통해 현재 단계의 폼 렌더링 요청
    state.configData.currentStep = state.currentStep; // 현재 단계를 configData에 반영
    formRenderer.render(state.currentStep); 
    
    // 버튼 상태 업데이트 로직 (기존과 동일)
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    const prevButton = document.getElementById(PREV_BUTTON_ID);
    prevButton.disabled = state.currentStep === 1;

    // '다음' 버튼 상태는 현재 단계의 유효성 검사 결과에 따라 결정
    if (state.currentStep < state.maxSteps) {
        formRenderer.validateAndShowFeedback(state.configData[`step${state.currentStep}`], state.currentStep);
    } else {
        setNextButtonDisabledState(false); // 마지막 단계에서는 비활성화
    }

    
}

function handleNextStep() {
    if (!formRenderer.validateForNextStep()) {
        return; // 유효성 검사 실패 시 다음 단계로 진행하지 않음
    }
    if (state.currentStep < state.maxSteps) {
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