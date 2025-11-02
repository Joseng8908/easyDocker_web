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
function updateCodePreview() {
    // 1. TemplateGenerator를 사용하여 Dockerfile 코드 생성
    const dockerfileCode = TemplateGenerator.generateDockerfile(state.configData);
    
    // 2. DOM에 결과 출력
    const codeElement = document.getElementById(DOCKERFILE_PREVIEW_ID);
    
    // 템플릿 리터럴로 생성된 코드는 줄바꿈/공백이 포함되므로, 이를 그대로 출력
    codeElement.textContent = dockerfileCode; 
    
    // (선택 사항: Syntax Highlighting 라이브러리 사용 시, 여기서 활성화)
    // console.log(TemplateGenerator.generateMakefile(state.configData.step1.projectName));
}

function initializeApp() {
    console.log("앱 초기화 시작 - Vanilla JS Modules");
    
    // FormRenderer 인스턴스 생성 시, 프리뷰 업데이트 함수를 콜백으로 전달
    formRenderer = new FormRenderer(STEP_CONTAINER_ID, state.configData, updateCodePreview); 
    
    // ... (기존 이벤트 리스너 등록 로직 유지) ...

    // 첫 단계 렌더링 및 초기 프리뷰 업데이트
    renderCurrentStep();
    updateCodePreview(); // 앱 시작 시 초기값으로 한 번 실행
}

function renderCurrentStep() {
    // FormRenderer 모듈을 통해 현재 단계의 폼 렌더링 요청
    formRenderer.render(state.currentStep); 
    
    // 버튼 상태 업데이트 로직 (기존과 동일)
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    const prevButton = document.getElementById(PREV_BUTTON_ID);

    prevButton.disabled = state.currentStep === 1;
    // 다음 버튼 활성화 여부는 나중에 '유효성 검사' 결과에 따라 달라지도록 수정할 예정입니다.
    nextButton.disabled = state.currentStep === state.maxSteps; 
}

function handleNextStep() {
    if (state.currentStep < state.maxSteps) {
        // TODO: (중요) 다음 단계로 넘어가기 전, 현재 폼의 유효성 검사가 성공했는지 확인해야 함
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